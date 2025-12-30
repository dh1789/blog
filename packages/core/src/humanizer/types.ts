/**
 * @file Humanizer 모듈 타입 정의
 * @description PRD 0016 - Phase 1: 기반 구조
 *
 * 애드센스 승인을 위한 콘텐츠 휴머나이제이션 시스템의 핵심 타입들
 */

/**
 * 경험 질문 카테고리
 * - motivation: 기술을 배우게 된 계기
 * - challenge: 개발 중 어려웠던 점
 * - application: 실제 적용 사례
 * - insight: 다른 사람에게 전하고 싶은 인사이트
 */
export type ExperienceCategory =
  | 'motivation'
  | 'challenge'
  | 'application'
  | 'insight';

/**
 * 경험 질문 인터페이스
 * 포스트 주제에 맞는 개인 경험 질문을 정의
 */
export interface ExperienceQuestion {
  /** 질문 고유 ID */
  id: string;
  /** 질문 내용 */
  question: string;
  /** 질문 맥락 설명 */
  context: string;
  /** 예시 답변 */
  exampleAnswer: string;
  /** 질문 카테고리 */
  category: ExperienceCategory;
}

/**
 * 경험담 삽입 위치 매핑
 * 카테고리별로 본문의 적절한 위치에 삽입
 */
export const EXPERIENCE_INSERT_POSITIONS: Record<ExperienceCategory, string> = {
  motivation: 'introduction', // 서론/도입부
  challenge: 'technical-section', // 관련 기술 설명 섹션
  application: 'example-section', // 실습/예제 섹션
  insight: 'conclusion', // 결론/마무리
};

/**
 * 터미널 캡처 설정
 * 명령어 실행 결과를 스크린샷으로 캡처
 */
export interface TerminalCapture {
  /** 실행할 명령어 */
  command: string;
  /** 작업 디렉토리 */
  workingDir: string;
  /** 타임아웃 (ms) */
  timeout: number;
  /** 터미널 테마 */
  theme: 'dark' | 'light';
  /** 폰트 크기 (px) */
  fontSize: number;
  /** 최대 출력 라인 수 (선택) */
  maxLines?: number;
}

/**
 * 브라우저 캡처 설정
 * Playwright를 사용하여 웹 페이지 스크린샷 캡처
 */
export interface BrowserCapture {
  /** 캡처할 URL (http://, file://) */
  url: string;
  /** 특정 요소만 캡처할 셀렉터 (선택) */
  selector?: string;
  /** 뷰포트 크기 */
  viewport: {
    width: number;
    height: number;
  };
  /** 대기할 셀렉터 또는 조건 (선택) */
  waitFor?: string;
  /** 전체 페이지 캡처 여부 */
  fullPage: boolean;
  /** 캡처 전 대기 시간 (ms, 선택) */
  delay?: number;
}

/**
 * API 캡처 설정
 * API 응답 결과를 포맷팅하여 스크린샷으로 캡처
 */
export interface APICapture {
  /** HTTP 메서드 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** API URL */
  url: string;
  /** 요청 헤더 (선택) */
  headers?: Record<string, string>;
  /** 요청 바디 (선택) */
  body?: unknown;
  /** 응답 포맷 */
  formatAs: 'json' | 'table' | 'raw';
}

/**
 * 캡처 타입
 */
export type CaptureType = 'terminal' | 'browser' | 'api';

/**
 * 캡처 설정 유니온 타입
 */
export type CaptureConfig = TerminalCapture | BrowserCapture | APICapture;

/**
 * 스크린샷 옵션
 * 모든 캡처 타입에 공통으로 적용되는 옵션
 */
export interface ScreenshotOptions {
  /** 캡처 타입 */
  type: CaptureType;
  /** 타입별 캡처 설정 */
  config: CaptureConfig;
  /** 이미지 저장 경로 */
  outputPath: string;
  /** 최대 너비 (px, 기본: 1200) */
  maxWidth: number;
  /** 이미지 품질 (1-100, 기본: 85) */
  quality: number;
}

