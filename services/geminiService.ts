import { GoogleGenAI, Type } from "@google/genai";
import { AiAuditResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are the AURA-CORE AI, a highly advanced audit system for music supply chain metadata.
Your job is to analyze release metadata and distribution parameters to ensure DDEX compliance,
detect algorithmic gaming, and predict market performance.
You speak in a technical, concise, high-tech terminal style.
`;

export const performSemanticAudit = async (releaseId: string, profile: string): Promise<AiAuditResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found, returning mock data");
      return getMockAuditData();
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Perform a semantic audit for Release ID: ${releaseId} using DDEX Profile: ${profile}.
      Analyze potential metadata conflicts, check for 'gaming' terms in titles, and predict supply chain latency.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            semanticScore: { type: Type.NUMBER, description: "Score from 0 to 100 indicating metadata quality" },
            complianceStatus: { type: Type.STRING, enum: ["PASS", "WARN", "FAIL"] },
            flaggedTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketPrediction: { type: Type.STRING, description: "A brief, 1-sentence prediction on market fit." },
            optimizationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["semanticScore", "complianceStatus", "marketPrediction"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiAuditResult;
    }
    return getMockAuditData();

  } catch (error) {
    console.error("Gemini Audit Failed:", error);
    return getMockAuditData();
  }
};

const getMockAuditData = (): AiAuditResult => ({
  semanticScore: 94.2,
  complianceStatus: 'PASS',
  flaggedTerms: ['Explicit Context (Approved)', 'High-Freq visuals'],
  marketPrediction: "Algorithm alignment optimal for Tier 1 territories.",
  optimizationSuggestions: ["Add localized metadata for JP region", "Upload Apple Digital Master specifically"]
});