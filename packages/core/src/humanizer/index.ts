/**
 * @file Humanizer 모듈 공개 API
 * @description PRD 0016 - 애드센스 승인을 위한 콘텐츠 휴머나이제이션 시스템
 *
 * 모듈 구성:
 * - types: 핵심 인터페이스 및 타입 정의
 * - screenshot-generator: 터미널/브라우저 스크린샷 캡처 (Phase 2)
 * - experience-interviewer: 경험 인터뷰 질문 생성 (Phase 3)
 * - experience-generator: 경험담 문단 생성 (Phase 3)
 * - native-translator: 네이티브 영문 번역 (Phase 4)
 * - quality-checker: 품질 검증 (Phase 5)
 */

// Phase 1: 기반 구조 - 타입 정의
export {
  // 경험 질문 관련
  type ExperienceCategory,
  type ExperienceQuestion,
  EXPERIENCE_INSERT_POSITIONS,
  // 스크린샷 캡처 관련
  type TerminalCapture,
  type BrowserCapture,
  type APICapture,
  type CaptureType,
  type CaptureConfig,
  type ScreenshotOptions,
  type ScreenshotResult,
  // 번역 품질 관련
  type TranslationQualityCheck,
  // 품질 검증 관련
  type QualityChecklist,
  // 설정 관련
  type AuthorProfile,
  type ScreenshotDefaults,
  type HumanizerConfig,
  type HumanizationResult,
} from './types';

// Phase 2: 스크린샷 생성 시스템
export {
  ScreenshotGenerator,
  convertAnsiToHtml,
  createTerminalHtml,
} from './screenshot-generator';

// Phase 3: 경험 인터뷰 시스템
export {
  ExperienceInterviewer,
  generateExperienceQuestions,
  generateExperienceParagraph,
  insertExperienceParagraph,
  findInsertionPosition,
  QUESTION_POOL,
  type InsertionPosition,
} from './experience-interviewer';

// Phase 4: 네이티브 번역 강화
export {
  NativeTranslator,
  detectDirectTranslationPatterns,
  detectPassiveVoice,
  detectKoreanStructurePatterns,
  calculateAverageSentenceLength,
  analyzeTranslationQuality,
  generateNativeStylePrompt,
  DIRECT_TRANSLATION_PATTERNS,
  KOREAN_STRUCTURE_PATTERNS,
  type ImprovementSuggestion,
} from './native-translator';

// Phase 5: 품질 검토 시스템
export {
  QualityChecker,
  checkPersonalExperience,
  checkImages,
  checkTranslationQuality,
  checkSEOQuality,
  checkReadability,
  generateQualityReport,
  type PersonalExperienceResult,
  type ImageCheckResult,
  type TranslationQualityResult,
  type QualityIssue,
  type QualityCheckResult,
} from './quality-checker';
