import { GoogleGenAI } from "@google/genai";
import { WaterQualityData, SofteningResults } from '../types';

export const getSofteningAdvice = async (input: WaterQualityData, output: SofteningResults): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "ERROR_KEY_REQUIRED";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Role: Senior Water Process Engineer
    Task: Analyze chemical softening results and provide operational advice.
    
    RAW WATER DATA:
    - pH: ${input.ph}
    - Calcium (Ca): ${input.calcium} mg/L
    - Magnesium (Mg): ${input.magnesium} mg/L
    - Alkalinity: ${input.alkalinity} mg/L CaCO3
    
    TREATMENT PREDICTIONS:
    - Lime Dose: ${output.limeDose.toFixed(1)} mg/L Ca(OH)2
    - Soda Ash Dose: ${output.sodaAshDose.toFixed(1)} mg/L Na2CO3
    
    FINAL WATER QUALITY:
    - Total Hardness: ${output.softenedHardness.toFixed(1)} mg/L CaCO3
    - Langelier Saturation Index (LSI): ${output.lsi.toFixed(2)}
    
    Instructions:
    Provide exactly three professional, high-impact bullet points:
    1. A comment on the chemical strategy.
    2. A warning or confirmation regarding scaling/corrosion risks.
    3. A specific recommendation for sludge handling or post-treatment.
    Use precise, expert terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "No insights generated.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error.message || String(error);
    if (msg.includes("entity was not found") || msg.includes("API key")) {
      return "ERROR_KEY_REQUIRED";
    }
    return `Error generating insights: ${msg}`;
  }
};
