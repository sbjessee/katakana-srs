// SRS Stages (0-7)
export enum SRSStage {
  APPRENTICE_1 = 0,
  APPRENTICE_2 = 1,
  APPRENTICE_3 = 2,
  APPRENTICE_4 = 3,
  GURU_1 = 4,
  GURU_2 = 5,
  MASTER = 6,
  ENLIGHTENED = 7,
}

// SRS stage names for display
export const SRS_STAGE_NAMES: Record<SRSStage, string> = {
  [SRSStage.APPRENTICE_1]: 'Apprentice I',
  [SRSStage.APPRENTICE_2]: 'Apprentice II',
  [SRSStage.APPRENTICE_3]: 'Apprentice III',
  [SRSStage.APPRENTICE_4]: 'Apprentice IV',
  [SRSStage.GURU_1]: 'Guru I',
  [SRSStage.GURU_2]: 'Guru II',
  [SRSStage.MASTER]: 'Master',
  [SRSStage.ENLIGHTENED]: 'Enlightened',
};

// SRS stage group names
export const getSRSGroupName = (stage: SRSStage): string => {
  if (stage <= SRSStage.APPRENTICE_4) return 'Apprentice';
  if (stage <= SRSStage.GURU_2) return 'Guru';
  if (stage === SRSStage.MASTER) return 'Master';
  return 'Enlightened';
};

// SRS stage colors for UI (WaniKani-inspired)
export const SRS_STAGE_COLORS: Record<string, string> = {
  'Apprentice': '#dd0093',  // Pink
  'Guru': '#882d9e',        // Purple
  'Master': '#294ddb',      // Blue
  'Enlightened': '#0093dd', // Light blue
};

export interface Katakana {
  id: number;
  character: string;
  romaji: string;
  type: 'basic' | 'dakuten' | 'combo';
  created_at: string;
}

export interface Review {
  id: number;
  katakana_id: number;
  srs_stage: SRSStage;
  next_review_date: string;
  correct_count: number;
  incorrect_count: number;
  last_reviewed: string | null;
  created_at: string;
}

export interface ReviewWithKatakana extends Review {
  character: string;
  romaji: string;
  type: string;
}

export interface DashboardStats {
  total_items: number;
  reviews_due_now: number;
  reviews_due_today: number;
  accuracy_rate: number;
  stage_distribution: Record<string, number>;
  lessons_available: number;
}

export interface UpcomingReview {
  date: string;
  count: number;
}

export interface HourlyReview {
  hour: number;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

export interface LessonBatch {
  batch_number: number;
  name: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
}

export interface LessonItem {
  id: number;
  character: string;
  romaji: string;
  type: string;
  user_note: string | null;
}

export interface UserNote {
  id: number;
  katakana_id: number;
  note: string;
  created_at: string;
  updated_at: string;
}
