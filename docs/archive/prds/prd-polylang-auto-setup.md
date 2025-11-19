# PRD: Polylang 자동 설정 스크립트

## Introduction

### 문제점

현재 WordPress 설치 스크립트는 Avada 테마까지는 자동으로 설치하지만, Polylang 다국어 플러그인 및 커스텀 REST API Helper 플러그인은 수동으로 설치해야 합니다. 이로 인해:

1. **수동 작업 필요**: WordPress 관리자에서 플러그인을 수동으로 설치하고 활성화해야 함
2. **언어 설정 수동**: 한국어/영어 언어를 수동으로 추가하고 설정해야 함
3. **커스텀 플러그인 수동 업로드**: Polylang REST API Helper 플러그인을 ZIP으로 수동 업로드해야 함
4. **일관성 부족**: 설치할 때마다 수동 단계가 달라질 수 있음

### 해결책

WordPress 설치 스크립트에 Polylang 설정을 완전 자동화하는 단계를 추가합니다:

1. **Polylang 무료 플러그인 자동 설치**: WP-CLI로 WordPress.org에서 설치
2. **언어 자동 설정**: 한국어(ko_KR)와 영어(en_US) 자동 추가
3. **커스텀 플러그인 자동 설치**: Polylang REST API Helper 자동 배포
4. **설정 검증**: 설치 후 자동으로 작동 여부 확인

### 목표

`blog publish --link-to` 명령이 즉시 작동하는 완전 자동화된 WordPress 환경을 5-10분 내에 구축합니다.

---

## Goals

1. **완전 자동화**: Polylang 설정에 수동 개입 0회
2. **즉시 사용 가능**: 설치 완료 즉시 `blog publish --link-to` 명령 사용 가능
3. **안정성**: WP-CLI와 검증된 Polylang 설치 방법 사용
4. **유지보수성**: 커스텀 플러그인 업데이트 시 스크립트만 실행하면 배포
5. **에러 처리**: 각 단계별 실패 시 명확한 에러 메시지 제공

---

## User Stories

1. **블로거로서**, WordPress 설치 시 Polylang이 자동으로 설정되기를 원합니다.
   - **혜택**: 수동으로 플러그인을 찾고 설치할 필요 없음

2. **블로거로서**, 한국어와 영어가 자동으로 설정되기를 원합니다.
   - **혜택**: WordPress 관리자에서 언어를 일일이 추가할 필요 없음

3. **블로거로서**, CLI에서 `blog publish --link-to` 명령이 즉시 작동하기를 원합니다.
   - **혜택**: Polylang REST API Helper가 자동 설치되어 추가 설정 불필요

4. **블로거로서**, 설치 중 에러 발생 시 무엇이 잘못되었는지 명확히 알고 싶습니다.
   - **혜택**: 각 단계별 검증과 명확한 에러 메시지

---

## Functional Requirements

### 1. Polylang 플러그인 설치

- **REQ-1.1**: WP-CLI를 사용하여 Polylang 무료 버전을 WordPress.org에서 자동으로 설치한다.
- **REQ-1.2**: 설치 후 Polylang 플러그인을 자동으로 활성화한다.
- **REQ-1.3**: Polylang 버전을 확인하여 설치 성공 여부를 검증한다.

### 2. 언어 설정

- **REQ-2.1**: 한국어(ko_KR) 언어를 추가하고 기본 언어로 설정한다.
- **REQ-2.2**: 영어(en_US) 언어를 추가한다.
- **REQ-2.3**: 언어 코드(slug)를 각각 'ko', 'en'으로 설정한다.
- **REQ-2.4**: Polylang CLI 또는 WordPress Option API를 사용하여 설정한다.

### 3. Polylang REST API Helper 플러그인 설치

- **REQ-3.1**: `/wordpress-plugin/polylang-rest-api-helper.php` 파일을 WordPress 플러그인 디렉토리로 복사한다.
- **REQ-3.2**: 복사한 플러그인을 자동으로 활성화한다.
- **REQ-3.3**: REST API endpoint(`/wp-json/polylang-helper/v1/link-translations`)가 작동하는지 검증한다.

### 4. 설정 검증

- **REQ-4.1**: Polylang 플러그인이 활성화되어 있는지 확인한다.
- **REQ-4.2**: 한국어와 영어 언어가 올바르게 추가되었는지 확인한다.
- **REQ-4.3**: Polylang REST API Helper 플러그인이 활성화되어 있는지 확인한다.
- **REQ-4.4**: REST API endpoint에 테스트 요청을 보내 응답을 확인한다.

### 5. 에러 처리

- **REQ-5.1**: 각 단계별 실패 시 명확한 에러 메시지를 출력한다.
- **REQ-5.2**: 실패한 단계부터 재실행할 수 있도록 스크립트를 설계한다.
- **REQ-5.3**: 이미 설치된 경우 스킵하거나 재설정 여부를 물어본다.

---

## Non-Goals (Out of Scope)

