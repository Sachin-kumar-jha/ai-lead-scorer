// offer.controller.js
import fs from 'fs/promises';
import path from 'path';

// Path to store the offer JSON
const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');

/**
 * Validates the incoming offer payload.
 * Ensures name is a string, value_props and ideal_use_cases are arrays.
 * @param {Object} body - Request body
 * @throws {Object} - Throws error object with status and message if invalid
 */
function validateOfferPayload(body) {
  if (!body || typeof body !== 'object') {
    throw { status: 400, message: 'Offer payload required' };
  }

  const { name, value_props, ideal_use_cases } = body;

  if (!name || !Array.isArray(value_props) || !Array.isArray(ideal_use_cases)) {
    throw {
      status: 400,
      message: 'Fields required: name (string), value_props (array), ideal_use_cases (array)',
    };
  }
}

/**
 * Controller to create a new offer.
 * Writes the offer to a JSON file with a timestamp.
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const createOffer = async (req, res, next) => {
  try {
    // Validate the incoming request body
    validateOfferPayload(req.body);

    // Prepare the offer object with creation timestamp
    const offer = {
      ...req.body,
      created_at: new Date().toISOString(),
    };

    // Save the offer to the JSON file
    await fs.writeFile(OFFERS_FILE, JSON.stringify(offer, null, 2), 'utf-8');

    // Respond with success and the saved offer
    res.status(201).json({ ok: true, offer });
  } catch (err) {
    // Pass any error to centralized error handler
    next(err);
  }
};

/**
 * Controller to get the latest offer.
 * Reads the offer JSON file and returns its content.
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const getOffer = async (req, res, next) => {
  try {
    // Read the offer file; if not exists, return null
    const content = await fs.readFile(OFFERS_FILE, 'utf-8').catch(() => null);

    if (!content) {
      return res.status(404).json({
        ok: false,
        message: 'No offer found. POST /offer first.',
      });
    }

    // Parse and return the offer
    const offer = JSON.parse(content);
    res.json({ ok: true, offer });
  } catch (err) {
    next(err);
  }
};

// Export controllers as default object
export default { createOffer, getOffer };
