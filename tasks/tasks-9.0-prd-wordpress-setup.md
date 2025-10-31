# Epic 9.0: WordPress 서버 자동 설치 (WordOps)

## Introduction

### 문제점
현재 빈 우분투 VPS에 WordPress를 수동으로 설치하려면 LEMP 스택(Nginx, MySQL, PHP) 설치, WordPress 다운로드, 데이터베이스 설정, SSL 인증서 설정 등 복잡한 단계를 거쳐야 하며, 15-20분 이상 소요되고 설정 오류 가능성이 높다.

### 해결책
WordOps라는 검증된 WordPress 자동화 도구를 활용하여, 단 몇 줄의 명령으로 LEMP + WordPress + SSL + 캐싱이 모두 설정된 운영 환경을 자동 구축한다.

### 목표
blog CLI 도구로 포스팅할 수 있는 완전한 WordPress 서버를 5-10분 내에 자동으로 구축한다.

---

## Goals

1. **빠른 설치**: 5-10분 내 완전 자동 설치 (기존 15-20분 → 5-10분)
2. **간단함**: 명령 2-3줄로 완료 (기존 50+ 줄 스크립트 → 3줄)
3. **완전 자동화**: SSL, 캐싱, 보안 헤더 모두 자동 설정
4. **안정성**: 수천 명이 사용 중인 검증된 도구 활용
5. **즉시 사용 가능**: 설치 완료 즉시 blog publish 명령으로 포스팅 가능

---

## User Stories

1. **블로거로서**, 빈 VPS에 WordPress를 빠르게 설치하고 싶다.
   - **혜택**: 복잡한 수동 설정 없이 5분 내 설치 완료

2. **블로거로서**, SSL 인증서를 자동으로 설정하고 싶다.
   - **혜택**: Let's Encrypt 인증서 자동 발급 및 자동 갱신

3. **블로거로서**, WordPress 성능을 최적화하고 싶다.
   - **혜택**: Redis 캐싱이 자동으로 설정되어 페이지 로딩 속도 향상

4. **블로거로서**, Avada 테마를 설치하고 활성화하고 싶다.
   - **혜택**: WP-CLI로 자동 설치 및 활성화

---

## Functional Requirements

### 1. WordOps 설치
- **REQ-1.1**: 우분투 VPS에 WordOps를 자동으로 설치한다.
- **REQ-1.2**: WordOps 설치 시 LEMP 스택(Nginx, MySQL, PHP 8.1)이 함께 설치된다.

### 2. WordPress 사이트 생성
- **REQ-2.1**: WordOps를 사용하여 지정된 도메인에 WordPress 사이트를 생성한다.
- **REQ-2.2**: Let's Encrypt SSL 인증서를 자동으로 발급하고 HTTPS를 활성화한다.
- **REQ-2.3**: Redis 캐싱을 자동으로 설정한다.
- **REQ-2.4**: 관리자 계정 정보(사용자명, 비밀번호, 이메일)를 설정 파일에서 읽어 생성한다.

### 3. Avada 테마 설치
- **REQ-3.1**: WP-CLI를 사용하여 Avada 테마 zip 파일을 업로드한다.
- **REQ-3.2**: 업로드된 Avada 테마를 자동으로 활성화한다.

### 4. 설정 관리
- **REQ-4.1**: 도메인, 이메일, 관리자 계정 정보를 config.sh 파일에서 관리한다.
- **REQ-4.2**: config.sh 파일은 git에 커밋하지 않는다 (비밀번호 보호).

### 5. 검증
- **REQ-5.1**: 설치 완료 후 HTTPS 접속이 가능한지 확인한다.
- **REQ-5.2**: WordPress 관리자 페이지 접속이 가능한지 확인한다.
- **REQ-5.3**: Avada 테마가 활성화되었는지 확인한다.

---

## Non-Goals (Out of Scope)

1. **다중 사이트 지원**: 단일 WordPress 사이트만 구축한다.
2. **데이터베이스 백업**: 초기 설치만 수행하며, 백업 설정은 별도 작업이다.
3. **CDN 설정**: CDN 통합은 범위 밖이다.
4. **멀티 테마 지원**: Avada 테마만 설치한다.
5. **플러그인 설치**: Avada 필수 플러그인 외에는 설치하지 않는다.
6. **도메인 구매**: 도메인은 이미 구매되어 있고 VPS IP를 가리키고 있다고 가정한다.

---

## Technical Considerations

