# Tasks: Epic 7.0 - SEO 최적화 시스템 강화

**Based on**: tasks/7.0-prd-seo-optimization-system.md
**Created**: 2025-10-28
**Status**: Ready for Implementation

---

## Relevant Files

- `prompts/blog-post-guidelines.md` - Guidelines v1.2 → v1.3 업그레이드
- `packages/core/src/seo.ts` - SEO 분석 알고리즘 개선
- `packages/cli/src/commands/analyze-seo.ts` - 새로운 CLI 명령 (생성 필요)
- `packages/cli/src/index.ts` - CLI 명령 등록
- `CHANGELOG.md` - Epic 7.0 변경사항 기록

### Notes

- Git 작업은 모든 변경사항을 커밋하기 전에 수행
- WordPress 포스트 정리는 REST API를 사용하여 최신 버전으로 업데이트
- SEO 알고리즘 변경 시 기존 포스트 점수 백업 필수

---

## Tasks

### 1.0 Git 상태 정리 및 버전 관리

현재 작업 상태를 Git에 커밋하고 원격 저장소에 푸시합니다.

- [x] 1.1 현재 변경사항 확인
  - `git status`로 변경된 파일 목록 확인
  - Guidelines v1.2 변경사항 확인
  - 포스트 #4-#6 SEO 개선 사항 확인 (gitignore로 제외됨)
  - 불필요한 파일 제외 (.gitignore 확인)