/**
 * 스크린샷 결과
 */
export interface ScreenshotResult {
  /** 성공 여부 */
  success: boolean;
  /** 저장된 이미지 경로 */
  imagePath?: string;
  /** 자동 생성된 alt 텍스트 */
  altText?: string;
  /** 에러 메시지 (실패 시) */
  error?: string;
  /** 캡처에 소요된 시간 (ms) */
  duration?: number;
}

/**
 * 번역 품질 검사 결과
 * 네이티브 영문 스타일 검증
 */
export interface TranslationQualityCheck {
  /** 감지된 직역 패턴들 */
  directTranslationPatterns: string[];
  /** 수동태 비율 (0-1, 목표: 0.2 미만) */
  passiveVoiceRatio: number;
  /** 평균 문장 길이 (단어 수, 목표: 15-25) */
  averageSentenceLength: number;
  /** 감지된 한국어 구조 패턴들 */
  koreanStructurePatterns: string[];
}

/**
 * 품질 체크리스트
 * 포스트 발행 전 최종 품질 검증
 */
export interface QualityChecklist {
  // 경험담 관련
  /** 개인 경험담 포함 여부 */
  hasPersonalExperience: boolean;
  /** 경험담이 자연스럽게 통합되었는지 */
  experienceNaturallyIntegrated: boolean;

  // 이미지 관련
  /** 포함된 이미지 수 (목표: 2개 이상) */
  imageCount: number;
  /** 모든 이미지에 alt 텍스트 포함 여부 */
  imagesHaveAltText: boolean;
  /** 이미지가 콘텐츠와 관련있는지 */
  imagesRelevant: boolean;

  // 영문 품질 (영문 포스트인 경우)
  /** 직역 패턴 없음 */
  noDirectTranslation: boolean;
  /** 네이티브 스타일 점수 (0-100, 목표: 80+) */
  nativeStyleScore: number;

  // 전반적 품질
  /** SEO 점수 */
  seoScore: number;
  /** 가독성 점수 */
  readabilityScore: number;
  /** 발행 준비 완료 여부 */
  overallReady: boolean;
}

/**
 * 작성자 프로필 설정
 * 경험담 생성 시 참조
 */
export interface AuthorProfile {
  /** 작성자 배경 정보 */
  background: string[];
  /** 글 어조 */
  tone: string;
  /** 관점/시각 */
  perspective: string;
}

/**
 * 스크린샷 기본 설정
 */
export interface ScreenshotDefaults {
  /** 최대 너비 (px) */
  maxWidth: number;
  /** 이미지 품질 (1-100) */
  quality: number;
  /** 터미널 테마 */
  theme: 'dark' | 'light';
}

/**
 * Humanizer 전체 설정
 * CLI 옵션과 매핑
 */
export interface HumanizerConfig {
  /** 경험 인터뷰 활성화 (--interview) */
  enableInterview: boolean;
  /** 스크린샷 생성 활성화 (--screenshots) */
  enableScreenshots: boolean;
  /** 네이티브 영문 번역 활성화 (--native-english) */
  enableNativeTranslation: boolean;
  /** 검토 건너뛰기 (--skip-review) */
  skipReview: boolean;
  /** 작성자 프로필 */
  authorProfile: AuthorProfile;
  /** 스크린샷 기본 설정 */
  screenshotDefaults: ScreenshotDefaults;
}

/**
 * 휴머나이제이션 결과
 */
export interface HumanizationResult {
  /** 성공 여부 */
  success: boolean;
  /** 처리된 포스트 경로 */
  postPath: string;
  /** 추가된 경험담 수 */
  experiencesAdded: number;
  /** 생성된 스크린샷 수 */
  screenshotsGenerated: number;
  /** 품질 체크리스트 결과 */
  qualityChecklist?: QualityChecklist;
  /** 에러 메시지 (실패 시) */
  error?: string;
}
