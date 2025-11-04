<?php
/**
 * Polylang 언어 추가 스크립트
 * 한국어(ko)와 영어(en)를 자동으로 추가합니다.
 *
 * 실행 방법:
 * sudo -u www-data wp eval-file add-languages.php
 */

// WordPress 환경 로드 (WP-CLI에서 실행 시 자동으로 로드됨)
// require_once('/var/www/DOMAIN/htdocs/wp-load.php');

// Polylang 함수가 존재하는지 확인
if (!function_exists('pll_languages_list')) {
    echo "Error: Polylang 플러그인이 활성화되지 않았습니다.\n";
    exit(1);
}

if (!function_exists('pll_add_language')) {
    echo "Error: pll_add_language() 함수를 사용할 수 없습니다.\n";
    exit(1);
}

echo "Polylang 언어 추가 시작...\n";
echo "-------------------------------\n";

// 기존 언어 목록 가져오기
$existing_languages = pll_languages_list();
echo "기존 언어: " . (empty($existing_languages) ? "없음" : implode(', ', $existing_languages)) . "\n";
echo "\n";

// 한국어 추가
if (!in_array('ko', $existing_languages)) {
    echo "한국어(ko) 추가 중...\n";
    $result = pll_add_language([
        'name' => '한국어',
        'slug' => 'ko',
        'locale' => 'ko_KR',
        'rtl' => 0,
        'flag' => 'kr',
        'term_group' => 0, // 언어 순서
    ]);

    if (is_wp_error($result)) {
        echo "Error: 한국어 추가 실패 - " . $result->get_error_message() . "\n";
        exit(1);
    } else {
        echo "✅ 한국어 추가 완료!\n";
    }
} else {
    echo "✓ 한국어가 이미 존재합니다.\n";
}

// 영어 추가
if (!in_array('en', $existing_languages)) {
    echo "영어(en) 추가 중...\n";
    $result = pll_add_language([
        'name' => 'English',
        'slug' => 'en',
        'locale' => 'en_US',
        'rtl' => 0,
        'flag' => 'us',
        'term_group' => 1, // 언어 순서
    ]);

    if (is_wp_error($result)) {
        echo "Error: 영어 추가 실패 - " . $result->get_error_message() . "\n";
        exit(1);
    } else {
        echo "✅ 영어 추가 완료!\n";
    }
} else {
    echo "✓ 영어가 이미 존재합니다.\n";
}

// 기본 언어를 한국어로 설정
echo "\n기본 언어를 한국어로 설정 중...\n";
$options = get_option('polylang');
if ($options) {
    $options['default_lang'] = 'ko';
    update_option('polylang', $options);
    echo "✅ 기본 언어 설정 완료!\n";
} else {
    echo "Warning: Polylang 옵션을 찾을 수 없습니다. 수동으로 설정해주세요.\n";
}

// 최종 언어 목록 확인
echo "\n최종 언어 목록:\n";
$final_languages = pll_languages_list();
foreach ($final_languages as $lang_slug) {
    $lang = PLL()->model->get_language($lang_slug);
    $is_default = ($lang_slug === 'ko') ? ' (기본)' : '';
    echo "  - {$lang->name} ({$lang_slug}){$is_default}\n";
}

echo "\n✅ 언어 설정 완료!\n";
exit(0);
?>
