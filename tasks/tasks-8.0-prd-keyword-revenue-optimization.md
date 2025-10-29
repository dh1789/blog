# Task List: Epic 8.0 - 키워드 수익성 분석 시스템

**PRD**: tasks/8.0-prd-keyword-revenue-optimization.md

**목표**: trending 명령어를 확장하여 Google Keyword Planner API와 통합, 광고 수익 예측 기반 키워드/주제 추천

---

## Relevant Files

### New Files (생성 필요)
- `packages/core/src/keyword-research.ts` - Google Ads API 클라이언트 및 키워드 데이터 수집
- `packages/core/src/keyword-research.test.ts` - keyword-research 모듈 단위 테스트
- `packages/core/src/revenue-scoring.ts` - 수익성 점수 계산 알고리즘
- `packages/core/src/revenue-scoring.test.ts` - revenue-scoring 모듈 단위 테스트
- `packages/core/src/cache.ts` - 파일 기반 캐싱 시스템
- `packages/core/src/cache.test.ts` - cache 모듈 단위 테스트
- `packages/core/src/topic-suggestion.ts` - 주제 추천 로직
- `packages/core/src/topic-suggestion.test.ts` - topic-suggestion 모듈 단위 테스트
- `docs/GOOGLE_ADS_SETUP.md` - Google Ads API 설정 가이드

### Modified Files (수정 필요)
- `packages/shared/src/types.ts` - 새 타입 추가 (KeywordData, RevenueScore, TopicSuggestion 등)
- `packages/shared/src/schemas.ts` - Zod 스키마 추가
- `packages/core/src/trending.ts` - TrendingMonitor 클래스 확장
- `packages/core/src/trending.test.ts` - 테스트 업데이트
- `packages/cli/src/commands/trending.ts` - --revenue 옵션 추가
- `packages/cli/src/commands/trending.test.ts` - 테스트 업데이트
- `packages/core/package.json` - google-ads-api, node-cache 의존성 추가
- `.env.example` - Google Ads API 환경 변수 예제 추가
- `docs/PRODUCTION_GUIDE.md` - Step 1에 trending --revenue 추가
- `README.md` - Epic 8.0 기능 추가

### Test Files
- `packages/core/src/__tests__/integration/keyword-revenue.test.ts` - 통합 테스트

### Notes
- 단위 테스트는 코드 파일과 같은 디렉토리에 배치 (예: `trending.ts` → `trending.test.ts`)
- 통합 테스트는 `__tests__/integration/` 디렉토리에 배치
- `pnpm test` 명령어로 전체 테스트 실행
- `pnpm test packages/core` 명령어로 core 패키지 테스트만 실행

---

## Tasks

### 1.0 Google Ads API 통합 및 설정

#### 1.1 의존성 및 환경 설정
- [x] 1.1.1 `packages/core/package.json`에 `google-ads-api` 의존성 추가 (`^21.0.0`)
- [x] 1.1.2 `.env.example`에 Google Ads API 환경 변수 예제 추가
  - `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`

#### 1.2 GoogleAdsClient 클래스 구현
- [x] 1.2.1 `packages/core/src/keyword-research.ts` 파일 생성
- [x] 1.2.2 `GoogleAdsClient` 클래스 구현
  - Google Ads API v21 클라이언트 초기화
  - 환경 변수에서 인증 정보 로드
  - OAuth 2.0 토큰 관리
- [x] 1.2.3 연결 테스트 메서드 구현 (`testConnection()`)
- [x] 1.2.4 에러 핸들링 추가 (인증 실패, 네트워크 에러)
- [x] 1.2.5 사용자 친화적 에러 메시지 구현 (Google Ads 설정 가이드 링크 포함)

#### 1.3 GoogleAdsClient 유닛 테스트
- [x] 1.3.1 `packages/core/src/keyword-research.test.ts` 파일 생성
- [x] 1.3.2 GoogleAdsClient 클래스 초기화 테스트
  - 환경 변수 로드 검증
  - 클라이언트 인스턴스 생성 검증
