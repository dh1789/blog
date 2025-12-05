---
title: "오픈소스 프로젝트 공개 전 체크리스트: 프로젝트 정리부터 라이선스 준수까지"
slug: "opensource-project-preparation-checklist"
excerpt: "GitHub에 프로젝트 공개하려다 라이선스 위반할 뻔? 실전 경험으로 배운 프로젝트 정리 방법과 Apache-2.0 라이선스 준수 가이드. git mv로 히스토리 보존하며 22개 파일 정리, attribution 헤더 추가까지 완벽 가이드."
status: "publish"
categories:
  - "개발"
  - "오픈소스"
tags:
  - "오픈소스"
  - "라이선스"
  - "Apache-2.0"
  - "GitHub"
  - "Git"
  - "프로젝트관리"
language: "ko"
---

# 오픈소스 프로젝트 공개 전 체크리스트: 프로젝트 정리부터 라이선스 준수까지

## TL;DR

- **문제**: GitHub 공개 전 산재된 파일 + 라이선스 위반 위험
- **해결**: 프로젝트 구조 정리 + Apache-2.0 attribution 추가
- **성과**: 22개 파일 정리 (히스토리 보존), 라이선스 완벽 준수

---

## 1. 시작: "공개하려다 라이선스 위반할 뻔"

WordPress 자동화 블로그 프로젝트를 GitHub에 공개하려던 순간, 치명적인 문제를 발견했습니다.

**상황**:
- 루트 디렉토리에 16개 .md 파일이 산재
- 다른 오픈소스 프로젝트에서 복사한 워크플로우 파일 3개
- attribution(출처 명시) 없음 → **Apache-2.0 라이선스 위반 위험**

"이대로 공개했다가는 법적 문제가..."

---

## 2. Phase 1: 프로젝트 구조 정리

### 2.1 문제: 산재된 .md 파일들

```
blog/
├── README.md
├── CLAUDE.md
├── WORKFLOW-GUIDE.md
├── WRITING-CHECKLIST.md
├── TRANSLATION-PATTERNS.md
├── POLYLANG-AUTO-LINK-SPEC.md
├── TRANSLATION-PROJECT-SUMMARY.md
├── WORK_LOG.md
├── create-prd.md
├── generate-tasks.md
├── process-task-list.md
├── ... (더 많은 .md 파일들)
```

**왜 문제인가?**
- 어떤 파일이 중요한지 알 수 없음
- 사용자가 프로젝트를 이해하기 어려움
- 협업과 유지보수가 불편

### 2.2 해결: docs/ 계층 구조 설계

목표: **루트는 깔끔하게, 문서는 체계적으로**

```
blog/
├── README.md              # 프로젝트 개요
├── CLAUDE.md              # Claude Code 작업 가이드
├── CHANGELOG.md           # 변경 로그
├── ISSUES.md              # 이슈 트래킹
│
└── docs/                  # 모든 문서를 여기에
    ├── guides/            # 사용 가이드
    │   ├── WORKFLOW-GUIDE.md
    │   ├── WRITING-CHECKLIST.md
    │   └── TRANSLATION-PATTERNS.md
    ├── specs/             # 기술 스펙
    │   └── POLYLANG-AUTO-LINK-SPEC.md
    ├── archive/           # 완료된 작업 문서
    │   ├── prds/
    │   └── tasks/
    └── prompts/           # AI 프롬프트 템플릿
```

### 2.3 실행: git mv로 히스토리 보존

**핵심 팁**: `mv` 대신 `git mv`를 사용하세요!

```bash
# ❌ 잘못된 방법: 히스토리 손실
mv WORKFLOW-GUIDE.md docs/guides/

# ✅ 올바른 방법: 히스토리 보존
git mv WORKFLOW-GUIDE.md docs/guides/
```

**왜 중요한가?**
- `git mv`는 파일의 전체 변경 이력을 보존
- `git log --follow`로 이동 후에도 히스토리 추적 가능
- 협업 시 "누가 왜 이 코드를 작성했는지" 알 수 있음

**실제 작업**:

