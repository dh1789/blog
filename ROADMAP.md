# ROADMAP.md

WordPress Content Automation CLI 개발 로드맵

---

## 완료된 기능

### Phase 1 - MVP ✅
- 프로젝트 구조 설정 (pnpm workspace, TypeScript)
- WordPress API 클라이언트 (`WordPressClient`)
- 마크다운 파싱 (`parseMarkdownFile`)
- 광고 코드 자동 삽입 (`injectAds`)
- CLI 기본 명령어 (`publish`, `list`, `delete`, `config`)

### Epic 11.0 - AI 자동 번역 ✅
- Claude Code 번역 엔진 통합
- 8단계 품질 검증 시스템
- SEO 최적화 (영문 제목/요약 자동 생성)
- Polylang 자동 연결
- `--no-translate` 옵션

### Epic 12.0 - 미디어 라이브러리 통합 ✅
- 이미지 자동 업로드
- 중복 감지 및 URL 재사용
- `--upload-images` 옵션

### PRD 0014 - 포스트 생성 개선 ✅
- 시리즈 자동 감지 및 네비게이션
- 한영 링크 자동 변환
- 번역 배너 삽입
- `blog status` 명령어
- `--force` 옵션

---

## 진행 중

### SEO 키워드 밀도 자동 최적화
- 번역 시 키워드 밀도 자동 분석 ✅
- 부족한 키워드 자동 주입 ⏳

---

## 계획

### 단기
- 배치 번역 (여러 포스트 동시 처리)
- 번역 캐싱 (부분 재번역)

### 중기
- Git Hook 통합 (커밋 시 자동 번역)
- Watch 모드 (파일 변경 감지)
- 이미지 최적화 (압축, 리사이징)

### 장기
- 완전 자동화 파이프라인 (AI 생성 → 발행)
- 다국어 확장 (일본어, 중국어)
- 웹 대시보드 (Next.js)
- 성과 분석 대시보드

---

**마지막 업데이트**: 2025-12-30