- [x] 1.3.3 `testConnection()` 메서드 테스트
  - 정상 연결 시나리오 (모킹)
  - 인증 실패 시나리오
  - 네트워크 에러 시나리오
- [x] 1.3.4 에러 핸들링 테스트
  - 사용자 친화적 에러 메시지 검증
  - 에러 타입별 처리 검증

### 2.0 타입 정의 및 데이터 모델

#### 2.1 타입 정의
- [x] 2.1.1 `packages/shared/src/types.ts`에 새 타입 추가
  - `KeywordData`: 키워드, CPC, 검색량, 경쟁 강도
  - `RevenueScore`: 수익성 점수 및 세부 항목
  - `TopicSuggestion`: 추천 주제 및 예상 수익
  - `KeywordMetrics`: 정규화된 지표
  - `RevenueAnalysisOptions`: 분석 옵션
- [x] 2.1.2 기존 `TrendingOptions` 타입 확장
  - `revenue?: boolean` 옵션 추가
  - `outputFile?: string` 옵션 추가
  - `format?: 'table' | 'json'` 옵션 추가
- [x] 2.1.3 `ScoredTrendingTopic` 타입 확장
  - `revenueData?: KeywordData` 필드 추가
  - `revenueScore?: RevenueScore` 필드 추가

#### 2.2 Zod 스키마 정의
- [x] 2.2.1 `packages/shared/src/schemas.ts`에 Zod 스키마 추가
  - `keywordDataSchema`: KeywordData 검증 스키마
  - `revenueScoreSchema`: RevenueScore 검증 스키마
  - `topicSuggestionSchema`: TopicSuggestion 검증 스키마
- [x] 2.2.2 타입 export 확인 및 `packages/shared/src/index.ts` 업데이트

#### 2.3 타입 및 스키마 검증 테스트
- [x] 2.3.1 `packages/shared/src/schemas.test.ts` 파일 생성
- [x] 2.3.2 `keywordDataSchema` 검증 테스트
  - 유효한 데이터 검증
  - 필수 필드 누락 시 에러
  - 잘못된 타입 시 에러
- [x] 2.3.3 `revenueScoreSchema` 검증 테스트
  - 점수 범위 검증 (0-100)
  - 가중치 합계 검증
- [x] 2.3.4 `topicSuggestionSchema` 검증 테스트
  - 필수 필드 검증
  - 수익 예측 값 검증

### 3.0 키워드 수익성 분석 모듈

#### 3.1 키워드 데이터 수집 구현
- [x] 3.1.1 `packages/core/src/keyword-research.ts`에 키워드 데이터 수집 메서드 추가
  - `getKeywordData(keywords: string[]): Promise<KeywordData[]>`
  - Google Keyword Planner API 호출 (검색량, CPC, 경쟁 강도)
  - API 응답 파싱 및 데이터 변환
- [x] 3.1.2 배치 처리 구현 (한 번에 최대 100개 키워드)
  - Task 3.1.1에 포함되어 구현 완료 (100개 제한 검증)
- [x] 3.1.3 재시도 로직 구현 (네트워크 에러, API 할당량 초과)
  - `retryWithBackoff()` 헬퍼 함수 구현 (지수 백오프, 최대 3회)
  - `isRetryableError()` 함수로 재시도 가능 에러 판단
  - 네트워크 에러, 타임아웃, 할당량 초과 시 자동 재시도

#### 3.2 수익성 점수 계산 구현
- [x] 3.2.1 `packages/core/src/revenue-scoring.ts` 파일 생성
- [x] 3.2.2 데이터 정규화 함수 구현
  - `normalizeCPC(cpc: number): number` - $0.01~$10.00 → 0.0~1.0
  - `normalizeSearchVolume(volume: number): number` - 로그 스케일 정규화
  - `normalizeSEODifficulty(difficulty: number): number` - 0~100 → 1.0~0.0 (역순)
  - 추가 구현: `normalizeKeywordData()` 헬퍼 함수