```bash
# 1. docs/ 하위 디렉토리 생성
mkdir -p docs/guides docs/specs docs/archive/prds docs/archive/tasks docs/prompts

# 2. 가이드 파일 이동
git mv WORKFLOW-GUIDE.md docs/guides/
git mv WRITING-CHECKLIST.md docs/guides/
git mv TRANSLATION-PATTERNS.md docs/guides/

# 3. 스펙 파일 이동
git mv POLYLANG-AUTO-LINK-SPEC.md docs/specs/

# 4. 완료된 작업 문서 아카이빙
git mv TRANSLATION-PROJECT-SUMMARY.md docs/archive/
git mv WORK_LOG.md docs/archive/
git mv tasks/9.0-prd-auto-translation-system.md docs/archive/prds/
git mv tasks/tasks-9.0-prd-auto-translation-system.md docs/archive/tasks/

# 5. prompts/ 폴더 통째로 이동
git mv prompts docs/
```

**결과**: 22개 파일 정리 완료 (히스토리 100% 보존)

### 2.4 README.md 업데이트

사용자가 바로 이해할 수 있도록 프로젝트 구조 섹션 추가:

```markdown
## 📂 프로젝트 구조

```
blog/
├── packages/          # 소스 코드 (TypeScript, monorepo)
│   ├── cli/          # CLI 도구 (사용자 인터페이스)
│   ├── core/         # 핵심 로직 (WordPress API, 번역, 이미지)
│   └── shared/       # 공유 타입 및 유틸리티
│
├── content/          # 블로그 콘텐츠 (마크다운)
│   ├── posts/        # 블로그 포스트 (ko/, en/)
│   ├── pages/        # 고정 페이지
│   └── templates/    # 포스트 템플릿
│
├── docs/             # 프로젝트 문서
│   ├── guides/       # 사용 가이드
│   ├── specs/        # 기술 스펙
│   ├── archive/      # 완료된 작업 문서
│   └── prompts/      # AI 프롬프트 템플릿
│
└── README.md         # 이 파일
```
```

---

## 3. Phase 2: Apache-2.0 라이선스 준수

### 3.1 문제: attribution 누락

프로젝트를 점검하던 중, 치명적인 발견:

```markdown
# .gitignore
create-prd.md          # ← 다른 저장소에서 복사
generate-tasks.md      # ← 다른 저장소에서 복사
process-task-list.md   # ← 다른 저장소에서 복사
```

**원본 출처**: [ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks)
**라이선스**: Apache-2.0
**문제**: **출처 명시 없음** → 라이선스 위반!

### 3.2 Apache-2.0 라이선스 요구사항

Apache-2.0은 **permissive(허용적) 라이선스**지만, 몇 가지 의무사항이 있습니다:

**필수 사항 3가지**:
1. ✅ **원본 저작권 고지** (Copyright notice)
2. ✅ **라이선스 명시** (License notice)
3. ✅ **수정 내역 문서화** (Modifications notice)

**선택 사항**:
- NOTICE 파일 제공 (권장)
- 특허 사용 고지 (해당 시)

### 3.3 해결: attribution 헤더 추가

각 파일 최상단에 attribution 헤더 추가:

```markdown
<!--
Original source: https://github.com/snarktank/ai-dev-tasks
Copyright: Original authors of ai-dev-tasks
License: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)

Modified by: idongho for Korean blog automation project
Modifications:
  - Added AskUserQuestion tool integration for Claude Code interactive interface
  - Adapted PRD template for Korean blog automation workflow
  - Enhanced clarifying questions process with structured options
-->

# Rule: Generating a Product Requirements Document (PRD)
...
```

**3개 파일에 각각 추가**:
- `create-prd.md` - PRD 생성 가이드
- `generate-tasks.md` - 태스크 생성 가이드
- `process-task-list.md` - 태스크 관리 가이드

### 3.4 README.md에 Credits 섹션 추가

라이선스 섹션 위에 Credits 섹션 추가:

```markdown
## 📜 Credits

This project uses workflow templates from [ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks) licensed under Apache-2.0.

**Modified files**:
- `create-prd.md` - PRD generation guide adapted for Korean blog automation with AskUserQuestion tool integration
- `generate-tasks.md` - Task generation guide with enhanced testing requirements
- `process-task-list.md` - Task management guide with strengthened test execution policy

Original license: [Apache-2.0](https://github.com/snarktank/ai-dev-tasks/blob/main/LICENSE)
```