### WordOps 의존성
- **도구**: [WordOps](https://wordops.net/) v3.17+
- **지원 OS**: Ubuntu 20.04 LTS, Ubuntu 22.04 LTS
- **제약사항**: WordOps는 우분투 전용이며, CentOS/Debian은 지원하지 않는다.

### 스크립트 구조
```
scripts/wordpress-setup/
├── config.sh              # 설정 변수 (도메인, 이메일, 관리자 정보)
├── setup-wordops.sh       # WordOps 설치 및 WordPress 사이트 생성
├── setup-theme.sh         # Avada 테마 설치
├── setup.sh               # 메인 orchestrator 스크립트
└── avada.zip              # Avada 테마 파일 (실행 전 복사)
```

### 실행 방법
```bash
# 1. 설정 편집
vim scripts/wordpress-setup/config.sh

# 2. Avada 테마 복사
cp ref/Avada_Full_Package/avada.zip scripts/wordpress-setup/

# 3. 전송 및 실행
tar -czf wordpress-setup.tar.gz -C scripts wordpress-setup
scp wordpress-setup.tar.gz ubuntu@my-vps:/tmp/
ssh -t ubuntu@my-vps 'cd /tmp && tar -xzf wordpress-setup.tar.gz && cd wordpress-setup && sudo bash setup.sh'
```

### WordOps 주요 기능 (자동 설정)
- ✅ Nginx 최신 버전 설치 및 최적화
- ✅ MySQL 8.0 설치 및 WordPress용 DB 생성
- ✅ PHP 8.1 + 필수 확장 모듈
- ✅ Let's Encrypt SSL 자동 발급 및 갱신
- ✅ Redis 캐싱 자동 설정
- ✅ FastCGI 캐싱
- ✅ 방화벽 설정 (ufw)
- ✅ 보안 헤더 설정
- ✅ WP-CLI 자동 설치

---

## Success Metrics

### 기술적 지표
1. **설치 소요 시간**: 5-10분 이내 (목표: 8분)
2. **SSL Grade**: A+ (ssllabs.com 기준)
3. **PageSpeed Score**: 90+ (캐싱 덕분)
4. **설치 성공률**: 100% (단일 환경)

### 사용자 만족도 지표
1. **설정 복잡도**: 매우 낮음 (config.sh 1개 편집)
2. **수동 개입 횟수**: 0회 (완전 자동)
3. **에러 발생률**: <1% (WordOps 안정성)

---

## Open Questions

1. **도메인 DNS 설정**: 사용자가 도메인 DNS를 VPS IP로 이미 설정했는가?
   - **가정**: 설정 완료되어 있음
   - **필요 시**: 문서에 DNS 설정 가이드 추가

2. **Avada 라이선스 키**: Avada 라이선스 키 등록은 수동인가?
   - **답변**: 수동 (WordPress 관리자에서 등록)
   - **문서화**: README에 라이선스 등록 단계 추가

3. **VPS 메모리**: WordOps 최소 메모리 요구사항은?
   - **답변**: 최소 1GB RAM 권장 (512MB도 가능하지만 느림)
   - **검증**: 스크립트에 메모리 체크 추가 예정

---

## 비교: 수동 설치 vs WordOps

| 항목 | 수동 설치 | WordOps |
|------|----------|---------|
| **명령 수** | ~50줄 | **3줄** |
| **설치 시간** | 15-20분 | **5-10분** |
| **SSL 설정** | 수동 (10분) | **자동** |
| **캐싱 설정** | 수동 (5분) | **자동** (Redis + FastCGI) |
| **보안 설정** | 수동 | **자동** (헤더, 방화벽) |
| **업데이트** | 수동 | **명령 1줄** (wo update) |
| **안정성** | 설정 오류 가능 | **검증됨** (수천 명 사용) |
| **학습 가치** | 높음 | 낮음 |

**결론**: 한 번만 실행하고 간단함을 우선한다면 WordOps가 최적.

---

## 참고 자료

- [WordOps 공식 문서](https://wordops.net/)
- [WordOps GitHub](https://github.com/WordOps/WordOps)
- [WP-CLI 핸드북](https://make.wordpress.org/cli/handbook/)
- [Avada 문서](https://avada.theme-fusion.com/documentation/)

---

**파일명**: `tasks-9.0-prd-wordpress-setup.md`
**버전**: v3 (WordOps 기반)
**마지막 업데이트**: 2025-10-31
**담당자**: 블로거 본인 (개발자)