- [x] 3.2.3 수익성 점수 계산 함수 구현
  - `calculateRevenueScore(data: KeywordData): RevenueScore`
  - 가중치 적용: CPC 35%, 검색량 35%, SEO 난이도 30%
  - 0-100 점수 반환
  - 추가 구현: `calculateRevenueScores()` 배치 계산 및 순위 매기기
- [x] 3.2.4 수익 예측 계산 함수 구현
  - `estimateRevenue(data: KeywordData): { conservative: number, optimistic: number }`
  - 트래픽 예상 (검색량 × 랭크 팩터 × CTR)
  - 광고 수익 예상 (트래픽 × 광고 CTR × CPC)

#### 3.3 키워드 데이터 수집 유닛 테스트
- [x] 3.3.1 `keyword-research.test.ts`에 `getKeywordData()` 테스트 (Task 3.1에서 완료)
  - Google Ads API 모킹
  - 정상 응답 파싱 검증
  - 배치 처리 검증 (100개 키워드 제한)
  - 재시도 로직 검증 (네트워크 에러)
  - API 할당량 초과 에러 처리 검증

#### 3.4 수익성 점수 계산 유닛 테스트
- [x] 3.4.1 `packages/core/src/revenue-scoring.test.ts` 파일 생성 (36 tests)
- [x] 3.4.2 정규화 함수 테스트
  - `normalizeCPC()`: 경계값 ($0.01, $10.00), 중간값 ($5.00) 검증
  - `normalizeSearchVolume()`: 로그 스케일 변환 검증 (10, 100, 1000, 10000)
  - `normalizeSEODifficulty()`: 역순 변환 검증 (0 → 1.0, 100 → 0.0)
  - `normalizeKeywordData()`: 전체 데이터 정규화 검증
- [x] 3.4.3 `calculateRevenueScore()` 테스트
  - 가중치 적용 검증 (35%, 35%, 30%)
  - 점수 범위 검증 (0-100)
  - 다양한 입력 시나리오
  - metrics 및 expectedRevenue 포함 검증
- [x] 3.4.4 `estimateRevenue()` 테스트
  - Conservative 시나리오 검증 (Top 10, ad_ctr 0.01)
  - Optimistic 시나리오 검증 (Top 3, ad_ctr 0.03)
  - 검색량/CPC 스케일링 검증
  - 소수점 2자리 반올림 검증
- [x] 3.4.5 `calculateRevenueScores()` 테스트 (추가)
  - 배치 점수 계산 검증
  - 전체/검색량/수익 순위 매기기 검증
  - 빈 배열 및 단일 키워드 처리 검증

### 4.0 trending 명령어 확장

#### 4.1 TrendingMonitor 클래스 확장
- [ ] 4.1.1 `packages/core/src/trending.ts`의 `TrendingMonitor` 클래스 확장
  - `GoogleAdsClient` 인스턴스 추가
  - `getKeywordRevenueData(topics: TrendingTopic[]): Promise<KeywordData[]>` 메서드 추가
- [ ] 4.1.2 `getTrendingTopicsWithRevenue()` 메서드 구현
  - 기존 `getTrendingTopicsWithScores()` 호출
  - revenue 옵션 활성화 시 키워드 데이터 수집
  - 수익성 점수 계산 및 통합
  - 통합 점수로 정렬 (소셜 트렌드 + 수익성)

#### 4.2 주제 추천 로직 구현
- [ ] 4.2.1 `packages/core/src/topic-suggestion.ts` 파일 생성
- [ ] 4.2.2 주제 생성 로직 구현
  - `generateTopicSuggestions(keywords: KeywordData[]): TopicSuggestion[]`
  - 제목 템플릿 활용 ("TOP 10", "완벽 가이드", "비교 분석")
  - 키워드 조합 전략

#### 4.3 CLI 명령어 확장
- [ ] 4.3.1 `packages/cli/src/commands/trending.ts` 업데이트
  - `TrendingCommandOptions`에 `revenue`, `output`, `format` 옵션 추가
  - `--revenue` 플래그 처리
  - `--output <file>` 옵션 처리
  - `--format <format>` 옵션 처리 (기본값: table)
