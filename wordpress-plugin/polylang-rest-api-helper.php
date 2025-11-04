<?php
/**
 * Plugin Name: Polylang REST API Helper
 * Description: WordPress 커스텀 REST API endpoint로 Polylang translation 연결 지원
 * Version: 1.0.0
 * Author: Blog Automation
 *
 * 이 플러그인은 Polylang 무료 버전에서 REST API를 통해 translation을 연결할 수 있게 합니다.
 * Polylang Pro 없이도 programmatic translation linking이 가능합니다.
 */

// WordPress 직접 접근 방지
if (!defined('ABSPATH')) {
  exit;
}

/**
 * 커스텀 REST API endpoint 등록
 * POST /wp-json/polylang-helper/v1/link-translations
 */
add_action('rest_api_init', function () {
  register_rest_route('polylang-helper/v1', '/link-translations', [
    'methods' => 'POST',
    'callback' => 'pll_helper_link_translations',
    'permission_callback' => function () {
      // 인증된 사용자만 접근 가능
      return current_user_can('edit_posts');
    },
    'args' => [
      'ko_post_id' => [
        'required' => true,
        'type' => 'integer',
        'description' => '한국어 포스트 ID',
      ],
      'en_post_id' => [
        'required' => true,
        'type' => 'integer',
        'description' => '영어 포스트 ID',
      ],
    ],
  ]);
});

/**
 * Translation 연결 처리 함수
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function pll_helper_link_translations($request)
{
  // Polylang 활성화 확인
  if (!function_exists('pll_set_post_language') || !function_exists('pll_save_post_translations')) {
    return new WP_Error(
      'polylang_not_active',
      'Polylang plugin is not active or functions are not available.',
      ['status' => 500]
    );
  }

  $ko_post_id = $request->get_param('ko_post_id');
  $en_post_id = $request->get_param('en_post_id');

  // 포스트 존재 확인
  $ko_post = get_post($ko_post_id);
  $en_post = get_post($en_post_id);

  if (!$ko_post) {
    return new WP_Error(
      'invalid_ko_post',
      "Korean post ID {$ko_post_id} does not exist.",
      ['status' => 404]
    );
  }

  if (!$en_post) {
    return new WP_Error(
      'invalid_en_post',
      "English post ID {$en_post_id} does not exist.",
      ['status' => 404]
    );
  }

  try {
    // 1. 각 포스트에 언어 설정
    pll_set_post_language($ko_post_id, 'ko');
    pll_set_post_language($en_post_id, 'en');

    // 2. Translation 연결 (양방향)
    pll_save_post_translations([
      'ko' => $ko_post_id,
      'en' => $en_post_id,
    ]);

    // 성공 응답
    return new WP_REST_Response([
      'success' => true,
      'message' => 'Translation linked successfully',
      'data' => [
        'ko_post' => [
          'id' => $ko_post_id,
          'title' => $ko_post->post_title,
          'language' => 'ko',
        ],
        'en_post' => [
          'id' => $en_post_id,
          'title' => $en_post->post_title,
          'language' => 'en',
        ],
      ],
    ], 200);
  } catch (Exception $e) {
    return new WP_Error(
      'link_failed',
      'Failed to link translations: ' . $e->getMessage(),
      ['status' => 500]
    );
  }
}

/**
 * REST API 응답 시 자동 연결 (선택적 기능)
 * publish 명령어에서 --link-to 파라미터를 전달할 때 자동으로 연결
 */
add_filter('rest_pre_echo_response', function ($response, $object, $request) {
  // 포스트 생성/업데이트 응답인지 확인
  if (!isset($response['id']) || !isset($response['type']) || $response['type'] !== 'post') {
    return $response;
  }

  $post_id = $response['id'];
  $link_to = $request->get_param('link_to'); // --link-to 파라미터
  $lang = $request->get_param('lang'); // 언어 코드

  // link_to 파라미터가 있고 Polylang이 활성화된 경우
  if ($link_to && function_exists('pll_set_post_language') && function_exists('pll_save_post_translations')) {
    // 현재 포스트와 연결할 포스트의 존재 확인
    $linked_post = get_post($link_to);
    if ($linked_post) {
      try {
        // 언어 설정 및 translation 연결
        if ($lang === 'ko') {
          pll_set_post_language($post_id, 'ko');
          pll_set_post_language($link_to, 'en');
          pll_save_post_translations([
            'ko' => $post_id,
            'en' => $link_to,
          ]);
        } elseif ($lang === 'en') {
          pll_set_post_language($post_id, 'en');
          pll_set_post_language($link_to, 'ko');
          pll_save_post_translations([
            'ko' => $link_to,
            'en' => $post_id,
          ]);
        }

        // 응답에 연결 정보 추가
        $response['translation_linked'] = true;
        $response['linked_post_id'] = $link_to;
      } catch (Exception $e) {
        // 에러가 발생해도 포스트 생성은 성공이므로 응답은 반환
        $response['translation_link_error'] = $e->getMessage();
      }
    }
  }

  return $response;
}, 10, 3);
