import computeRuleScore from "../rule.service.js"
describe('Rule Service - computeRuleScore', () => {
  const sampleOffer = {
    name: 'AI Outreach Automation',
    value_props: ['24/7 outreach', '6x more meetings'],
    ideal_use_cases: ['B2B SaaS mid-market']
  };

  it('should assign 20 points for a decision-maker role like CEO or Founder', () => {
    const lead = { name: 'Alice', role: 'CEO', company: 'Acme', industry: 'B2B SaaS mid-market', location: 'NY', linkedin_bio: '...' };
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('should assign 10 points for an influencer role', () => {
    const lead = { name: 'Bob', role: 'Engineering Manager', company: 'Acme', industry: 'B2B SaaS mid-market', location: 'NY', linkedin_bio: '...' };
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThan(50);
  });

  it('should add full 20 points for exact industry match', () => {
    const lead = { name: 'Charlie', role: 'VP Sales', company: 'Acme', industry: 'B2B SaaS mid-market', location: 'NY', linkedin_bio: '...' };
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBeGreaterThanOrEqual(40); // 20 role + 20 industry
  });

  it('should add 10 points for adjacent or partial industry match', () => {
    const lead = { name: 'Dana', role: 'Senior Manager', company: 'Acme', industry: 'SaaS', location: 'NY', linkedin_bio: '...' };
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBeGreaterThanOrEqual(20); // 10 role + 10 industry
  });

  it('should lower score when data is incomplete', () => {
    const lead = { name: 'Eve', role: '', company: 'Acme', industry: '', location: '', linkedin_bio: '' };
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBeLessThanOrEqual(30);
  });

  it('should return 0 for empty lead input', () => {
    const lead = {};
    const score = computeRuleScore(lead, sampleOffer);
    expect(score).toBe(0);
  });
});
