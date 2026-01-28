
import { GoogleGenAI } from "@google/genai";
import { WaterQualityData, SofteningResults } from '../types';

export const getSofteningAdvice = async (input: WaterQualityData, output: SofteningResults): Promise<string> => {
  // Use a safer way to access process.env for browser compatibility
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;

  if (!apiKey) {
    return "API Key is not configured. Please ensure you have selected a key if prompted.";
  }

  // Use Gemini 3 Pro for advanced engineering reasoning
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Role: Senior Water Process Engineer
    Task: Analyze chemical softening results and provide operational advice.
    
    RAW WATER DATA:
    - pH: ${input.ph}
    - Calcium (Ca): ${input.calcium} mg/L
    - Magnesium (Mg): ${input.magnesium} mg/L
    - Alkalinity: ${input.alkalinity} mg/L CaCO3
    - Conductivity: ${input.conductivity} uS/cm
    - Sulphate: ${input.sulphate} mg/L
    
    TREATMENT PREDICTIONS:
    - Lime Dose: ${output.limeDose.toFixed(1)} mg/L Ca(OH)2
    - Soda Ash Dose: ${output.sodaAshDose.toFixed(1)} mg/L Na2CO3
    - Sludge Production: ${output.sludgeProduced.toFixed(1)} mg/L dry solids
    
    FINAL WATER QUALITY:
    - pH: ${output.softenedPh}
    - Total Hardness: ${output.softenedHardness.toFixed(1)} mg/L CaCO3
    - Alkalinity: ${output.softenedAlkalinity.toFixed(1)} mg/L CaCO3
    - Langelier Saturation Index (LSI): ${output.lsi.toFixed(2)}
    - CCPP: ${output.ccpp.toFixed(1)} mg/L CaCO3
    
    Instructions:
    Provide exactly three professional, high-impact bullet points:
    1. A comment on the chemical strategy (efficiency of lime/soda usage).
    2. A warning or confirmation regarding scaling/corrosion risks based on LSI/CCPP.
    3. A specific recommendation for sludge handling or post-treatment (e.g. recarbonation).
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
