# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2025-01-14

### Added

#### RAG Production Module (TDD Implementation)
- **RAG 평가 시스템** (`rag-evaluation.ts`): RAG 시스템 품질 측정
  - `RAGEvaluationMetrics` 인터페이스: 정확도, 관련성, 충실도 지표
  - `calculateRAGScore()`: 가중치 기반 종합 점수 계산
  - `RAGEvaluator` 클래스: 테스트 케이스 기반 평가 실행

- **임베딩 캐시 시스템** (`embedding-cache.ts`): 비용 최적화
  - `EmbeddingCache` 클래스: TTL 기반 LRU 캐시
  - `CachedEmbedder` 클래스: 캐시 적용 임베딩 래퍼
  - `estimateMonthlyCost()`: 월간 비용 예측
  - `selectModel()`: 용도별 모델 선택 (Haiku/Sonnet/Opus)

- **메트릭 및 알림 시스템** (`rag-metrics.ts`): 프로덕션 모니터링
  - `MetricsCollector` 클래스: 요청/지연시간/캐시 메트릭 수집
  - `AlertManager` 클래스: 임계값 기반 알림 발생
  - `RAGError` 클래스: 커스텀 에러 및 재시도 지원
  - `withRetry()`: 지수 백오프 재시도 래퍼

### Tests

- rag-evaluation.test.ts: TDD 방식 9개 테스트
- embedding-cache.test.ts: TDD 방식 15개 테스트
- rag-metrics.test.ts: TDD 방식 16개 테스트

### Content

- RAG Day 6 블로그 포스트 작성: 프로덕션 배포와 최적화
  - RAG 평가 지표 및 구현
  - 비용 최적화 전략 (임베딩 캐싱, 모델 선택)
  - 프로덕션 배포 (API 서버, 에러 처리)
  - 모니터링 시스템

## [0.1.3] - 2025-01-12

### Added

#### RAG Module (TDD Implementation)
- **RAG 모듈 구현**: Claude 통합 및 답변 생성을 위한 핵심 모듈
  - `estimateTokens()`: 텍스트 토큰 수 추정 (4자 = 1토큰)
  - `manageContextWindow()`: 토큰 제한에 맞게 문서 선택
  - `injectContext()`: 검색 문서를 프롬프트에 주입
  - `buildRAGPrompt()`: 환각 방지 지시 포함 RAG 프롬프트 생성
  - `extractCitations()`: 답변에서 출처 정보 추출
  - `formatAnswer()`: 출처 포함 최종 답변 포맷팅
  - `RAGGenerator` 클래스: 전체 RAG 파이프라인 관리

### Tests

- rag.test.ts: TDD 방식으로 30개 테스트 구현
  - estimateTokens: 4개 테스트
  - manageContextWindow: 4개 테스트
  - injectContext: 3개 테스트
  - buildRAGPrompt: 5개 테스트
  - extractCitations: 6개 테스트
  - formatAnswer: 5개 테스트
  - RAGGenerator: 3개 테스트

## [0.1.2] - 2025-01-08

### Added

#### AI Tag Translation System
- **태그 AI 번역**: 한국어 태그를 SEO 최적화된 영어 태그로 자동 번역
  - Claude AI 기반 번역으로 정확한 기술 용어 처리
  - 영어 태그는 그대로 유지, 한국어 태그만 번역
  - 최대 10개 태그 제한 유지
  - 번역 실패 시 원본 태그 폴백

#### Translation Quality Improvements
- **중복 Frontmatter 방지**: 번역 결과에서 중복 frontmatter 자동 제거
  - `removeDuplicateFrontmatter()` 함수 추가
  - Claude가 번역 시 frontmatter를 포함하는 케이스 처리

### Removed

- **번역 배너 제거**: 영문 포스트의 "🌐 Translation: Translated from Korean" 배너 삭제
  - `generateTranslationDisclaimer()` 함수 제거
  - 클린한 영문 포스트 본문 제공

### Changed

- **translator.ts**: `optimizeTags()` → `translateTags()` (AI 기반 번역으로 전환)
- **translate.ts**: 번역 결과 저장 시 중복 frontmatter 제거 로직 추가

### Tests

- translator.test.ts: 배너 미포함 테스트 추가, 태그 번역 테스트 5개 추가
- translate.test.ts: 중복 frontmatter 제거 테스트 8개 추가

## [0.1.1] - 2025-10-29

### Added

#### Keyword Revenue Optimization (Epic 8.0)
- **Google Ads API Integration**: Data-driven topic selection with revenue metrics
  - `blog trending --revenue` command for profitability analysis
  - Real-time keyword data: search volume, CPC, competition level
  - Comprehensive revenue scoring (0-100) based on multiple factors
  - Integration with trending topic monitoring for combined social + revenue insights

- **KeywordCache System**: File-based caching for API optimization
  - 24-hour TTL (Time-To-Live) for keyword data
  - MD5 hash-based cache keys for safe file naming
  - Automatic expiration checking with lazy cleanup
  - Cache statistics logging (hit rate, API calls saved)
  - 5x+ performance improvement on cached queries