- [ ] 4.3.2 터미널 출력 포맷 구현
  - 수익성 데이터 포함 테이블 (CPC, 검색량, 난이도, 점수)
  - 컬러 코딩 (chalk 활용)
  - 주제 추천 섹션
  - 예상 수익 표시
- [ ] 4.3.3 JSON 출력 구현
  - `--format json` 또는 `--output` 지정 시 JSON 파일 생성
  - 타임스탬프, 키워드, 주제, 수익 데이터 포함
  - 포맷팅 (들여쓰기 2칸)
- [ ] 4.3.4 진행 상태 표시 개선
  - Google Ads API 호출 중 spinner 표시
  - 진행률 표시 (X/Y 키워드 처리 중)

#### 4.4 주제 추천 로직 유닛 테스트
- [ ] 4.4.1 `packages/core/src/topic-suggestion.test.ts` 파일 생성
- [ ] 4.4.2 `generateTopicSuggestions()` 테스트
  - 템플릿 적용 검증 ("TOP 10", "완벽 가이드", "비교 분석")
  - 키워드 조합 전략 검증
  - 수익 예측 포함 검증
  - 빈 입력 처리 검증

#### 4.5 TrendingMonitor 확장 유닛 테스트
- [ ] 4.5.1 `packages/core/src/trending.test.ts` 업데이트
- [ ] 4.5.2 `getTrendingTopicsWithRevenue()` 테스트
  - 소셜 트렌드 + 수익성 데이터 통합 검증
  - 통합 점수 계산 검증
  - 정렬 순서 검증
  - revenue 옵션 비활성화 시 기존 동작 유지 검증

#### 4.6 CLI 명령어 유닛 테스트
- [ ] 4.6.1 `packages/cli/src/commands/trending.test.ts` 업데이트
- [ ] 4.6.2 `--revenue` 옵션 테스트
  - 플래그 활성화 시 수익성 데이터 수집 검증
  - 플래그 비활성화 시 기존 동작 유지 검증
- [ ] 4.6.3 `--output` 옵션 테스트
  - 파일 생성 검증
  - JSON 형식 검증
- [ ] 4.6.4 `--format` 옵션 테스트
  - table 형식 출력 검증
  - json 형식 출력 검증
- [ ] 4.6.5 터미널 출력 포맷 테스트
  - 컬러 코딩 검증 (chalk 출력)
  - 주제 추천 섹션 검증
  - 예상 수익 표시 검증

### 5.0 캐싱 시스템 구현

#### 5.1 캐싱 시스템 의존성 및 설정
- [ ] 5.1.1 `packages/core/package.json`에 `node-cache` 의존성 추가 (`^5.1.2`)
- [ ] 5.1.2 `.cache/` 디렉토리를 `.gitignore`에 추가

#### 5.2 KeywordCache 클래스 구현
- [ ] 5.2.1 `packages/core/src/cache.ts` 파일 생성
- [ ] 5.2.2 `KeywordCache` 클래스 구현
  - 파일 기반 캐시 (`.cache/keywords/` 디렉토리)
  - TTL 관리 (기본값: 24시간)
  - 캐시 키 생성 (키워드 해시)
- [ ] 5.2.3 캐시 CRUD 메서드 구현
  - `get(keyword: string): KeywordData | null`
  - `set(keyword: string, data: KeywordData, ttl?: number): void`
  - `has(keyword: string): boolean`
  - `invalidate(keyword: string): void`
  - `clear(): void`
- [ ] 5.2.4 만료 체크 및 자동 갱신

#### 5.3 캐시 통합
- [ ] 5.3.1 `TrendingMonitor`와 캐시 통합
  - 키워드 데이터 수집 전 캐시 확인
  - 캐시 히트 시 API 호출 생략
  - 캐시 미스 시 데이터 수집 후 캐시 저장
- [ ] 5.3.2 캐시 통계 로그 (선택사항)
  - 캐시 히트율 표시
  - API 호출 절감량 표시

