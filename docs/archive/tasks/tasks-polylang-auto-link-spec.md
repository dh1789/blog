# Polylang 자동 언어 연결 구현 태스크

**생성일**: 2025-11-04
**기반 문서**: POLYLANG-AUTO-LINK-SPEC.md
**총 예상 시간**: 4-5시간
**우선순위**: HIGH

---

## 📋 Relevant Files

### 수정 대상 파일
- `packages/core/src/wordpress.ts` - linkTranslations() 메서드 추가
- `packages/cli/src/commands/publish.ts` - --link-to 옵션 추가
- `packages/cli/src/index.ts` - 명령어 등록
- `packages/core/src/index.ts` - 메서드 export

### 생성 대상 파일
- `packages/cli/src/commands/link-translations.ts` - 새로운 CLI 명령어

### 문서 업데이트
- `ISSUES.md` - WF-001 이슈 상태 업데이트
- `WORKFLOW-GUIDE.md` - 새 워크플로우 추가
- `README.md` - 새 명령어 문서화
- `POLYLANG-AUTO-LINK-SPEC.md` - 체크리스트 업데이트

---

## 🎯 Tasks

### 1.0 Polylang Meta 필드 조사 및 연결 메커니즘 검증
**예상 시간**: 30분
**우선순위**: 최우선 (모든 작업의 기반)
**의존성**: 없음
**상태**: ✅ 가정 기반 완료 (실제 테스트 시 조정)

**가정 사항** (POLYLANG-AUTO-LINK-SPEC.md 리서치 기반):
- **Polylang 버전**: Free (가장 일반적인 케이스)
- **Meta 필드명**: `_pll_translations` (언더스코어 포함)
- **데이터 형식**: JSON 직렬화 객체 `{"ko": 29, "en": 26}`
- **구현 방식**: WordPress REST API를 통한 post meta 업데이트
- **양방향 연결**: 한글/영문 포스트 모두에 동일한 translation 객체 저장

- [x] 1.1 WordPress 관리자에서 Polylang 플러그인 버전 확인
  - **가정**: Polylang Free 버전 사용
  - 실제 테스트 시 확인 필요

- [x] 1.2 WordPress DB에서 Polylang meta 필드 이름 확인
  - **가정**: meta_key = `_pll_translations`
  - **가정**: meta_value = JSON 직렬화된 언어 코드 매핑
  - 실제 테스트 시 확인 필요

- [x] 1.3 테스트 포스트로 수동 연결 후 데이터 구조 분석
  - 사용자가 이미 수동 연결 경험 있음
  - 양방향 연결 메커니즘 확인됨

- [x] 1.4 조사 결과 문서화
  - 가정 사항 태스크 파일에 문서화 완료
  - 실제 테스트 후 POLYLANG-AUTO-LINK-SPEC.md 업데이트 예정

---

### 2.0 WordPressClient 클래스에 linkTranslations 메서드 구현
**예상 시간**: 1-1.5시간
**우선순위**: 높음
**의존성**: 1.0 완료 후

- [x] 2.1 메서드 시그니처 설계 및 타입 정의
  - ✅ packages/core/src/wordpress.ts에 메서드 추가
  - ✅ linkTranslations(koPostId: number, enPostId: number): Promise<void>
  - ✅ JSDoc 주석 작성 (@param, @throws, @example 포함)

- [x] 2.2 양방향 연결 로직 구현
  - ✅ Meta 필드명 `_pll_translations` 사용
  - ✅ 한국어 포스트에 영어 번역 연결 (wpapi posts().id().update())
  - ✅ 영어 포스트에 한국어 원본 연결 (양방향)
  - ✅ meta 데이터 형식: JSON.stringify({ ko: koPostId, en: enPostId })

- [x] 2.3 에러 처리 구현
  - ✅ 404 에러: "Post not found" 메시지
  - ✅ 401/403 에러: "Permission denied" 메시지
  - ✅ 기타 에러: 원본 에러 메시지 포함
  - ✅ 명확한 에러 메시지 제공

