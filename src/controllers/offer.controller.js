import fs from 'fs/promises';
import path from 'path';

const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');

function validateOfferPayload(body) {
  if (!body || typeof body !== 'object') throw { status: 400, message: 'Offer payload required' };
  const { name, value_props, ideal_use_cases } = body;
  if (!name || !Array.isArray(value_props) || !Array.isArray(ideal_use_cases)) {
    throw { status: 400, message: 'Fields required: name (string), value_props (array), ideal_use_cases (array)' };
  }
}

const createOffer = async (req, res, next) => {
  try {
    validateOfferPayload(req.body);
    const offer = { ...req.body, created_at: new Date().toISOString() };
    await fs.writeFile(OFFERS_FILE, JSON.stringify(offer, null, 2), 'utf-8');
    res.status(201).json({ ok: true, offer });
  } catch (err) {
    next(err);
  }
};

const getOffer = async (req, res, next) => {
  try {
    const content = await fs.readFile(OFFERS_FILE, 'utf-8').catch(() => null);
    if (!content) return res.status(404).json({ ok: false, message: 'No offer found. POST /offer first.' });
    const offer = JSON.parse(content);
    res.json({ ok: true, offer });
  } catch (err) {
    next(err);
  }
};

export default { createOffer, getOffer };
