# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-10-29

### Added

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
