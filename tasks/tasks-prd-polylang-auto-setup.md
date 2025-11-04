# Tasks: Polylang 자동 설정 스크립트

## Relevant Files

- `scripts/wordpress-setup/setup-polylang.sh` - Polylang 자동 설정 메인 스크립트 (새로 생성)
- `scripts/wordpress-setup/setup.sh` - 메인 오케스트레이터 (수정: setup-polylang.sh 호출 추가)
- `scripts/wordpress-setup/add-languages.php` - Polylang 언어 추가 PHP 스크립트 (새로 생성)
- `scripts/wordpress-setup/polylang-rest-api-helper.php` - 커스텀 REST API Helper 플러그인 (복사)
- `wordpress-plugin/polylang-rest-api-helper.php` - 원본 플러그인 파일 (참조)

### Notes

이 작업은 WordPress 설치 스크립트에 Polylang 다국어 플러그인 자동 설정을 추가합니다.

**전제 조건**:
- WordOps + WordPress가 이미 설치되어 있음 (`setup-wordops.sh` 완료)
- WP-CLI가 사용 가능함
- www-data 사용자 권한으로 WordPress 명령 실행 가능

**완료 후 결과**:
- Polylang 플러그인 설치 및 활성화
- 한국어(ko)/영어(en) 언어 설정 완료
- Polylang REST API Helper 플러그인 설치 및 활성화
- `blog publish --link-to` 명령 즉시 사용 가능

## Tasks

- [x] 1.0 Polylang 플러그인 설치 및 활성화
  - [ ] 1.1 setup-polylang.sh 파일 생성 및 기본 구조 작성 (shebang, set -euo pipefail, config.sh 로드)
  - [ ] 1.2 root 권한 체크 및 WordPress 사이트 디렉토리 존재 확인
  - [ ] 1.3 Polylang 플러그인 이미 설치 여부 확인 (wp plugin list)
  - [ ] 1.4 WP-CLI로 Polylang 플러그인 설치 (sudo -u www-data wp plugin install polylang --activate)
  - [ ] 1.5 Polylang 버전 확인 및 설치 검증 (wp plugin get polylang --field=version)
  - [ ] 1.6 에러 처리: 설치 실패 시 명확한 메시지 출력 및 exit 1

- [x] 2.0 언어 설정 스크립트 작성 및 실행
  - [ ] 2.1 add-languages.php 템플릿 파일 생성 (scripts/wordpress-setup/add-languages.php)
  - [ ] 2.2 PHP 스크립트에 wp-load.php require 및 Polylang 함수 확인 로직 추가
  - [ ] 2.3 한국어(ko_KR) 언어 추가 로직 구현 (pll_add_language() 사용)
  - [ ] 2.4 영어(en_US) 언어 추가 로직 구현
  - [ ] 2.5 기본 언어를 한국어로 설정 (Polylang option 업데이트)
  - [ ] 2.6 setup-polylang.sh에서 도메인 변수로 wp-load.php 경로 동적 생성
  - [ ] 2.7 WP-CLI eval-file로 PHP 스크립트 실행 (sudo -u www-data wp eval-file add-languages.php)
  - [ ] 2.8 언어 추가 성공 여부 확인 (wp pll lang list 또는 curl)
  - [ ] 2.9 에러 처리: 언어 추가 실패 시 롤백 및 에러 메시지

- [x] 3.0 Polylang REST API Helper 플러그인 배포
  - [ ] 3.1 wordpress-plugin/polylang-rest-api-helper.php 파일 존재 확인
  - [ ] 3.2 WordPress 플러그인 디렉토리에 polylang-rest-api-helper 폴더 생성
  - [ ] 3.3 플러그인 파일 복사 (cp wordpress-plugin/polylang-rest-api-helper.php)
  - [ ] 3.4 파일 소유자 및 권한 설정 (chown www-data:www-data, chmod 644)
  - [ ] 3.5 플러그인 활성화 (sudo -u www-data wp plugin activate polylang-rest-api-helper)
  - [ ] 3.6 플러그인 활성화 상태 확인
  - [ ] 3.7 에러 처리: 플러그인 활성화 실패 시 에러 메시지

- [x] 4.0 메인 오케스트레이터 업데이트
  - [ ] 4.1 setup.sh에 "단계 3/3: Polylang 설정" 섹션 추가
  - [ ] 4.2 setup-polylang.sh 실행 호출 추가 (bash "$SCRIPT_DIR/setup-polylang.sh")
  - [ ] 4.3 에러 발생 시 처리 로직 추가 (exit code 체크)
  - [ ] 4.4 성공 메시지에 Polylang 설정 완료 추가
  - [ ] 4.5 최종 완료 메시지에 다음 단계 추가 (blog publish --link-to 사용 가능)

- [x] 5.0 설정 검증 및 테스트
  - [ ] 5.1 setup-polylang.sh에 검증 섹션 추가 ([4/4] 설정 검증)
  - [ ] 5.2 Polylang 플러그인 활성화 상태 확인 (wp plugin list | grep polylang)
  - [ ] 5.3 언어 목록 확인 - ko, en 존재 확인 (curl Polylang API)
  - [ ] 5.4 Polylang REST API Helper 활성화 상태 확인
  - [ ] 5.5 REST API endpoint 테스트 (curl POST /polylang-helper/v1/link-translations)
  - [ ] 5.6 검증 실패 시 경고 메시지 출력 (에러는 아니지만 수동 확인 필요)
  - [ ] 5.7 최종 상태 요약 출력 (활성 플러그인, 설정된 언어, REST API 상태)

- [ ] 6.0 시스템 테스트 (User Story 기반)
  - [ ] 6.1 User Story 1 테스트: 빈 VPS에서 전체 스크립트 실행 (setup.sh)
  - [ ] 6.2 WordPress 관리자 접속하여 Polylang 플러그인 활성화 확인
  - [ ] 6.3 언어 설정 페이지에서 한국어(기본), 영어 존재 확인
  - [ ] 6.4 User Story 3 테스트: CLI에서 blog publish --link-to 명령 실행
  - [ ] 6.5 포스트 64, 65 연결 후 WordPress 관리자에서 translation 링크 확인
  - [ ] 6.6 에러 발생 시나리오 테스트 (Polylang 설치 실패, 권한 오류 등)