- [ ] 1.2 변경사항 스테이징
  - `git add prompts/blog-post-guidelines.md` (Guidelines v1.2)
  - `git add content/drafts/2025-10-28-node-js-cli-도구-개발-입문.md` (포스트 #4)
  - `git add content/drafts/2025-10-28-wordpress-rest-api-node-js로-자동-발행-시스템-구축하기.md` (포스트 #5)
  - `git add content/drafts/2025-10-28-ai-콘텐츠-생성부터-wordpress-발행까지-완전-자동화-파이프라인-구축하기.md` (포스트 #6)
  - 기타 관련 파일 추가

- [ ] 1.3 커밋 메시지 작성 및 커밋
  - 의미 있는 커밋 메시지 작성
  - 제목: "feat: Epic 6.0 완료 - Guidelines v1.2 및 포스트 #4-#6 SEO 개선"
  - 본문: 주요 변경사항 요약
    - Guidelines v1.2: SEO 규칙 강화
    - 포스트 #4-#6: 키워드 밀도 개선, 내부 링크 추가
    - SEO 점수: 평균 59.67 → 66.33
  - `git commit -m "..."` 실행

- [ ] 1.4 원격 저장소에 푸시
  - `git push origin main` 실행
  - 푸시 성공 확인
  - GitHub/GitLab에서 커밋 확인

---

### 2.0 WordPress 포스트 중복 정리

중복 발행된 포스트를 최신 버전으로 업데이트하거나 이전 버전을 삭제합니다.

- [ ] 2.1 WordPress 포스트 현황 조회
  - `blog list` 명령으로 전체 포스트 목록 확인
  - 포스트 ID 16-21번의 상태 확인
  - 각 포스트의 제목, slug, 발행 날짜 확인
  - 중복 포스트 식별 (같은 제목/slug의 다른 ID)

- [ ] 2.2 중복 포스트 처리 전략 결정
  - 옵션 A: 이전 버전 삭제 (ID 16, 17, 18)
  - 옵션 B: 최신 버전으로 이전 ID 업데이트
  - 권장: 옵션 A (깔끔한 정리)
  - 백업 계획 수립 (WordPress 관리자 페이지에서 확인)

- [ ] 2.3 이전 버전 포스트 삭제 또는 업데이트
  - 포스트 #4 (ID 16) 처리: `blog delete 16` 또는 수동 삭제
  - 포스트 #5 (ID 17) 처리: `blog delete 17` 또는 수동 삭제
  - 포스트 #6 (ID 18) 처리: `blog delete 18` 또는 수동 삭제
  - 삭제 완료 확인: `blog list` 재실행

- [ ] 2.4 최종 포스트 ID 및 SEO 점수 기록
  - 콘솔 출력 또는 간단한 메모로 기록
  - 포스트 #4: ID 19, SEO 83/100
  - 포스트 #5: ID 20, SEO 64/100
  - 포스트 #6: ID 21, SEO 52/100
  - Epic 6.0 완료 상태로 표시

---

### 3.0 Guidelines v1.3 개발 (긴 포스트 대응)

긴 포스트(1000+ 줄)에 대한 SEO 최적화 전략을 Guidelines에 추가합니다.

- [ ] 3.1 포스트 길이별 키워드 밀도 공식 정의
  - `prompts/blog-post-guidelines.md` 섹션 추가
  - 섹션 제목: "## 10. Long Posts SEO Strategy (긴 포스트 SEO 전략, NEW in v1.3)"
  - 포스트 길이 분류:
    - 짧은 포스트 (< 500줄): 기본 밀도 0.5-2.5%
    - 중간 포스트 (500-1000줄): 기본 밀도 × 0.9
    - 긴 포스트 (1000-1500줄): 기본 밀도 × 0.8
    - 매우 긴 포스트 (1500+ 줄): 기본 밀도 × 0.7
  - 공식 명시: `targetDensity = baseDensity × lengthFactor`

- [ ] 3.2 긴 포스트 키워드 배치 전략
  - 섹션별 최소 키워드 출현 횟수 가이드:
    - 제목 (H1): 1회 필수
    - 소제목 (H2/H3): 각 섹션당 1-2회
    - 첫 단락: 1-2회
    - 마지막 단락: 1-2회
    - 본문: 자연스럽게 분산 (섹션당 2-3회)
  - 예시 추가: 1500줄 포스트의 키워드 배치 예제

- [ ] 3.3 섹션별 키워드 분포 가이드
  - 균등 분포 원칙: 모든 주요 섹션에 키워드 포함
  - 과도한 집중 방지: 한 섹션에 5회 이상 반복 지양
  - 자연스러운 변형 활용: 동의어, 관련어 사용
  - 나쁜 예시와 좋은 예시 추가

- [ ] 3.4 SEO 점수 목표 설정 기준 (길이별)
  - 짧은 포스트 (< 500줄): 목표 SEO 80+
  - 중간 포스트 (500-1000줄): 목표 SEO 75+
  - 긴 포스트 (1000-1500줄): 목표 SEO 70+
  - 매우 긴 포스트 (1500+ 줄): 목표 SEO 65+
  - 이유 설명: 긴 포스트는 키워드 밀도 달성이 어려움

- [ ] 3.5 Guidelines 버전 업데이트
  - 파일 상단 버전 변경: v1.2 → v1.3
  - 변경 날짜 업데이트: 2025-10-28
  - Version History 섹션에 v1.3 항목 추가:
    - 긴 포스트 대응 전략 추가
    - 포스트 길이별 키워드 밀도 공식
    - 섹션별 키워드 분포 가이드
    - SEO 점수 목표 설정 (길이별)

- [ ] 3.6 테스트 포스트로 검증
  - 1500줄 이상의 테스트 포스트 생성
  - Guidelines v1.3 적용하여 작성
  - `blog analyze-seo` 명령으로 분석 (구현 후)
  - SEO 점수 65+ 달성 확인
  - 개선 효과 문서화

---

### 4.0 SEO 분석 알고리즘 개선 (포스트 길이 고려)

SEO 분석 로직을 수정하여 포스트 길이를 고려한 정확한 점수를 계산합니다.

- [ ] 4.1 기존 SEO 분석 코드 파악
  - `packages/core/src/seo.ts` 파일 읽기
  - 현재 키워드 밀도 계산 로직 이해
  - 현재 SEO 점수 계산 로직 이해
  - 개선 필요 부분 식별

- [ ] 4.2 포스트 길이 계산 함수 추가
  - `calculatePostLength(content: string): number` 함수 생성
  - 마크다운 콘텐츠의 줄 수 계산
  - 빈 줄 제외 옵션 고려
  - 테스트 케이스 작성

- [ ] 4.3 길이별 가중치 함수 구현
  - `calculateLengthFactor(postLength: number): number` 함수 생성
  - Guidelines v1.3의 공식 구현:
    ```typescript
    if (postLength < 500) return 1.0;
    else if (postLength < 1000) return 0.9;
    else if (postLength < 1500) return 0.8;
    else return 0.7;
    ```
  - 테스트 케이스 작성

- [ ] 4.4 목표 키워드 밀도 계산 로직 수정
  - `calculateTargetDensity()` 함수 수정
  - 기본 밀도(0.5-2.5%)에 길이 가중치 적용
  - 예: `targetDensity = 1.0% × 0.8 = 0.8%` (1000줄 포스트)
  - 기존 로직과의 호환성 유지

- [ ] 4.5 섹션별 키워드 분포 분석 추가
  - `analyzeSectionDistribution(content: string, keywords: string[]): SectionAnalysis[]` 함수 추가
  - H2 제목으로 섹션 분리
  - 각 섹션의 키워드 출현 횟수 계산
  - 균등 분포 여부 판단 (1-5회 범위)
  - 테스트 케이스 작성

- [ ] 4.6 SEO 점수 계산 알고리즘 업데이트
  - 기존 점수 계산에 섹션 분포 점수 추가
  - 가중치 조정:
    - 키워드 밀도: 40%
    - 섹션 분포: 30%
    - 메타데이터: 20%
    - 내부 링크: 10%
  - 길이별 목표 점수 반영

- [ ] 4.7 단위 테스트 작성 및 실행
  - `packages/core/src/seo.test.ts` 생성 또는 수정
  - 각 함수별 테스트 케이스 작성
  - 엣지 케이스 테스트 (0줄, 10000줄 등)
  - `pnpm test` 실행하여 모든 테스트 통과 확인

- [ ] 4.8 기존 포스트로 검증
  - 포스트 #4-#6로 새 알고리즘 테스트
  - 이전 점수와 비교
  - 개선 효과 확인 (정확도 향상)
  - 예상 결과:
    - 포스트 #4 (짧음): 점수 유지 또는 소폭 상승
    - 포스트 #5, #6 (긴): 점수 상승 (더 공정한 평가)

---

### 5.0 SEO 분석 CLI 명령 추가 (blog analyze-seo)

발행 전 SEO를 검증하고 개선 제안을 제공하는 CLI 명령을 추가합니다.

- [ ] 5.1 CLI 명령 파일 생성
  - `packages/cli/src/commands/analyze-seo.ts` 파일 생성
  - 기본 구조 작성:
    ```typescript
    import { Command } from 'commander';
    import { analyzeSEO } from '@blog/core';
    import chalk from 'chalk';

    export async function analyzeSeoCommand(filePath: string, options: any) {
      // 구현 예정
    }
    ```

- [ ] 5.2 마크다운 파일 읽기 및 파싱
  - `filePath` 검증 (파일 존재 여부)
  - 마크다운 파일 읽기 (`fs.readFileSync`)
  - Frontmatter 파싱 (`gray-matter`)
  - 콘텐츠 추출

- [ ] 5.3 SEO 분석 실행
  - `@blog/core`의 `analyzeSEO()` 함수 호출
  - 키워드 밀도 계산
  - 섹션 분포 분석
  - SEO 점수 계산
  - 결과 객체 반환

- [ ] 5.4 분석 결과 시각화
  - `chalk`를 사용한 컬러 출력:
    - 점수 80+: 초록색
    - 점수 60-79: 노란색
    - 점수 <60: 빨간색
  - 테이블 형식으로 키워드별 정보 출력:
    - 키워드 | 출현 횟수 | 현재 밀도 | 목표 밀도 | 상태
  - 섹션별 분포 표시

- [ ] 5.5 개선 제안 생성
  - 키워드 밀도가 낮은 경우:
    - 어느 섹션에 몇 회 추가 필요한지 제안
    - 예: "소제목 '구현 방법'에 'Node.js' 키워드 3회 추가 권장"
  - 키워드 밀도가 높은 경우:
    - 어느 섹션에서 제거 필요한지 제안
  - 섹션 분포가 불균등한 경우:
    - 키워드가 없는 섹션 명시
    - 재배치 제안

- [ ] 5.6 CLI 명령 등록
  - `packages/cli/src/index.ts` 수정
  - `analyze-seo` 명령 추가:
    ```typescript
    program
      .command('analyze-seo <file>')
      .description('마크다운 파일의 SEO 점수 분석 및 개선 제안')
      .option('-v, --verbose', '상세 정보 출력')
      .option('--json', 'JSON 형식으로 출력')
      .action(analyzeSeoCommand);
    ```

- [ ] 5.7 통합 테스트
  - 테스트 포스트 생성 (다양한 길이)
  - `blog analyze-seo test-post.md` 실행
  - 출력 결과 확인:
    - 점수가 정확한가?
    - 개선 제안이 구체적인가?
    - 컬러 출력이 올바른가?
  - 엣지 케이스 테스트 (빈 파일, 키워드 없는 파일 등)

- [ ] 5.8 도움말 및 문서 작성
  - `--help` 출력 내용 작성
  - `packages/cli/README.md`에 사용법 추가:
    - 기본 사용법
    - 옵션 설명
    - 예제
    - 출력 형식 설명
  - 에러 메시지 개선 (사용자 친화적)

---

## Completion Checklist

모든 작업 완료 후 다음을 확인하세요:

- [ ] 모든 작업이 체크되었는가?
- [ ] Git 커밋 및 푸시 완료되었는가?
- [ ] WordPress 포스트 정리 완료되었는가?
- [ ] Guidelines v1.3이 완성되고 테스트되었는가?
- [ ] SEO 알고리즘이 개선되고 테스트되었는가?
- [ ] CLI 명령이 추가되고 테스트되었는가?
- [ ] CHANGELOG.md에 Epic 7.0 변경사항 기록되었는가?
- [ ] 모든 테스트가 통과되었는가?
- [ ] 문서가 업데이트되었는가?

---

## Next Steps

Epic 7.0 완료 후:

1. Guidelines v1.3으로 새 포스트 3개 생성
2. SEO 점수 80+ 달성 검증
3. Epic 8.0 기획 (이미지 자동화 또는 성과 분석)
4. 장기 개선 계획 수립

---

**Ready to start implementation!** 🚀