### 3.5 커밋 및 푸시

```bash
git add README.md
git commit -m "docs: Apache-2.0 라이선스 attribution 추가

- README.md에 Credits 섹션 추가
- ai-dev-tasks 저장소 출처 명시 및 수정 파일 목록 작성
- 로컬 워크플로우 파일 3개에 attribution 헤더 추가

원본 출처: https://github.com/snarktank/ai-dev-tasks
라이선스: Apache-2.0"

git push
```

---

## 4. GitHub 공개 전 체크리스트

### 📋 프로젝트 정리

- [ ] 루트 디렉토리에 필수 파일만 남기기 (README, LICENSE, etc.)
- [ ] docs/ 계층 구조 설계 (guides/, specs/, archive/)
- [ ] `git mv`로 파일 이동 (히스토리 보존)
- [ ] README.md에 프로젝트 구조 섹션 추가
- [ ] .gitignore 업데이트 (민감한 정보, 개인 파일)

### 📜 라이선스 준수

- [ ] 사용한 오픈소스 라이브러리/코드 목록 작성
- [ ] 각 라이선스 요구사항 확인 (MIT, Apache-2.0, GPL, etc.)
- [ ] attribution 헤더 추가 (Apache-2.0, GPL)
- [ ] README.md에 Credits 섹션 추가
- [ ] LICENSE 파일 생성 (본인 프로젝트 라이선스)

### 🔒 보안

- [ ] .env 파일이 .gitignore에 있는지 확인
- [ ] API 키, 비밀번호 제거
- [ ] 민감한 정보가 Git 히스토리에 없는지 확인
- [ ] .env.example 파일 제공

### 📝 문서화

- [ ] README.md 작성 (설치, 사용법, 기여 가이드)
- [ ] CHANGELOG.md 작성
- [ ] CONTRIBUTING.md 작성 (협업 가이드)
- [ ] 코드에 주석 추가

---

## 5. 배운 점

### 5.1 git mv의 중요성

**Before**:
```bash
mv old.md new.md
git add new.md
```
→ Git은 새 파일로 인식, 히스토리 손실

**After**:
```bash
git mv old.md new.md
```
→ Git이 이동으로 인식, 히스토리 보존

**확인**:
```bash
git log --follow new.md  # 이동 전 히스토리도 표시
```

### 5.2 라이선스는 법적 의무

"나중에 해야지"가 아니라 **처음부터 제대로 해야** 합니다.

- Apache-2.0: attribution + 수정 내역
- MIT: 저작권 고지
- GPL: 소스 공개 의무

### 5.3 프로젝트 구조는 협업의 시작

깔끔한 구조 = 낮은 진입 장벽 = 더 많은 기여자

```
✅ 좋은 구조: 사용자가 5분 안에 이해
❌ 나쁜 구조: 사용자가 30분 헤맴
```

---

## 6. 다음 단계

✅ **완료**:
- 프로젝트 구조 정리 (22개 파일)
- Apache-2.0 라이선스 준수
- README.md 업데이트

🚧 **진행 중**:
- CONTRIBUTING.md 작성
- GitHub Actions CI/CD 설정
- 이슈 템플릿 추가

---

## 참고 자료

### 오픈소스 라이선스

- [Choose a License](https://choosealicense.com/) - 라이선스 선택 가이드
- [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0) - 원문
- [TLDRLegal](https://tldrlegal.com/) - 라이선스 요약

### Git 베스트 프랙티스

- [Git - git-mv Documentation](https://git-scm.com/docs/git-mv)
- [Preserving History When Moving Files](https://stackoverflow.com/questions/2314652/)

### 프로젝트 구조

- [Standard Readme](https://github.com/RichardLitt/standard-readme) - README 작성 가이드
- [Changelog Convention](https://keepachangelog.com/) - CHANGELOG 작성 규칙

---

**이 포스트가 도움이 되셨나요?**

GitHub 프로젝트 공개를 준비 중이시라면, 이 체크리스트를 참고하여 라이선스 위반 없이 안전하게 공개하세요!

질문이나 제안이 있으시면 댓글로 남겨주세요. 🙌
