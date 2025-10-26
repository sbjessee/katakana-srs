"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const srs_service_1 = require("../services/srs.service");
const router = (0, express_1.Router)();
const srsService = new srs_service_1.SRSService();
/**
 * GET /api/reviews/due
 * Get all reviews that are currently due
 */
router.get('/reviews/due', (req, res) => {
    try {
        const reviews = srsService.getDueReviews();
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    }
    catch (error) {
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
router.post('/reviews/:id/answer', (req, res) => {
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
    }
    catch (error) {
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
router.get('/katakana', (req, res) => {
    try {
        const katakana = srsService.getAllKatakanaWithReviews();
        res.json({
            success: true,
            count: katakana.length,
            data: katakana
        });
    }
    catch (error) {
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
router.get('/stats', (req, res) => {
    try {
        const stats = srsService.getDashboardStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
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
router.get('/reviews/upcoming', (req, res) => {
    try {
        const upcoming = srsService.getUpcomingReviews();
        res.json({
            success: true,
            data: upcoming
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
