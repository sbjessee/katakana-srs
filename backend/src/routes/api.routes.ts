import { Router, Request, Response } from 'express';
import { SRSService } from '../services/srs.service';

const router = Router();
const srsService = new SRSService();

/**
 * GET /api/reviews/due
 * Get all reviews that are currently due
 */
router.get('/reviews/due', (req: Request, res: Response) => {
  try {
    const reviews = srsService.getDueReviews();
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reviews/:id/answer
 * Submit an answer for a review
 * Body: { answer: string, isCorrect: boolean }
 */
router.post('/reviews/:id/answer', (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { isCorrect } = req.body;

    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review ID'
      });
    }

    if (typeof isCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isCorrect must be a boolean'
      });
    }

    const updatedReview = srsService.submitAnswer(reviewId, isCorrect);

    res.json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/katakana
 * Get all katakana with their current review status
 */
router.get('/katakana', (req: Request, res: Response) => {
  try {
    const katakana = srsService.getAllKatakanaWithReviews();
    res.json({
      success: true,
      count: katakana.length,
      data: katakana
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/stats
 * Get dashboard statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = srsService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reviews/upcoming
 * Get upcoming reviews for the next 7 days
 */
router.get('/reviews/upcoming', (req: Request, res: Response) => {
  try {
    const upcoming = srsService.getUpcomingReviews();
    res.json({
      success: true,
      data: upcoming
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