#### 5.4 캐싱 시스템 유닛 테스트
- [ ] 5.4.1 `packages/core/src/cache.test.ts` 파일 생성
- [ ] 5.4.2 CRUD 작업 테스트
  - `get()`: 존재하는 캐시, 존재하지 않는 캐시
  - `set()`: 새 캐시 저장, 기존 캐시 덮어쓰기
  - `has()`: 존재 여부 확인
  - `invalidate()`: 캐시 삭제
  - `clear()`: 전체 캐시 삭제
- [ ] 5.4.3 TTL 만료 테스트
  - 만료 전 캐시 히트
  - 만료 후 캐시 미스
  - 커스텀 TTL 적용
- [ ] 5.4.4 파일 시스템 모킹 테스트
  - 디렉토리 생성 검증
  - 파일 읽기/쓰기 검증
  - 에러 처리 검증 (권한 없음, 디스크 가득 참 등)

#### 5.5 캐시 통합 테스트
- [ ] 5.5.1 `trending.test.ts`에 캐시 통합 테스트 추가
- [ ] 5.5.2 캐시 히트 시나리오 테스트
  - API 호출 생략 검증
  - 캐시 데이터 반환 검증
- [ ] 5.5.3 캐시 미스 시나리오 테스트
  - API 호출 검증
  - 캐시 저장 검증

### 6.0 통합 테스트 및 문서화

#### 6.1 End-to-End 통합 테스트
- [ ] 6.1.1 `packages/core/src/__tests__/integration/keyword-revenue.test.ts` 파일 생성
- [ ] 6.1.2 전체 워크플로우 테스트
  - trending 명령어 → Google Ads API 호출 → 수익성 점수 계산 → 결과 출력
  - `--revenue` 옵션 활성화 시 전체 파이프라인 검증
- [ ] 6.1.3 캐싱 동작 통합 테스트
  - 첫 번째 호출: 캐시 미스 → API 호출 → 캐시 저장
  - 두 번째 호출: 캐시 히트 → API 호출 생략
- [ ] 6.1.4 에러 처리 통합 테스트
  - Google Ads API 실패 시 사용자 친화적 에러 메시지
  - 네트워크 에러 시 재시도 로직 동작 확인

#### 6.2 문서화
- [ ] 6.2.1 `docs/GOOGLE_ADS_SETUP.md` 작성
  - Google Ads 계정 생성 가이드
  - 개발자 토큰 발급 방법
  - OAuth 2.0 인증 설정
  - 환경 변수 설정 예제
  - 트러블슈팅 섹션
- [ ] 6.2.2 `docs/PRODUCTION_GUIDE.md` 업데이트
  - Step 1에 `blog trending --revenue` 추가
  - 키워드 조사 워크플로우 설명
  - 예제 명령어 추가
- [ ] 6.2.3 `README.md` 업데이트
  - Epic 8.0 기능 추가
  - 사용 예제 추가
  - Google Ads API 설정 링크
- [ ] 6.2.4 `CHANGELOG.md` 업데이트
  - Epic 8.0 항목 추가
  - 주요 기능 나열
  - Breaking changes 확인 (없음)

#### 6.3 전체 시스템 테스트 및 검증
- [ ] 6.3.1 전체 테스트 실행
  - `pnpm test` 실행
  - 모든 유닛 테스트 통과 확인
  - 모든 통합 테스트 통과 확인
- [ ] 6.3.2 테스트 커버리지 확인
  - 목표: core 패키지 82%+ 유지
  - 새 모듈(keyword-research, revenue-scoring, cache, topic-suggestion) 80%+ 커버리지
- [ ] 6.3.3 실제 Google Ads API 테스트 (선택사항)
  - 개발 환경에서 실제 API 호출 검증
  - 응답 데이터 검증
  - 에러 처리 검증
- [ ] 6.3.4 CLI 수동 테스트
  - `blog trending --revenue` 명령 실행
  - `blog trending --revenue --output result.json` 실행
  - `blog trending --revenue --format json` 실행
  - 터미널 출력 포맷 검증
  - JSON 파일 형식 검증

---

**Status**: Sub-tasks generated. Ready for implementation.
