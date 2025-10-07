
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apikey:process.env.GEMINI_API_KEY});

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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const text = response?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);

    return { intent: "Low", reasoning: text };
  } catch (err) {
    console.error("Gemini API error:", err.message || err);
    return { intent: "Low", reasoning: "Gemini API unavailable" };
  }
}
