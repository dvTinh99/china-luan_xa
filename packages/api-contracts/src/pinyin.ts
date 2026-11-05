export type PinyinStageId = 'initials' | 'finals' | 'tones';
export type OriginLanguage = 'vi' | 'en';

export interface PinyinLocalizedText {
  vi: string;
  en: string;
}

export interface PinyinExample {
  hanzi: string;
  pinyin: string;
  meaning: PinyinLocalizedText;
}

export interface PinyinSoundRow {
  label: string;
  description: PinyinLocalizedText;
  examples: PinyinExample[];
}

export interface PinyinSection {
  title: PinyinLocalizedText;
  description: PinyinLocalizedText;
  rows: PinyinSoundRow[];
}

export interface PinyinChoice {
  id: string;
  label: PinyinLocalizedText;
}

export interface PinyinQuizQuestion {
  id: string;
  prompt: PinyinLocalizedText;
  choices: PinyinChoice[];
}

export interface PinyinStageContent {
  id: PinyinStageId;
  title: PinyinLocalizedText;
  subtitle: PinyinLocalizedText;
  sections: PinyinSection[];
  questions: PinyinQuizQuestion[];
}

export interface PinyinCurriculumResponse {
  passScore: number;
  stages: PinyinStageContent[];
}

export interface PinyinStageProgress {
  stageId: PinyinStageId;
  completed: boolean;
  bestScore: number | null;
  completedAt: string | null;
}

export interface PinyinAttemptAnswer {
  questionId: string;
  optionId: string;
}

export interface PinyinAttemptRequest {
  answers: PinyinAttemptAnswer[];
}

export interface PinyinProgressResponse {
  progress: PinyinStageProgress[];
}

export interface PinyinAttemptResult {
  stageId: PinyinStageId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  progress: PinyinStageProgress | null;
  feedback: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: PinyinLocalizedText;
  }>;
}
