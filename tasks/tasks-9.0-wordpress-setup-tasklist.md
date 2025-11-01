# Epic 9.0: WordPress 서버 자동 설치 - Task List

## Relevant Files

- `.gitignore` - config.sh 및 avada.zip 제외 설정 추가
- `scripts/wordpress-setup/config.sh` - 설정 변수 파일 (도메인, 관리자 계정 정보, 이메일)
- `scripts/wordpress-setup/setup-wordops.sh` - WordOps 설치 및 WordPress 사이트 생성 스크립트
- `scripts/wordpress-setup/setup-theme.sh` - Avada 테마 설치 및 활성화 스크립트 (WP-CLI 사용)
- `scripts/wordpress-setup/setup.sh` - 메인 orchestrator 스크립트 (전체 설치 프로세스 제어)
- `docs/VULTR_VPS_SETUP.md` - Vultr VPS 생성 및 WordPress 자동 설치 가이드 (트러블슈팅 포함)

### Notes

- WordOps v3.17+ 필요 (Ubuntu 20.04/22.04 LTS 전용)
- 실행 방법: 로컬에서 tar + scp로 VPS 전송 후 ssh로 실행
- 한 번만 실행하는 초기 설정 스크립트 (blog CLI 타겟 서버 구축용)
- Avada 테마 zip 파일은 `ref/Avada_Full_Package/avada.zip`에서 복사 필요
- config.sh는 .gitignore에 추가하여 비밀번호 보호

## Tasks

- [x] 1.0 프로젝트 구조 및 설정 파일 작성
  - [x] 1.1 scripts/wordpress-setup/ 디렉토리 생성
  - [x] 1.2 .gitignore에 scripts/wordpress-setup/config.sh 추가 (비밀번호 보호)
  - [x] 1.3 config.sh 작성 (DOMAIN, ADMIN_EMAIL, ADMIN_USER, ADMIN_PASSWORD, AVADA_THEME_ZIP 변수 정의)
  - [x] 1.4 ref/Avada_Full_Package/avada.zip를 scripts/wordpress-setup/으로 복사

- [x] 2.0 WordOps 기반 설치 스크립트 작성
  - [x] 2.1 setup-wordops.sh 작성 (config.sh source 및 기본 구조)
  - [x] 2.2 setup-wordops.sh에 WordOps 설치 로직 추가 (wget -qO wo wops.cc && sudo bash wo)
  - [x] 2.3 setup-wordops.sh에 WordPress 사이트 생성 명령 추가 (wo site create $DOMAIN --wp --php81 --letsencrypt --redis)
  - [x] 2.4 setup-wordops.sh에 관리자 계정 설정 추가 (--user, --pass, --email 옵션)
  - [x] 2.5 setup-theme.sh 작성 (WP-CLI로 Avada 테마 설치 및 활성화)
  - [x] 2.6 setup.sh 메인 orchestrator 작성 (setup-wordops.sh → setup-theme.sh 순서 실행)
  - [x] 2.7 모든 스크립트에 set -euo pipefail 및 에러 핸들링 추가

- [ ] 3.0 테스트 및 문서화
  - [ ] 3.1 로컬 VPS 테스트 환경 구축 (Vultr VPS, Ubuntu 20.04/22.04)
  - [ ] 3.2 전체 워크플로우 통합 테스트 (tar → scp → ssh 실행)
  - [ ] 3.3 HTTPS 접속 테스트 (Let's Encrypt SSL 확인)
  - [ ] 3.4 WordPress 관리자 페이지 접속 및 로그인 테스트
  - [ ] 3.5 Avada 테마 활성화 확인
  - [x] 3.6 docs/VULTR_VPS_SETUP.md 작성 (사전 요구사항, 실행 방법, 예제 코드)
  - [x] 3.7 docs/VULTR_VPS_SETUP.md에 트러블슈팅 섹션 추가 (DNS 설정, 방화벽 등)
  - [ ] 3.8 README.md 업데이트 (WordPress 서버 설치 방법 섹션 추가)

---
**Status**: Phase 2 완료 (서브태스크 추가됨)
**Total Tasks**: 3개 상위, 19개 서브태스크
**Total Files**: 5개
**예상 소요 시간**: 1일 (기존 4일 → WordOps로 75% 감소)