1. **Polylang Pro 설치**: 무료 버전만 지원하며, Pro 기능은 범위 밖
2. **3개 이상 언어 지원**: 한국어/영어 2개 언어만 자동 설정
3. **Polylang 고급 설정**: 기본 언어 설정만 하며, URL 구조 등은 기본값 사용
4. **번역 자동화**: 콘텐츠 번역은 별도 기능 (`blog translate`)
5. **기존 WordPress 마이그레이션**: 새로 설치하는 경우만 지원

---

## Technical Considerations

### 스크립트 구조

```
scripts/wordpress-setup/
├── config.sh                           # 설정 변수
├── setup.sh                            # 메인 오케스트레이터
├── setup-wordops.sh                    # WordPress 기본 설치
├── setup-theme.sh                      # Avada 테마 설치
├── setup-polylang.sh                   # ← 새로 추가: Polylang 설정
└── polylang-rest-api-helper.php        # ← 새로 추가: 커스텀 플러그인
```

### WP-CLI 명령어

**플러그인 설치**:
```bash
sudo -u www-data wp plugin install polylang --activate
```

**언어 추가** (Polylang CLI):
```bash
# Polylang 3.0+ 는 WP-CLI 지원하지만, 언어 추가는 WordPress Option 직접 수정 필요
# 또는 PHP 스크립트로 pll_add_language() 함수 호출
```

**플러그인 활성화 확인**:
```bash
sudo -u www-data wp plugin list --status=active
```

**REST API 테스트**:
```bash
curl -X POST -u "$ADMIN_USER:$ADMIN_PASSWORD" \
  "https://$DOMAIN/wp-json/polylang-helper/v1/link-translations" \
  -H "Content-Type: application/json" \
  -d '{"ko_post_id": 1, "en_post_id": 1}'
```

### Polylang 언어 설정 방법

Polylang 무료 버전은 WP-CLI로 언어를 직접 추가하는 명령이 없으므로, 다음 방법 중 하나 사용:

**방법 1: PHP 스크립트 실행** (권장)
```php
<?php
// add-languages.php
require_once('/var/www/DOMAIN/htdocs/wp-load.php');

$languages = pll_languages_list();

if (!in_array('ko', $languages)) {
    pll_add_language([
        'name' => '한국어',
        'slug' => 'ko',
        'locale' => 'ko_KR',
        'rtl' => 0,
        'flag' => 'kr',
    ]);
}

if (!in_array('en', $languages)) {
    pll_add_language([
        'name' => 'English',
        'slug' => 'en',
        'locale' => 'en_US',
        'rtl' => 0,
        'flag' => 'us',
    ]);
}

echo "Languages added successfully\n";
?>
```

```bash
php add-languages.php
```

**방법 2: WP-CLI PHP 실행**
```bash
sudo -u www-data wp eval-file add-languages.php
```

### 실행 순서

```bash
# setup.sh 수정
1. setup-wordops.sh
2. setup-theme.sh
3. setup-polylang.sh  ← 새로 추가
```

---

## Success Metrics

### 기술적 지표

1. **설치 소요 시간**: +2분 추가 (기존 5-10분 → 7-12분)
2. **자동화율**: 100% (수동 개입 0회)
3. **설치 성공률**: 100% (단일 환경)
4. **REST API 응답 시간**: <500ms

### 사용자 만족도 지표

1. **설정 복잡도**: 매우 낮음 (스크립트 실행만)
2. **즉시 사용 가능**: 설치 완료 즉시 `blog publish --link-to` 사용 가능
3. **에러 발생률**: <1%

---

## Open Questions

1. **Polylang 언어 추가 방법**: PHP 스크립트 vs. 데이터베이스 직접 수정?
   - **답변**: PHP 스크립트 사용 (안전하고 Polylang API 활용)

2. **기존 설치 감지**: Polylang이 이미 설치된 경우?
   - **답변**: 스킵하고 언어 설정만 확인/업데이트

3. **REST API Helper 업데이트**: 플러그인 코드가 변경된 경우?
   - **답변**: 스크립트 재실행 시 덮어쓰기 (버전 관리 없음)

---

## Implementation Notes

### setup-polylang.sh 구조

```bash
#!/bin/bash
set -euo pipefail

# [1/4] Polylang 플러그인 설치
# [2/4] 언어 설정 (PHP 스크립트 실행)
# [3/4] Polylang REST API Helper 설치
# [4/4] 설정 검증
```

### 에러 처리

각 단계에서 실패 시:
- 명확한 에러 메시지 출력
- 수동 해결 방법 안내
- 다음 단계는 실행하지 않음 (exit 1)

---

## 참고 자료

- [WP-CLI Plugin 명령어](https://developer.wordpress.org/cli/commands/plugin/)
- [Polylang 문서](https://polylang.wordpress.com/documentation/)
- [Polylang Functions Reference](https://polylang.wordpress.com/documentation/documentation-for-developers/functions-reference/)
- 우리가 개발한 Polylang REST API Helper: `/wordpress-plugin/polylang-rest-api-helper.php`

---

**파일명**: `prd-polylang-auto-setup.md`
**버전**: v1
**마지막 업데이트**: 2025-11-04
**담당자**: 블로거 본인 (개발자)
