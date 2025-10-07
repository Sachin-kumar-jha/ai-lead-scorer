// score.controller.js
import fs from 'fs/promises';
import path from 'path';
import ruleService from '../services/rule.service.js';
import aiService from '../services/ai.service.js';
import { Parser } from 'json2csv';

// Paths for storing offers, leads, and scoring results
const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');
const RESULTS_FILE = path.join(process.cwd(), 'data', 'results.json');

/**
 * Maps AI intent to numeric points.
 * High → 50, Medium → 30, Low/Other → 10
 * @param {string} intent - AI's intent label
 * @returns {number} points
 */
function mapAiPoints(intent) {
  if (intent === 'High') return 50;
  if (intent === 'Medium') return 30;
  return 10;
}

/**
 * Controller to run rule-based + AI scoring for all leads.
 * Writes scored results to results.json
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const runScoring = async (req, res, next) => {
  try {
    // Load the current offer
    const offerRaw = await fs.readFile(OFFERS_FILE, 'utf-8').catch(() => null);
    if (!offerRaw) throw { status: 400, message: 'No offer found. POST /offer first.' };
    const offer = JSON.parse(offerRaw);

    // Load leads
    const leadsRaw = await fs.readFile(LEADS_FILE, 'utf-8').catch(() => null);
    if (!leadsRaw) throw { status: 400, message: 'No leads found. POST /leads/upload first.' };
    const leads = JSON.parse(leadsRaw);

    if (!Array.isArray(leads) || leads.length === 0) throw { status: 400, message: 'Leads file is empty' };

    const results = [];

    for (const lead of leads) {
      //Rule-based scoring
      const ruleScore = ruleService(lead, offer);

      //AI-based scoring
      let aiResponse;
      try {
        aiResponse = await aiService(lead, offer);
      } catch (err) {
        // Default to Low if AI fails
        aiResponse = { intent: 'Low', reasoning: 'AI service unavailable — defaulted to Low' };
        console.error('AI error for lead', lead.name, err.message || err);
      }

      const aiPoints = mapAiPoints(aiResponse.intent);

      // Total score = rule + AI, clamped between 0-100
      const total = Math.max(0, Math.min(100, ruleScore + aiPoints));

      // Collect the result for this lead
      results.push({
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location,
        intent: aiResponse.intent,
        score: total,
        rule_score: ruleScore,
        ai_points: aiPoints,
        reasoning: (aiResponse.reasoning || '').replace(/\n/g, ' ').trim(),
      });
    }

    // Write results to JSON
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');

    // Respond with summary
    res.status(200).json({ ok: true, count: results.length, results_file: 'data/results.json' });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to fetch scored results.
 * Reads from results.json and returns array.
 */
const getResults = async (req, res, next) => {
  try {
    const raw = await fs.readFile(RESULTS_FILE, 'utf-8').catch(() => null);
    if (!raw) return res.json([]);
    const results = JSON.parse(raw);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to export scored results as CSV.
 * Sets headers for file download.
 */
const exportCsv = async (req, res, next) => {
  try {
    const raw = await fs.readFile(RESULTS_FILE, 'utf-8').catch(() => null);
    if (!raw) throw { status: 400, message: 'No results to export. Run POST /score first.' };

    const results = JSON.parse(raw);

    // Define CSV columns
    const fields = ['name', 'role', 'company', 'industry', 'location', 'intent', 'score', 'rule_score', 'ai_points', 'reasoning'];
    const parser = new Parser({ fields });

    // Convert JSON results to CSV
    const csv = parser.parse(results);

    // Set headers for download
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.setHeader('Content-Type', 'text/csv');

    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Export all controllers
export default { runScoring, getResults, exportCsv };
