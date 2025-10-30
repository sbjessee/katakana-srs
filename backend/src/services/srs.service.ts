import { getDatabase } from '../db/database';
import { Review, ReviewWithKatakana, DashboardStats, SRSStage, SRS_INTERVALS, SRS_STAGE_NAMES } from '../models/types';
import { LessonService } from './lesson.service';

export class SRSService {
  private db = getDatabase();
  private lessonService = new LessonService();

  /**
   * Get all reviews that are due for study
   */
  getDueReviews(): ReviewWithKatakana[] {
    const query = `
      SELECT
        r.id, r.katakana_id, r.srs_stage, r.next_review_date,
        r.correct_count, r.incorrect_count, r.last_reviewed, r.created_at,
        k.character, k.romaji, k.type,
        un.note as user_note
      FROM reviews r
      JOIN katakana k ON r.katakana_id = k.id
      LEFT JOIN user_notes un ON k.id = un.katakana_id
      WHERE datetime(r.next_review_date) <= datetime('now')
      ORDER BY r.next_review_date ASC
    `;

    return this.db.prepare(query).all() as ReviewWithKatakana[];
  }

  /**
   * Submit an answer for a review
   * @param reviewId The review ID
   * @param isCorrect Whether the answer was correct
   */
  submitAnswer(reviewId: number, isCorrect: boolean): Review {
    const review = this.db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId) as Review;

    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    let newStage: SRSStage;

    if (isCorrect) {
      // Advance to next stage (max: ENLIGHTENED = 7)
      newStage = Math.min(review.srs_stage + 1, SRSStage.ENLIGHTENED) as SRSStage;
    } else {
      // Incorrect answer: drop back to APPRENTICE_1 (0)
      newStage = SRSStage.APPRENTICE_1;
    }

    // Calculate next review date based on new stage
    const intervalHours = SRS_INTERVALS[newStage];
    const nextReviewDate = new Date();
    nextReviewDate.setHours(nextReviewDate.getHours() + intervalHours);

    // Update the review
    const updateQuery = `
      UPDATE reviews
      SET
        srs_stage = ?,
        next_review_date = ?,
        correct_count = correct_count + ?,
        incorrect_count = incorrect_count + ?,
        last_reviewed = datetime('now')
      WHERE id = ?
    `;

    this.db.prepare(updateQuery).run(
      newStage,
      nextReviewDate.toISOString(),
      isCorrect ? 1 : 0,
      isCorrect ? 0 : 1,
      reviewId
    );

    // Return updated review
    return this.db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId) as Review;
  }

  /**
   * Get all katakana with their review status
   */
  getAllKatakanaWithReviews(): ReviewWithKatakana[] {
    const query = `
      SELECT
        r.id, r.katakana_id, r.srs_stage, r.next_review_date,
        r.correct_count, r.incorrect_count, r.last_reviewed, r.created_at,
        k.id as katakana_id, k.character, k.romaji, k.type
      FROM katakana k
      LEFT JOIN reviews r ON r.katakana_id = k.id
      ORDER BY k.id ASC
    `;

    return this.db.prepare(query).all() as ReviewWithKatakana[];
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): DashboardStats {
    // Total items
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM katakana').get() as { count: number };
    const total_items = totalResult.count;

    // Reviews due now
    const dueNowResult = this.db.prepare(`
      SELECT COUNT(*) as count FROM reviews
      WHERE datetime(next_review_date) <= datetime('now')
    `).get() as { count: number };
    const reviews_due_now = dueNowResult.count;

    // Reviews due today (next 24 hours)
    const dueTodayResult = this.db.prepare(`
      SELECT COUNT(*) as count FROM reviews
      WHERE datetime(next_review_date) <= datetime('now', '+1 day')
    `).get() as { count: number };
    const reviews_due_today = dueTodayResult.count;

    // Accuracy rate
    const accuracyResult = this.db.prepare(`
      SELECT
        SUM(correct_count) as correct,
        SUM(incorrect_count) as incorrect
      FROM reviews
    `).get() as { correct: number | null, incorrect: number | null };

    const totalAnswers = (accuracyResult.correct || 0) + (accuracyResult.incorrect || 0);
    const accuracy_rate = totalAnswers > 0
      ? Math.round(((accuracyResult.correct || 0) / totalAnswers) * 100)
      : 0;

    // Stage distribution - initialize all 8 stages with 0
    const stage_distribution: Record<string, number> = {};
    Object.entries(SRS_STAGE_NAMES).forEach(([stage, name]) => {
      stage_distribution[name] = 0;
    });

    // Fill in actual counts
    const stageDistribution = this.db.prepare(`
      SELECT srs_stage, COUNT(*) as count
      FROM reviews
      GROUP BY srs_stage
    `).all() as Array<{ srs_stage: number, count: number }>;

    stageDistribution.forEach(row => {
      const stageName = SRS_STAGE_NAMES[row.srs_stage as SRSStage];
      stage_distribution[stageName] = row.count;
    });

    // Get available lessons count
    const lessons_available = this.lessonService.getAvailableLessonsCount();

    return {
      total_items,
      reviews_due_now,
      reviews_due_today,
      accuracy_rate,
      stage_distribution,
      lessons_available
    };
  }

  /**
   * Get upcoming reviews for the next 7 days
   */
  getUpcomingReviews(): Array<{ date: string, count: number, new_count: number }> {
    // Get all review dates within the next 7 days
    const query = `
      SELECT
        date(next_review_date) as review_date,
        COUNT(*) as count
      FROM reviews
      WHERE datetime(next_review_date) <= datetime('now', '+7 days')
      GROUP BY date(next_review_date)
      ORDER BY review_date ASC
    `;

    const results = this.db.prepare(query).all() as Array<{ review_date: string, count: number }>;
    
    // Calculate cumulative counts to derive "new" items for each day
    let cumulative = 0;
    return results.map(row => {
      const dayCount = row.count;
      const newCount = dayCount; // Items due on this specific day
      cumulative += dayCount;
      
      return { 
        date: row.review_date, 
        count: cumulative,  // Total items due by end of this day
        new_count: newCount // New items becoming due on this day
      };
    });
  }

  /**
   * Get hourly breakdown of reviews for a specific date
   */
  getHourlyReviewsForDate(date: string): Array<{ hour: number, count: number, new_count: number }> {
    const query = `
      SELECT
        CAST(strftime('%H', next_review_date) AS INTEGER) as hour,
        COUNT(*) as count
      FROM reviews
      WHERE date(next_review_date) = ?
      GROUP BY hour
      ORDER BY hour ASC
    `;

    const results = this.db.prepare(query).all(date) as Array<{ hour: number, count: number }>;
    
    // Calculate cumulative counts to derive "new" items for each hour
    let cumulative = 0;
    return results.map(row => {
      const hourCount = row.count;
      const newCount = hourCount; // Items due in this specific hour
      cumulative += hourCount;
      
      return {
        hour: row.hour,
        count: cumulative,  // Total items due by end of this hour
        new_count: newCount // New items becoming due in this hour
      };
    });
  }

}