- **Revenue Scoring Algorithm**: Multi-factor profitability evaluation
  - Search Volume Score (40%): Monthly search count normalized to 0-100
  - CPC Score (30%): Cost-per-click value (higher = better revenue potential)
  - Competition Score (20%): Inverted competition index (lower competition = higher score)
  - Trend Boost (10%): Recent trend momentum bonus

- **Topic Suggestion System**: AI-powered content recommendations
  - Trending topics with revenue data analysis
  - Priority classification (HIGH/MEDIUM/LOW) based on combined scores
  - Detailed reasoning for each suggestion (trend score, revenue potential, SEO value, relevance)
  - Multi-dimensional sorting (trend 40%, revenue 30%, SEO 20%, relevance 10%)

- **CLI Extensions**: Revenue-focused commands
  - `--revenue` flag for trending analysis with Google Ads data
  - `--output <file>` flag for JSON export of analysis results
  - `--format table` option for tabular display
  - Colored, emoji-rich terminal output for better readability

- **Documentation**: Comprehensive setup and usage guides
  - [docs/GOOGLE_ADS_SETUP.md](docs/GOOGLE_ADS_SETUP.md) - Complete Google Ads API configuration guide
  - Updated [docs/PRODUCTION_GUIDE.md](docs/PRODUCTION_GUIDE.md) with revenue-based workflows
  - Updated README.md with Epic 8.0 features and examples

#### SEO Optimization System Enhancement (Epic 7.0)
- **Length-Adaptive SEO Analysis**: Dynamic SEO scoring based on post length
  - Automatic post length calculation with empty line filtering
  - Length-based keyword density adjustment (0.7x-1.0x multiplier)
    - Posts < 500 lines: 1.0x (target: 0.50-2.50%)
    - Posts 500-1000 lines: 0.9x (target: 0.45-2.25%)
    - Posts 1000-1500 lines: 0.8x (target: 0.40-2.00%)
    - Posts 1500+ lines: 0.7x (target: 0.35-1.75%)
  - Section distribution analysis (H2-based keyword distribution)
  - Enhanced SEO scoring with 7 categories (added section distribution 20pt)
  - Word boundary regex for accurate keyword matching

- **CLI SEO Analysis Tool**: New `analyze-seo` command for comprehensive SEO evaluation
  - `blog analyze-seo <file>` - Basic SEO analysis with color-coded scores
  - `--verbose` flag - Detailed section-by-section keyword distribution
  - `--json` flag - Machine-readable output for automation
  - Visual progress bars for category scores
  - Actionable improvement suggestions with specific section names and keyword counts
  - Edge case handling (missing title, missing keywords, file not found)

- **Guidelines v1.3**: Enhanced blog post generation guidelines
  - Long post SEO strategy section
  - Length-based keyword density formulas
  - Section-by-section keyword placement strategies
  - Length-based SEO score targets (65-80+ depending on length)
  - Keyword distribution best practices

### Improved

- **SEO Algorithm**: Upgraded from fixed density targets to length-adaptive scoring
  - More fair evaluation for long-form content (1000+ lines)
  - Prevents unfair penalties for naturally lower density in longer posts
  - All 38 SEO unit tests passing with comprehensive edge case coverage

### Documentation

- Updated README.md with SEO analysis usage examples and feature descriptions
- Documented length-based weighting system
- Added comprehensive testing documentation

## [0.1.0] - 2025-10-27

### Added

#### AI Content Generation (Epic 1.0)
- **AI Draft Creation**: Claude-powered blog post generation with customizable templates
  - `blog draft create` command with topic, keywords, and word count options
  - Support for Korean and English content generation
  - Template system for different content types (blog-post, review, tutorial)
- **Draft Refinement**: AI-based content improvement and editing
  - `blog draft refine` command for iterative content enhancement
  - Customizable refinement instructions

#### WordPress Integration (Epic 1.0)
- **Automated Publishing**: One-click markdown to WordPress conversion
  - `blog publish` command with draft/publish status options
  - Automatic markdown to HTML conversion
  - Support for multilingual content (Korean/English)
  - Dry-run mode for testing without actual upload
- **Post Management**: WordPress post operations
  - `blog list` command with status and limit filters
  - `blog delete` command with confirmation prompts
  - Post status management (publish, draft, private)
- **Configuration**: WordPress connection setup
  - `blog config` command for credential management
  - Support for WordPress application passwords
  - Environment variable configuration

#### Real-time Preview System (Epic 2.0)
- **Live Preview Server**: Development server with hot reload
  - `blog preview` command with customizable port
  - Real-time markdown rendering with WordPress styling
  - Automatic browser opening
  - File watch with instant reload
- **Ad Position Visualization**: Visual indicators for AdSense placement
  - Optional `--show-ads` flag
  - Preview of ad insertion locations
  - Actual blog appearance simulation

#### SEO Automation (Epic 3.0)
- **Automatic Meta Tag Generation**: SEO optimization for all posts
  - Title, description, and keywords extraction from frontmatter
  - Open Graph tags for social media sharing (Facebook, LinkedIn)
  - Twitter Card tags for Twitter optimization
  - Canonical URL generation
