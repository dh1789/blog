# Blog Post Guidelines System

## Overview

블로그 포스트 생성 시 일관된 품질을 유지하고 점진적으로 개선하기 위한 가이드라인 시스템 구축.

**목표**:
- 포스트 #1-#3에서 얻은 인사이트를 재사용 가능한 가이드라인으로 정리
- CLI에서 가이드라인을 자동으로 로드하여 프롬프트에 주입
- 팩트체크 결과를 가이드라인에 반영하여 점진적 개선
- 최종적으로 SEO 순위 향상 → 유입 증가 → 수익 향상

**현재 상태**:
- 포스트 #1: 92/100 (5개 수정)
- 포스트 #2: 96/100 (3개 수정)
- 포스트 #3: 98/100 (6개 수정)
- 가이드라인 없음 → 매번 수동으로 피드백

**목표 상태**:
- 가이드라인 적용 후 포스트: 99/100 (0-1개 수정)
- 자동화된 품질 보증
- 학습 루프를 통한 지속적 개선

## Relevant Files

- `prompts/blog-post-guidelines.md` - 블로그 포스트 작성 가이드라인 (새로 생성)
- `packages/shared/src/types.ts` - ContentGenerationOptions 타입 정의 수정
- `packages/core/src/claude.ts` - 가이드라인 로드 및 프롬프트 주입 로직
- `packages/cli/src/commands/draft-create.ts` - --guidelines 옵션 추가
- `CLAUDE.md` - 프로젝트 전체 컨텍스트 (참조용)

### Notes

- 가이드라인 파일은 버전 관리되어야 하며, 포스트 발행 시마다 업데이트
- CLI 명령어는 기본적으로 가이드라인을 자동 로드하되, --no-guidelines로 비활성화 가능
- 향후 메트릭 추적 및 A/B 테스트 기능 추가 고려

## Tasks

- [ ] 1.0 블로그 포스트 가이드라인 파일 생성
  - [ ] 1.1 포스트 #1-#3 Ultrathink 팩트체크 결과 분석 및 정리
  - [ ] 1.2 성공 패턴 (DO) 정리: 통계 출처, 코드 품질, 링크 검증, SEO
  - [ ] 1.3 실패 패턴 (DON'T) 정리: 과장된 수치, 플레이스홀더, 의존성 누락
  - [ ] 1.4 사용자 피드백 및 선호도 정리 (항상 옵션 B, Ultrathink 요청)
  - [ ] 1.5 가이드라인 마크다운 파일 작성 (prompts/blog-post-guidelines.md)
  - [ ] 1.6 버전 관리 구조 추가 (v1.0 - 포스트 #1-#3 기반)

- [ ] 2.0 타입 정의 확장
  - [ ] 2.1 packages/shared/src/types.ts 파일 읽기
  - [ ] 2.2 ContentGenerationOptions 인터페이스에 guidelines?: string 필드 추가
  - [ ] 2.3 JSDoc 주석 추가 (가이드라인 파일 경로 설명)
  - [ ] 2.4 타입 체크 확인 (pnpm --filter @blog/shared typecheck)

- [ ] 3.0 Core 로직 수정 (가이드라인 주입)
  - [ ] 3.1 packages/core/src/claude.ts 파일 읽기
  - [ ] 3.2 가이드라인 파일 로드 함수 구현 (fs.readFile)
  - [ ] 3.3 generatePost 메서드에서 가이드라인 로드
  - [ ] 3.4 프롬프트 구성 시 가이드라인 콘텐츠 주입
  - [ ] 3.5 가이드라인 파일 없을 때 에러 처리 (optional로 처리)
  - [ ] 3.6 가이드라인 섹션 포맷팅 (마크다운 형식 유지)

- [ ] 4.0 CLI 명령어 개선
  - [ ] 4.1 packages/cli/src/commands/draft-create.ts 파일 읽기
  - [ ] 4.2 --guidelines <path> 옵션 추가
  - [ ] 4.3 기본값 설정: prompts/blog-post-guidelines.md
  - [ ] 4.4 --no-guidelines 플래그 구현 (가이드라인 비활성화)
  - [ ] 4.5 옵션 도움말 업데이트 (commander.js description)
  - [ ] 4.6 가이드라인 경로를 ContentGenerationOptions에 전달

- [ ] 5.0 테스트 및 검증
  - [ ] 5.1 전체 프로젝트 빌드 (pnpm build)
  - [ ] 5.2 타입 체크 (pnpm typecheck)
  - [ ] 5.3 테스트 포스트 생성 (가이드라인 적용)
  - [ ] 5.4 생성된 포스트 품질 확인 (Ultrathink 팩트체크)
  - [ ] 5.5 가이드라인 효과 측정 (수정 항목 수, 최종 점수)
  - [ ] 5.6 가이드라인 파일 업데이트 (학습된 내용 반영)
