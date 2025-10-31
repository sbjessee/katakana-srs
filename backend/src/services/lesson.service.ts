import { getDatabase } from '../db/database';
import { LessonBatch, LessonItem, UserNote } from '../models/types';

export class LessonService {
  private db = getDatabase();

  /**
   * Get all lesson batches with completion status
   */
  getAllLessonBatches(): LessonBatch[] {
    const query = `
      SELECT batch_number, name, description, completed, completed_at
      FROM lesson_batches
      ORDER BY batch_number ASC
    `;

    return this.db.prepare(query).all() as LessonBatch[];
  }

  /**
   * Get the next available (incomplete) lesson batch
   */
  getNextLesson(): LessonBatch | null {
    const query = `
      SELECT batch_number, name, description, completed, completed_at
      FROM lesson_batches
      WHERE completed = 0
      ORDER BY batch_number ASC
      LIMIT 1
    `;

    const result = this.db.prepare(query).get() as LessonBatch | undefined;
    return result || null;
  }

  /**
   * Get lesson items (katakana) for a specific batch
   */
  getLessonItems(batchNumber: number): LessonItem[] {
    const query = `
      SELECT
        k.id,
        k.character,
        k.romaji,
        k.type,
        un.note as user_note
      FROM katakana k
      LEFT JOIN user_notes un ON k.id = un.katakana_id
      WHERE k.lesson_batch_number = ?
      ORDER BY k.id ASC
    `;

    return this.db.prepare(query).all(batchNumber) as LessonItem[];
  }

  /**
   * Complete a lesson batch
   * - Marks the batch as completed
   * - Creates reviews for all katakana in the batch (if not already created)
   * - All items start at Apprentice I (stage 0) regardless of quiz performance (WaniKani behavior)
   */
  completeLesson(batchNumber: number, quizResults?: Array<{ katakanaId: number, correct: boolean }>): void {
    const updateBatch = this.db.prepare(`
      UPDATE lesson_batches
      SET completed = 1, completed_at = datetime('now')
      WHERE batch_number = ?
    `);

    // Get all katakana in this batch
    const getKatakana = this.db.prepare(`
      SELECT id FROM katakana WHERE lesson_batch_number = ?
    `);

    // Create a map of quiz results for tracking stats only
    const quizResultsMap = new Map<number, boolean>();
    if (quizResults) {
      for (const result of quizResults) {
        quizResultsMap.set(result.katakanaId, result.correct);
      }
    }

    // Insert reviews for katakana that don't have reviews yet
    // All items start at stage 0 (APPRENTICE_1) with 2 hour interval (accelerated timing)
    const insertReview = this.db.prepare(`
      INSERT OR IGNORE INTO reviews (
        katakana_id,
        srs_stage,
        next_review_date,
        correct_count,
        incorrect_count
      )
      VALUES (?, 0, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      // Mark batch as completed
      updateBatch.run(batchNumber);

      // Create reviews for all katakana in this batch
      const katakanaIds = getKatakana.all(batchNumber) as Array<{ id: number }>;
      for (const { id } of katakanaIds) {
        // Calculate next review date: 2 hours from now, rounded down to the hour
        const nextReview = new Date();
        nextReview.setHours(nextReview.getHours() + 2);
        nextReview.setMinutes(0, 0, 0);

        // Track quiz performance for stats
        const correctOnFirstTry = quizResultsMap.get(id) ?? false;
        const correctCount = correctOnFirstTry ? 1 : 0;
        const incorrectCount = correctOnFirstTry ? 0 : 1;

        insertReview.run(id, nextReview.toISOString(), correctCount, incorrectCount);
      }
    });

    transaction();
  }

  /**
   * Save or update a user note for a katakana
   */
  saveUserNote(katakanaId: number, note: string): UserNote {
    const upsert = this.db.prepare(`
      INSERT INTO user_notes (katakana_id, note, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(katakana_id)
      DO UPDATE SET note = ?, updated_at = datetime('now')
    `);

    upsert.run(katakanaId, note, note);

    // Return the saved note
    const result = this.db.prepare(`
      SELECT id, katakana_id, note, created_at, updated_at
      FROM user_notes
      WHERE katakana_id = ?
    `).get(katakanaId) as UserNote;

    return result;
  }

  /**
   * Delete a user note
   */
  deleteUserNote(katakanaId: number): void {
    this.db.prepare('DELETE FROM user_notes WHERE katakana_id = ?').run(katakanaId);
  }

  /**
   * Get number of available (incomplete) lessons
   */
  getAvailableLessonsCount(): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM lesson_batches
      WHERE completed = 0
    `).get() as { count: number };

    return result.count;
  }
}