- **Keyword Optimization**: Content SEO analysis
  - Keyword density calculation (target: 0.5-2.5%)
  - Automatic keyword warnings for over/under optimization
  - SEO-friendly title and description validation
- **Slug Management**: URL optimization
  - Automatic Korean to English slug transliteration
  - Custom slug support via frontmatter
  - SEO-friendly URL generation

#### Image Generation (Epic 4.0)
- **DALL-E 3 Integration**: AI-powered blog image creation
  - `blog image generate` command with customizable prompts
  - Multiple size options (1024x1024, 1792x1024, 1024x1792)
  - Quality settings (standard, HD)
  - Style options (vivid, natural)
  - Automatic image download and local storage
  - WordPress-ready image preparation

#### Trending Monitoring (Epic 4.0)
- **Multi-Platform Trend Tracking**: Real-time topic discovery
  - `blog trending` command with source selection
  - Reddit trending topics with score calculation
  - Hacker News top stories monitoring
  - Twitter trending topics (optional, requires API key)
  - Keyword filtering and minimum score thresholds
  - Combined trend scoring algorithm

#### Analytics Dashboard (Epic 4.0)
- **Blog Performance Metrics**: Comprehensive analytics
  - `blog analytics` command with period selection (week, month, year)
  - Total views and comment statistics
  - Popular posts ranking (by views or comments)
  - Time period filtering
  - Customizable result limits

#### Testing Infrastructure (Epic 5.0)
- **Comprehensive Test Suite**: Quality assurance
  - Vitest configuration with v8 coverage provider
  - 167 total tests (112 core, 55 CLI)
  - 82% core coverage, 67% CLI coverage
  - Integration tests for draft-to-publish workflow
  - Mock implementations for external APIs
  - 10-minute timeout for AI operations

### Technical Details

#### Core Architecture
- **Monorepo Structure**: pnpm workspaces with three packages
  - `@blog/cli`: Command-line interface
  - `@blog/core`: Core business logic
  - `@blog/shared`: Shared types and schemas
- **TypeScript 5.3+**: Full type safety with strict mode
- **ES Modules**: Native ESM support throughout
- **Testing**: Vitest with comprehensive coverage
- **Package Manager**: pnpm 9+ with workspace support

#### WordPress Integration
- **REST API**: Full WordPress REST API integration
- **WPAPI Client**: wpapi library for type-safe WordPress operations
- **Authentication**: Application password support
- **Markdown Processing**: marked library for HTML conversion

#### AI Services
- **Claude**: Anthropic Claude for content generation and refinement
- **DALL-E 3**: OpenAI DALL-E 3 for image generation
- **Configurable**: Environment variable-based API key management

#### External APIs
- **Reddit API**: Public API for trending topics
- **Hacker News API**: Firebase-based HN API
- **Twitter API**: Bearer token authentication (optional)
- **Rate Limiting**: Built-in retry mechanisms

#### Frontend Technologies
- **Preview Server**: Express.js with live reload
- **Live Reload**: Socket.io for real-time communication
- **File Watching**: Chokidar for file system monitoring
- **Markdown Rendering**: Marked with syntax highlighting

#### Development Tools
- **CLI Framework**: Commander.js for command parsing
- **Terminal UI**: Chalk for colored output, Ora for spinners
- **Validation**: Zod for schema validation
- **Error Handling**: Comprehensive error messages and recovery

### Documentation

- **README.md**: Comprehensive project documentation
  - Feature overview and capabilities
  - Installation guide with prerequisites
  - Usage examples for all commands
  - Project structure explanation
  - Testing instructions
  - Development workflow
  - Technology stack details
  - Roadmap with Epic tracking
- **CHANGELOG.md**: Version history and release notes

### Configuration

#### Environment Variables
```env
# WordPress Connection
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

# Google AdSense
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# OpenAI (Image Generation)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# Twitter API (Optional)
TWITTER_BEARER_TOKEN=AAAAAAAAAxxxxxxxxxx
```

#### File Structure
```
blog/
├── packages/
│   ├── cli/              # CLI commands
│   ├── core/             # Core business logic
│   └── shared/           # Shared types
├── content/
│   ├── drafts/           # AI-generated drafts
│   └── posts/            # Publication-ready posts
├── prompts/              # AI prompt templates
└── .env                  # Configuration
```

### Known Limitations

- Twitter API integration requires bearer token (optional)
- WordPress application password required (not regular password)
- Some integration tests require actual WordPress instance
- DALL-E 3 requires OpenAI API key with billing enabled
- Preview server uses fixed port range (3000-3100)

### Migration Notes

This is the initial release (v0.1.0). No migration required.

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/blog.git
cd blog

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build
pnpm build

# Install CLI globally (optional)
cd packages/cli
pnpm link --global
```

### Contributors

- Initial development and Epic 1-5 implementation

### License

MIT

---

[0.1.0]: https://github.com/your-username/blog/releases/tag/v0.1.0
