# Epic 13.0 Task 2.0 진행 상황 체크포인트

**작성일**: 2025-11-05
**상태**: 🟡 일시 중단 (OpenAI API 키 필요)

---

## 완료된 작업

### ✅ Task 1.0: 벤치마크 조사 및 설정 파일 생성
- 모든 서브태스크 (1.1-1.5) 완료
- 커밋: `7c9b6fb`
- 생성 파일:
  - `config/image-defaults.json` - 최종 권장 설정값
  - `tasks/benchmark-results-image-strategy.md` - 종합 보고서
  - `packages/core/src/benchmark-analyzer.ts` - 재실행 도구
  - 기타 크롤링 데이터 및 분석 문서

### 🟡 Task 2.0: 이미지 생성 엔진 스파이크 및 선택 (진행 중)

#### 완료된 서브태스크

**Task 2.1 (부분 완료)**: Claude Code CLI 이미지 생성 기능 검증
- ✅ **결론**: Claude API는 텍스트 생성 전용이며, 이미지 생성 기능이 없음
- ✅ Claude Vision은 이미지 **인식**만 가능하며, **생성**은 불가능
- ✅ **결정**: DALL-E 3 API로 즉시 전환

**스크립트 작성 완료**:
- ✅ `scripts/spike-image-generation.mjs` 생성 완료
  - Task 2.1-2.4를 자동으로 검증하는 스크립트
  - DALL-E 3 API를 사용한 종합 검증 수행

#### 생성된 파일

```
scripts/spike-image-generation.mjs
```

**스크립트 기능**:
1. Claude Code CLI 이미지 생성 불가 확인
2. DALL-E 3 API 기본 기능 검증
3. 품질/크기 제어 가능성 검증 (1024x1024, 1792x1024, standard/hd)
4. 비용 및 속도 측정 (3회 반복, 평균 계산)
5. 블로그 컨텍스트 기반 이미지 생성 테스트
6. 결과 JSON 파일 자동 생성 (`data/spike-results/spike-results.json`)
7. 생성된 이미지 자동 저장 (`data/spike-results/images/`)

---

## 중단 사유

**OpenAI API 키 필요**:
- DALL-E 3 API를 사용하려면 `OPENAI_API_KEY` 환경 변수 설정 필요
- API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급 가능
- 비용: DALL-E 3 standard quality 1024x1024 이미지 = $0.040/장

---

## 다음 진행 단계

### 1. OpenAI API 키 설정

```bash
# OpenAI API 키 발급
# https://platform.openai.com/api-keys

# 환경 변수 설정
export OPENAI_API_KEY="your-api-key-here"

# 또는 .env 파일에 추가
echo "OPENAI_API_KEY=your-api-key-here" >> .env
```

### 2. 스파이크 검증 스크립트 실행

```bash
# 스크립트 실행
node scripts/spike-image-generation.mjs

# 예상 소요 시간: 약 3-5분
# 예상 비용: 약 $0.50 (총 9-10개 이미지 생성)
```

**실행 결과**:
- `data/spike-results/spike-results.json` - 검증 결과 JSON
- `data/spike-results/images/` - 생성된 이미지 파일들
  - `task-2.1-basic.png`
  - `task-2.2-standard-1024.png`
  - `task-2.2-hd-1024.png`
  - `task-2.2-hd-1792-wide.png`
  - `task-2.2-hd-1792-tall.png`
  - `task-2.4-WordPress-자동화.png`
  - `task-2.4-SEO-최적화.png`

### 3. 남은 서브태스크 진행

**Task 2.5**: DALL-E와 비교 평가 및 최종 선택
- Claude Code CLI vs DALL-E 비교 (이미 결론: DALL-E 선택)
- 장단점 분석 문서화

**Task 2.6**: 스파이크 결과 문서화
- `tasks/spike-results-image-generation.md` 작성
- 4가지 검증 항목 결과 상세 기록
- 성능 측정 데이터 정리
- 선택된 엔진 및 이유 명시

**Task 2.7**: API 제약사항 저장
- `config/claude-code-cli-limits.json` 생성
  - 일일 요청 제한: OpenAI Rate Limits 기준
  - 동시 요청 제한
  - 최적 설정값 (권장 해상도, 품질, 포맷)
  - 타임아웃 설정 권장값

**Task 2.8**: 최적 프롬프트 템플릿 작성
- 블로그 포스트용 프롬프트 템플릿
- 동적 요소 정의 (title, excerpt, keywords, language)
- 카테고리별 스타일 변경 로직

**Task 2.9**: `packages/core/src/spike-validator.ts` 구현 및 테스트
- `SpikeValidator` 클래스 구현
- `validateImageGeneration()` 메서드
- `saveResults()` 메서드
- 단위 테스트 작성 (3가지: Happy Path, Boundary, Exception)

