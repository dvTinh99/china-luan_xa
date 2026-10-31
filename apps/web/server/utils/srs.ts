// ============================================================================
// LinguaWorld — Spaced Repetition Scheduling Engine (FSRS-aligned)
// ============================================================================

export type SrsRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type SrsState = 'new' | 'learning' | 'review' | 'mastered';

export interface SrsScheduleInput {
  state: SrsState;
  difficulty: number; // 1.0 - 10.0
  stability: number;  // Days
  totalReviews: number;
  rating: SrsRating;
}

export interface SrsScheduleOutput {
  newState: SrsState;
  newDifficulty: number;
  newStability: number;
  intervalDays: number;
  dueAt: Date;
}

export const SRS_ALGORITHM_VERSION = 'fsrs-v1';

/**
 * Calculates updated SRS scheduling parameters based on user recall rating.
 */
export function calculateSrsNextReview(input: SrsScheduleInput): SrsScheduleOutput {
  const { state, difficulty, stability, totalReviews, rating } = input;

  let newDifficulty = difficulty;
  let newStability = stability;
  let newState: SrsState = state;
  let intervalDays = 1;

  // 1. Update difficulty (D)
  // Rating 1 increases D, Rating 4 decreases D
  const difficultyDelta = (3 - rating) * 0.4;
  newDifficulty = Math.max(1.0, Math.min(10.0, difficulty + difficultyDelta));

  // 2. Update stability (S) & interval
  if (rating === 1) {
    // Again: Lapse/failure
    newState = 'learning';
    newStability = Math.max(0.4, stability * 0.5);
    intervalDays = 1;
  } else if (rating === 2) {
    // Hard: Retained with effort
    newState = state === 'new' ? 'learning' : 'review';
    newStability = Math.max(1.0, stability * 1.25);
    intervalDays = Math.max(1, Math.round(newStability));
  } else if (rating === 3) {
    // Good: Normal successful recall
    newState = totalReviews >= 3 ? 'review' : 'learning';
    const factor = 1.0 + (11.0 - newDifficulty) * 0.22;
    newStability = Math.max(1.2, stability * factor);
    intervalDays = Math.max(1, Math.round(newStability));
  } else if (rating === 4) {
    // Easy: Effortless recall
    newState = totalReviews >= 2 ? 'review' : 'learning';
    const factor = 1.3 + (11.0 - newDifficulty) * 0.35;
    newStability = Math.max(2.0, stability * factor);
    intervalDays = Math.max(2, Math.round(newStability));
  }

  // Mastery threshold: 21+ days interval
  if (intervalDays >= 21) {
    newState = 'mastered';
  }

  const now = Date.now();
  const dueAt = new Date(now + intervalDays * 24 * 60 * 60 * 1000);

  return {
    newState,
    newDifficulty: Math.round(newDifficulty * 100) / 100,
    newStability: Math.round(newStability * 100) / 100,
    intervalDays,
    dueAt,
  };
}

