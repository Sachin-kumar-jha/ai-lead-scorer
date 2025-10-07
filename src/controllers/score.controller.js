import fs from 'fs/promises';
import path from 'path';
import ruleService from '../services/rule.service.js';
import aiService from '../services/ai.service.js';
import { Parser } from 'json2csv';

const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');
const RESULTS_FILE = path.join(process.cwd(), 'data', 'results.json');

function mapAiPoints(intent) {
  if (intent === 'High') return 50;
  if (intent === 'Medium') return 30;
  return 10;
}

const runScoring = async (req, res, next) => {
  try {
    const offerRaw = await fs.readFile(OFFERS_FILE, 'utf-8').catch(() => null);
    if (!offerRaw) throw { status: 400, message: 'No offer found. POST /offer first.' };
    const offer = JSON.parse(offerRaw);

    const leadsRaw = await fs.readFile(LEADS_FILE, 'utf-8').catch(() => null);
    if (!leadsRaw) throw { status: 400, message: 'No leads found. POST /leads/upload first.' };
    const leads = JSON.parse(leadsRaw);

    if (!Array.isArray(leads) || leads.length === 0) throw { status: 400, message: 'Leads file is empty' };

    const results = [];

    for (const lead of leads) {
      // Rule layer
      const ruleScore = ruleService(lead, offer);

      // AI layer
      let aiResponse;
      try {
        aiResponse = await aiService(lead, offer);
      } catch (err) {
        aiResponse = { intent: 'Low', reasoning: 'AI service unavailable — defaulted to Low' };
        console.error('AI error for lead', lead.name, err.message || err);
      }

      const aiPoints = mapAiPoints(aiResponse.intent);
      const total = Math.max(0, Math.min(100, ruleScore + aiPoints));

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
        reasoning: (aiResponse.reasoning || '').replace(/\n/g, ' ').trim()
      });
    }

    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
    res.status(200).json({ ok: true, count: results.length, results_file: 'data/results.json' });
  } catch (err) {
    next(err);
  }
};

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


const exportCsv = async (req, res, next) => {
  try {
    const raw = await fs.readFile(RESULTS_FILE, 'utf-8').catch(() => null);
    if (!raw) throw { status: 400, message: 'No results to export. Run POST /score first.' };
    const results = JSON.parse(raw);
    const fields = ['name','role','company','industry','location','intent','score','rule_score','ai_points','reasoning'];
    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

export default { runScoring, getResults, exportCsv };
