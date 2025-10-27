import { Router, Request, Response } from 'express';
import { LessonService } from '../services/lesson.service';

const router = Router();
const lessonService = new LessonService();

/**
 * GET /api/lessons
 * Get all lesson batches with completion status
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const batches = lessonService.getAllLessonBatches();
    res.json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/lessons/next
 * Get the next available (incomplete) lesson
 */
router.get('/next', (req: Request, res: Response) => {
  try {
    const lesson = lessonService.getNextLesson();
    if (!lesson) {
      return res.json({
        success: true,
        data: null,
        message: 'All lessons completed!'
      });
    }
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/lessons/:batchNumber/items
 * Get lesson items (katakana) for a specific batch
 */
router.get('/:batchNumber/items', (req: Request, res: Response) => {
  try {
    const batchNumber = parseInt(req.params.batchNumber);

    if (isNaN(batchNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch number'
      });
    }

    const items = lessonService.getLessonItems(batchNumber);
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/lessons/:batchNumber/complete
 * Mark a lesson batch as completed
 * Body: { quizResults?: Array<{ katakanaId: number, correct: boolean }> }
 */
router.post('/:batchNumber/complete', (req: Request, res: Response) => {
  try {
    const batchNumber = parseInt(req.params.batchNumber);

    if (isNaN(batchNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch number'
      });
    }

    const { quizResults } = req.body;
    lessonService.completeLesson(batchNumber, quizResults);
    res.json({
      success: true,
      message: 'Lesson completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/lessons/notes
 * Save or update a user note for a katakana
 * Body: { katakanaId: number, note: string }
 */
router.post('/notes', (req: Request, res: Response) => {
  try {
    const { katakanaId, note } = req.body;

    if (!katakanaId || typeof note !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'katakanaId and note are required'
      });
    }

    const savedNote = lessonService.saveUserNote(katakanaId, note);
    res.json({
      success: true,
      data: savedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/lessons/notes/:katakanaId
 * Delete a user note
 */
router.delete('/notes/:katakanaId', (req: Request, res: Response) => {
  try {
    const katakanaId = parseInt(req.params.katakanaId);

    if (isNaN(katakanaId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid katakana ID'
      });
    }

    lessonService.deleteUserNote(katakanaId);
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
