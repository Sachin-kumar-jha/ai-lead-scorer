/**
 * Rule-based scoring system for leads (max 50 points)
 *
 * Scoring rules:
 * 1. Role relevance:
 *    - Decision maker: +20
 *    - Influencer: +10
 * 2. Industry match:
 *    - Exact ICP match: +20
 *    - Adjacent/related keywords: +10
 * 3. Data completeness:
 *    - All required fields present: +10
 */

/**
 * Check if a role is a decision maker.
 * @param {string} role - Lead's job role
 * @returns {boolean}
 */
const isDecisionMaker = (role) => {
  if (!role) return false;
  const r = role.toLowerCase();
  const decisionKeywords = [
    'head', 'vp', 'vice', 'chief', 'ceo', 'cto',
    'founder', 'co-founder', 'owner', 'director', 'president'
  ];
  return decisionKeywords.some(k => r.includes(k));
};

/**
 * Check if a role is an influencer (but not decision maker)
 * @param {string} role - Lead's job role
 * @returns {boolean}
 */
const isInfluencer = (role) => {
  if (!role) return false;
  const r = role.toLowerCase();
  const influencerKeywords = ['manager', 'lead', 'principal', 'senior'];
  return influencerKeywords.some(k => r.includes(k));
};

/**
 * Score based on how well the lead's industry matches the offer's ideal use cases
 * @param {string} leadIndustry
 * @param {Object} offer - Offer object containing ideal_use_cases array
 * @returns {number} Points for industry match (0, 10, 20)
 */
const industryMatch = (leadIndustry = '', offer) => {
  if (!leadIndustry || !offer || !Array.isArray(offer.ideal_use_cases)) return 0;

  const li = leadIndustry.toLowerCase();

  // Exact match with any ideal use case
  for (const ic of offer.ideal_use_cases) {
    const icLower = String(ic).toLowerCase();
    if (li === icLower || li.includes(icLower) || icLower.includes(li)) return 20;
  }

  // Adjacent/related: word overlap with ideal use cases
  for (const ic of offer.ideal_use_cases) {
    const icLower = String(ic).toLowerCase();
    const words = icLower.split(/[\s,\/-]+/).filter(Boolean);
    for (const w of words) {
      if (w && li.includes(w)) return 10;
    }
  }

  return 0;
};

/**
 * Score based on lead data completeness
 * @param {Object} lead
 * @returns {number} Points for completeness (0 or 10)
 */
const completeness = (lead) => {
  if (!lead) return 0;
  const required = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
  const ok = required.every(k => lead[k] && String(lead[k]).trim().length > 0);
  return ok ? 10 : 0;
};

/**
 * Compute total rule-based score for a lead
 * @param {Object} lead
 * @param {Object} offer
 * @returns {number} Total score (0-50)
 */
const computeRuleScore = (lead, offer) => {
  let score = 0;

  try {
    // Role-based points
    if (isDecisionMaker(lead.role)) score += 20;
    else if (isInfluencer(lead.role)) score += 10;

    // Industry match points
    score += industryMatch(lead.industry, offer);

    // Data completeness points
    score += completeness(lead);

    // Ensure score is within 0-50
    return Math.max(0, Math.min(50, score));
  } catch (err) {
    console.error('Rule scoring error:', err);
    return 0;
  }
};

export default computeRuleScore;
