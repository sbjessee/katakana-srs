"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRSService = void 0;
const database_1 = require("../db/database");
const types_1 = require("../models/types");
class SRSService {
    db = (0, database_1.getDatabase)();
    /**
     * Get all reviews that are due for study
     */
    getDueReviews() {
        const query = `
      SELECT
        r.id, r.katakana_id, r.srs_stage, r.next_review_date,
        r.correct_count, r.incorrect_count, r.last_reviewed, r.created_at,
        k.character, k.romaji, k.type
      FROM reviews r
      JOIN katakana k ON r.katakana_id = k.id
      WHERE datetime(r.next_review_date) <= datetime('now')
      ORDER BY r.next_review_date ASC
    `;
        return this.db.prepare(query).all();
    }
    /**
     * Submit an answer for a review
     * @param reviewId The review ID
     * @param isCorrect Whether the answer was correct
     */
    submitAnswer(reviewId, isCorrect) {
        const review = this.db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
        if (!review) {
            throw new Error(`Review not found: ${reviewId}`);
        }
        let newStage;
        if (isCorrect) {
            // Advance to next stage (max: ENLIGHTENED = 7)
            newStage = Math.min(review.srs_stage + 1, types_1.SRSStage.ENLIGHTENED);
        }
        else {
            // Incorrect answer: drop back to APPRENTICE_1 (0)
            newStage = types_1.SRSStage.APPRENTICE_1;
        }
        // Calculate next review date based on new stage
        const intervalHours = types_1.SRS_INTERVALS[newStage];
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
        this.db.prepare(updateQuery).run(newStage, nextReviewDate.toISOString(), isCorrect ? 1 : 0, isCorrect ? 0 : 1, reviewId);
        // Return updated review
        return this.db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    }
    /**
     * Get all katakana with their review status
     */
    getAllKatakanaWithReviews() {
        const query = `
      SELECT
        r.id, r.katakana_id, r.srs_stage, r.next_review_date,
        r.correct_count, r.incorrect_count, r.last_reviewed, r.created_at,
        k.character, k.romaji, k.type
      FROM reviews r
      JOIN katakana k ON r.katakana_id = k.id
      ORDER BY k.id ASC
    `;
        return this.db.prepare(query).all();
    }
    /**
     * Get dashboard statistics
     */
    getDashboardStats() {
        // Total items
        const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM katakana').get();
        const total_items = totalResult.count;
        // Reviews due now
        const dueNowResult = this.db.prepare(`
      SELECT COUNT(*) as count FROM reviews
      WHERE datetime(next_review_date) <= datetime('now')
    `).get();
        const reviews_due_now = dueNowResult.count;
        // Reviews due today (next 24 hours)
        const dueTodayResult = this.db.prepare(`
      SELECT COUNT(*) as count FROM reviews
      WHERE datetime(next_review_date) <= datetime('now', '+1 day')
    `).get();
        const reviews_due_today = dueTodayResult.count;
        // Accuracy rate
        const accuracyResult = this.db.prepare(`
      SELECT
        SUM(correct_count) as correct,
        SUM(incorrect_count) as incorrect
      FROM reviews
    `).get();
        const totalAnswers = (accuracyResult.correct || 0) + (accuracyResult.incorrect || 0);
        const accuracy_rate = totalAnswers > 0
            ? Math.round(((accuracyResult.correct || 0) / totalAnswers) * 100)
            : 0;
        // Stage distribution
        const stageDistribution = this.db.prepare(`
      SELECT srs_stage, COUNT(*) as count
      FROM reviews
      GROUP BY srs_stage
    `).all();
        const stage_distribution = {};
        stageDistribution.forEach(row => {
            const stageName = this.getStageName(row.srs_stage);
            stage_distribution[stageName] = row.count;
        });
        return {
            total_items,
            reviews_due_now,
            reviews_due_today,
            accuracy_rate,
            stage_distribution
        };
    }
    /**
     * Get upcoming reviews for the next 7 days
     */
    getUpcomingReviews() {
        const query = `
      SELECT
        date(next_review_date) as review_date,
        COUNT(*) as count
      FROM reviews
      WHERE datetime(next_review_date) <= datetime('now', '+7 days')
      GROUP BY date(next_review_date)
      ORDER BY review_date ASC
    `;
        const results = this.db.prepare(query).all();
        return results.map(row => ({ date: row.review_date, count: row.count }));
    }
    /**
     * Helper: Get stage display name
     */
    getStageName(stage) {
        if (stage <= types_1.SRSStage.APPRENTICE_4)
            return 'Apprentice';
        if (stage <= types_1.SRSStage.GURU_2)
            return 'Guru';
        if (stage === types_1.SRSStage.MASTER)
            return 'Master';
        return 'Enlightened';
    }
}
exports.SRSService = SRSService;