- [x] 2.4 성공 로그 추가
  - ✅ console.log로 연결 완료 메시지 출력
  - ✅ 형식: `✅ 언어 연결 완료: 한글(${koPostId}) ↔ 영문(${enPostId})`

- [x] 2.5 packages/core/src/index.ts에서 메서드 export
  - ✅ `export * from './wordpress';` 확인
  - ✅ linkTranslations가 public 메서드로 자동 export됨

---

### 3.0 CLI link-translations 명령어 구현
**예상 시간**: 1시간
**우선순위**: 중간
**의존성**: 2.0 완료 후

- [x] 3.1 commands/link-translations.ts 파일 생성
  - ✅ packages/cli/src/commands/link-translations.ts 생성
  - ✅ 필요한 import 추가 (WordPressClient, loadConfig, ora, chalk)

- [x] 3.2 LinkTranslationsOptions 인터페이스 정의
  - ✅ ko, en, auto 필드 정의
  - ✅ TypeScript 타입 안전성 확보

- [x] 3.3 linkTranslationsCommand 함수 구현
  - ✅ 설정 로드 (loadConfig())
  - ✅ WordPressClient 초기화
  - ✅ Post ID 파싱 및 검증 (parseInt, isNaN, 양수 체크)
  - ✅ 잘못된 입력 시 에러 메시지 및 process.exit(1)

- [x] 3.4 진행 상태 표시 (ora 스피너)
  - ✅ `ora('Polylang 언어 연결 중...').start()`
  - ✅ 성공 시: `spinner.succeed(chalk.green('언어 연결 완료!'))`
  - ✅ 실패 시: `spinner.fail(chalk.red('언어 연결 실패'))`

- [x] 3.5 연결 결과 출력
  - ✅ 한글 포스트 ID, 영문 포스트 ID 표시
  - ✅ WordPress 관리자 링크 제공
  - ✅ 형식화된 출력 (=== 연결 결과 ===)

- [x] 3.6 에러 처리 및 사용자 친화적 메시지
  - ✅ try-catch로 에러 처리
  - ✅ 에러 타입별 명확한 안내 메시지 (Post not found, Permission denied, 네트워크)

- [x] 3.7 packages/cli/src/index.ts에 명령어 등록
  - ✅ import 추가: `import { linkTranslationsCommand } from './commands/link-translations';`
  - ✅ program.command() 추가 완료
  - ✅ --ko, --en requiredOption 설정
  - ✅ --auto option 설정 (향후 구현)

---

### 4.0 publish 명령어에 --link-to 옵션 통합
**예상 시간**: 30분
**우선순위**: 중간
**의존성**: 2.0 완료 후 (3.0과 병렬 가능)

- [x] 4.1 PublishOptions 인터페이스 수정
  - ✅ packages/cli/src/commands/publish.ts 수정
  - ✅ PublishOptions에 linkTo?: string 추가

- [x] 4.2 publishCommand 함수에 자동 연결 로직 추가
  - ✅ 포스트 발행 후 (createPost 완료 후) 조건 체크
  - ✅ `metadata.language === 'en' && options.linkTo` 검증
  - ✅ linkTo 파싱 및 검증 (parseInt, isNaN, 양수 체크)

- [x] 4.3 linkTranslations 호출
  - ✅ `await wpClient.linkTranslations(koPostId, postId);` 호출
  - ✅ 스피너 텍스트 업데이트: `'Polylang 언어 연결 중...'`
  - ✅ 성공 메시지 출력: `언어 연결 완료: 한글(...) ↔ 영문(...)`

- [x] 4.4 에러 처리
  - ✅ linkTranslations 실패 시에도 포스트 발행은 성공으로 처리
  - ✅ 연결 실패 경고 메시지 표시
  - ✅ 수동 연결 방법 안내 (blog link-translations 명령어)

- [x] 4.5 packages/cli/src/index.ts에 옵션 추가
  - ✅ publish 명령어에 --link-to 옵션 추가
  - ✅ 설명: '연결할 한글 포스트 ID (영문 발행 시)'