---

## 예상 비용

### DALL-E 3 API 가격 (2024년 기준)

| 해상도 | Quality | 가격 |
|--------|---------|------|
| 1024×1024 | standard | $0.040 |
| 1024×1024 | hd | $0.080 |
| 1792×1024 | hd | $0.080 |
| 1024×1792 | hd | $0.080 |

### 스파이크 검증 예상 비용

| 태스크 | 이미지 개수 | 해상도 | Quality | 예상 비용 |
|--------|------------|--------|---------|----------|
| 2.1 기본 생성 | 1개 | 1024×1024 | standard | $0.040 |
| 2.2 크기 제어 | 4개 | 다양 | standard/hd | $0.200 |
| 2.3 속도 측정 | 3개 | 1024×1024 | standard | $0.120 |
| 2.4 블로그 컨텍스트 | 2개 | 1792×1024 | hd | $0.160 |
| **총계** | **10개** | - | - | **$0.52** |

### 실제 운영 예상 비용 (월간)

가정:
- 월 20개 포스트 발행
- 포스트당 이미지 5개 (Featured 1개 + Content 4개)
- Featured: 1200×630 hd (DALL-E는 1024×1792 사용)
- Content: 800×450 standard (DALL-E는 1024×1024 사용)

계산:
- Featured 이미지: 20개 × $0.080 = $1.60
- Content 이미지: 80개 × $0.040 = $3.20
- **월 총 비용: $4.80**
- **연 총 비용: $57.60**

**참고**: Epic 13.0 목표는 간접 수익 증대이므로, AdSense RPM 증가를 통해 충분히 회수 가능

---

## 기술적 고려사항

### DALL-E 3 API 제약사항

1. **Rate Limits** (Tier 1 기준):
   - 분당 요청 수: 5 RPM (Requests Per Minute)
   - 분당 토큰 수: 10,000 TPM (이미지 생성은 토큰 대신 이미지 수로 계산)
   - 일일 한도: $100 (약 1250개 이미지)

2. **지원 크기**:
   - ✅ 1024×1024 (square)
   - ✅ 1792×1024 (wide)
   - ✅ 1024×1792 (tall)
   - ❌ 1200×630 (직접 지원 안 함 → Sharp로 리사이즈 필요)

3. **포맷**:
   - 생성: PNG만 지원
   - 변환: Sharp 라이브러리로 WebP 변환 필요

### 구현 시 고려사항

1. **이미지 리사이즈**:
   - Featured Image: 1792×1024 (hd) 생성 → 1200×630으로 crop/resize
   - Content Images: 1024×1024 (standard) 생성 → 800×450으로 crop/resize

2. **포맷 변환**:
   - PNG (생성) → WebP (최종)
   - Quality 85 (featured), 80 (content)

3. **에러 처리**:
   - Rate limit 초과: 재시도 로직 (exponential backoff)
   - 생성 실패: 경고 메시지 출력, 포스트 발행 계속 진행
   - 타임아웃: 60초 기본, 최대 120초

---

## 체크리스트

### Task 2.0 완료 조건

- [ ] OpenAI API 키 설정
- [ ] `scripts/spike-image-generation.mjs` 실행 성공
- [ ] `data/spike-results/spike-results.json` 생성 확인
- [ ] 생성된 이미지 파일들 확인
- [ ] Task 2.6: `tasks/spike-results-image-generation.md` 작성
- [ ] Task 2.7: `config/claude-code-cli-limits.json` 생성
- [ ] Task 2.8: 프롬프트 템플릿 작성
- [ ] Task 2.9: `spike-validator.ts` 구현 및 테스트
- [ ] Task 2.0 모든 서브태스크 완료
- [ ] Git commit 및 Discord 알림

---

## 참고 자료

### OpenAI 문서
- [DALL-E 3 API Reference](https://platform.openai.com/docs/guides/images)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Pricing](https://openai.com/pricing)

### 기존 구현
- `packages/core/src/image.ts` - DALL-E 통합 기존 코드
- `packages/core/src/image.test.ts` - 기존 테스트 (18 tests)

### Epic 13.0 문서
- `tasks/13.0-prd-ai-image-generation.md` - PRD
- `tasks/tasks-13.0-prd-ai-image-generation.md` - Task List
- `tasks/benchmark-results-image-strategy.md` - Task 1.0 결과

---

**다음 세션 시작 시**:
1. `cat tasks/spike-progress-checkpoint.md` 읽기
2. OpenAI API 키 설정 확인
3. `node scripts/spike-image-generation.mjs` 실행
4. Task 2.5-2.9 진행

**최종 업데이트**: 2025-11-05 15:30
