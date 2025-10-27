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

// SRS stage intervals in hours
export const SRS_INTERVALS: Record<SRSStage, number> = {
  [SRSStage.APPRENTICE_1]: 4,      // 4 hours
  [SRSStage.APPRENTICE_2]: 8,      // 8 hours
  [SRSStage.APPRENTICE_3]: 24,     // 1 day
  [SRSStage.APPRENTICE_4]: 72,     // 3 days
  [SRSStage.GURU_1]: 168,          // 1 week
  [SRSStage.GURU_2]: 336,          // 2 weeks
  [SRSStage.MASTER]: 720,          // 1 month (30 days)
  [SRSStage.ENLIGHTENED]: 2880,    // 4 months (120 days)
};

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
