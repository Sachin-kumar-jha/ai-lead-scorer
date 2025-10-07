/**
 * Rule-based scoring (max 50 points)
 * - Role relevance: decision maker (+20), influencer (+10)
 * - Industry match: exact ICP (+20), adjacent (+10)
 * - Data completeness: all fields present (+10)
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

const isInfluencer = (role) => {
  if (!role) return false;
  const r = role.toLowerCase();
  const influencerKeywords = ['manager', 'lead', 'principal', 'senior'];
  return influencerKeywords.some(k => r.includes(k));
};

const industryMatch = (leadIndustry = '', offer) => {
  if (!leadIndustry || !offer || !Array.isArray(offer.ideal_use_cases)) return 0;

  const li = leadIndustry.toLowerCase();

  // Exact match against any ICP phrase
  for (const ic of offer.ideal_use_cases) {
    const icLower = String(ic).toLowerCase();
    if (li === icLower || li.includes(icLower) || icLower.includes(li)) return 20;
  }

  // Adjacent: check value_props or use_case words overlap
  for (const ic of offer.ideal_use_cases) {
    const icLower = String(ic).toLowerCase();
    const words = icLower.split(/[\s,\/-]+/).filter(Boolean);
    for (const w of words) {
      if (w && li.includes(w)) return 10;
    }
  }

  return 0;
};

const completeness = (lead) => {
  if (!lead) return 0;
  const required = ['name','role','company','industry','location','linkedin_bio'];
  const ok = required.every(k => lead[k] && String(lead[k]).trim().length > 0);
  return ok ? 10 : 0;
};

const computeRuleScore = (lead, offer) => {
  let score = 0;
  try {
    if (isDecisionMaker(lead.role)) score += 20;
    else if (isInfluencer(lead.role)) score += 10;

    score += industryMatch(lead.industry, offer);
    score += completeness(lead);

    // Clamp to 50
    return Math.max(0, Math.min(50, score));
  } catch (err) {
    console.error('Rule scoring error:', err);
    return 0;
  }
};

export default computeRuleScore;