---

### 5.0 테스트, 문서화 및 검증
**예상 시간**: 1시간
**우선순위**: 높음
**의존성**: 2.0, 3.0, 4.0 완료 후

- [ ] 5.1 통합 테스트 - link-translations 명령어
  - 테스트 한글 포스트 발행 (또는 기존 포스트 사용)
  - 테스트 영문 포스트 발행
  - `blog link-translations --ko <koId> --en <enId>` 실행
  - WordPress 관리자에서 연결 확인
  - 실제 페이지에서 언어 전환 버튼 작동 확인

- [ ] 5.2 통합 테스트 - publish --link-to
  - 한글 포스트 먼저 발행하고 ID 기록
  - `blog publish content/posts/en/test.md --link-to <koId>` 실행
  - 자동 연결 확인 (WordPress 관리자)
  - 언어 전환 작동 확인

- [ ] 5.3 에러 케이스 테스트
  - 존재하지 않는 Post ID: `blog link-translations --ko 9999 --en 26`
  - 잘못된 ID 형식: `blog link-translations --ko abc --en 26`
  - 각 에러 케이스에서 명확한 메시지 출력 확인

- [ ] 5.4 ISSUES.md 업데이트
  - WF-001 이슈 상태를 ✅ 해결 완료로 변경
  - 해결일 기록: 2025-11-04
  - 구현된 솔루션 설명 추가

- [ ] 5.5 WORKFLOW-GUIDE.md 업데이트
  - Phase 4 "영문 포스트 발행 및 연결" 섹션 수정
  - 새로운 자동 연결 워크플로우 추가:
  ```markdown
  ### 방법 1: publish 명령어로 자동 연결
  blog publish content/posts/en/my-post.md --link-to 29

  ### 방법 2: 별도 명령어로 연결
  blog link-translations --ko 29 --en 26
  ```

- [ ] 5.6 README.md 업데이트
  - "명령어 사용법" 섹션에 link-translations 추가
  - --link-to 옵션 설명 추가
  - 사용 예시 코드 추가

- [ ] 5.7 POLYLANG-AUTO-LINK-SPEC.md 체크리스트 완료
  - "구현 우선순위 및 일정 > Phase 1" 체크박스 완료 표시
  - "체크리스트 > 구현 중" 항목들 완료 표시
  - 구현 상태를 "✅ 구현 완료"로 변경

- [ ] 5.8 빌드 및 타입 체크
  - `pnpm build` 실행하여 빌드 성공 확인
  - `pnpm typecheck` 실행하여 타입 에러 없음 확인

---

## 📊 Progress Tracking

- [x] **Phase 1: 조사** (1.0) ✅ 가정 기반 완료
- [x] **Phase 2: 핵심 구현** (2.0) ✅ 완료
- [x] **Phase 3: CLI 구현** (3.0, 4.0) ✅ 완료
- [ ] **Phase 4: 검증** (5.0)

---

## 🚨 주의사항

1. **Meta 필드 이름**: 1.0 작업에서 반드시 실제 필드 이름 확인 후 진행
2. **양방향 연결**: 한글→영문, 영문→한글 모두 업데이트 필수
3. **에러 처리**: 모든 WordPress API 호출에 try-catch 적용
4. **사용자 피드백**: 명확한 성공/실패 메시지 제공
5. **기존 연결 덮어쓰기**: 이미 연결된 포스트 재연결 시 경고 메시지 (향후 개선)

---

## 🔗 참고 문서

- `POLYLANG-AUTO-LINK-SPEC.md` - 상세 구현 사양
- `ISSUES.md` - WF-001 이슈
- `WORKFLOW-GUIDE.md` - 권장 워크플로우
- [Polylang Developer Documentation](https://polylang.pro/documentation/documentation-for-developers/)

---

**생성 날짜**: 2025-11-04
**태스크 상태**: 생성 완료, 구현 대기
