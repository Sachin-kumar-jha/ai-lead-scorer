// ai.service.js
import { GoogleGenAI } from "@google/genai";

// Initialize Google Gemini AI client with API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * getAIIntent
 * Uses Google Gemini AI to classify a lead's intent based on an offer.
 *
 * @param {Object} lead - Lead object containing name, role, company, industry, location, linkedin_bio
 * @param {Object} offer - Offer object containing name, value_props, ideal_use_cases
 * @returns {Promise<Object>} - JSON with:
 *   - intent: "High" | "Medium" | "Low"
 *   - reasoning: explanation of classification
 *
 * How it works:
 * 1. Builds a prompt combining lead and offer details.
 * 2. Sends prompt to Gemini AI using the "gemini-2.5-flash" model.
 * 3. Expects AI to return JSON in format: {"intent":"", "reasoning":""}
 * 4. If AI fails or returns invalid output, defaults to Low intent.
 */
export default async function getAIIntent(lead, offer) {
  const prompt = `
Offer:
name: ${offer.name}
value_props: ${offer.value_props.join('; ')}
ideal_use_cases: ${offer.ideal_use_cases.join('; ')}

Lead:
name: ${lead.name}
role: ${lead.role}
company: ${lead.company}
industry: ${lead.industry}
location: ${lead.location}
linkedin_bio: ${lead.linkedin_bio}

Classify intent as High / Medium / Low and explain in 1-2 sentences. Return JSON: {"intent":"", "reasoning":""}
  `.trim();

  try {
    // Call Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }, // disables extra "thinking"
    });

    const text = response?.text || "";

    // Extract JSON from AI output
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);

    // If JSON not found, return default Low intent
    return { intent: "Low", reasoning: text };
  } catch (err) {
    console.error("Gemini API error:", err.message || err);
    return { intent: "Low", reasoning: "Gemini API unavailable" };
  }
}
