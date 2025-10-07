// score.routes.js
import express from 'express';
import ScoreController from '../controllers/score.controller.js';

// Create a router instance
const router = express.Router();

/**
 * POST /score
 * Endpoint to run scoring on all uploaded leads.
 * Calls rule-based scoring + AI scoring for each lead.
 * Saves results in data/results.json.
 * Response contains the total count of scored leads.
 */
router.post('/score', ScoreController.runScoring);

/**
 * GET /results
 * Fetch all scored leads as JSON.
 * Reads from data/results.json.
 * Returns an empty array if no results are present.
 */
router.get('/results', ScoreController.getResults);

/**
 * GET /export
 * Export scored results as a CSV file.
 * Automatically triggers file download in the browser.
 * Requires that scoring has been run previously.
 */
router.get('/export', ScoreController.exportCsv);

export default router;
