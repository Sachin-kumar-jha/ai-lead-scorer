// offer.routes.js
import express from 'express';
import OfferController from '../controllers/offer.controller.js';

// Create a router instance
const router = express.Router();

/**
 * POST /
 * Create a new offer
 * - Expects JSON body with:
 *   - name (string): Offer name
 *   - value_props (array of strings): Key value propositions
 *   - ideal_use_cases (array of strings): Target industries/use-cases
 * - Returns JSON:
 *   - ok: true
 *   - offer: the saved offer object with timestamp
 */
router.post('/', OfferController.createOffer);

/**
 * GET /
 * Retrieve the currently saved offer
 * - Returns JSON:
 *   - ok: true
 *   - offer: saved offer object
 * - If no offer exists, responds with 404 and message to POST first
 */
router.get('/', OfferController.getOffer);

export default router;
