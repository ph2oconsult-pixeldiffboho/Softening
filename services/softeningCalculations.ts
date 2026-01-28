
import { WaterQualityData, SofteningResults } from '../types';

/**
 * Advanced stoichiometric model for Lime and Soda Ash softening.
 * All intermediate chemical balances are handled in mg/L as CaCO3 equivalent.
 */
export const calculateSoftening = (data: WaterQualityData): SofteningResults => {
  // Conversion factors
  const CA_TO_CACO3 = 2.497;
  const MG_TO_CACO3 = 4.118;
  const CACO3_MW = 100.08;
  const CAOH2_MW = 74.09;
  const NA2CO3_MW = 105.99;

  // 1. Initial State (mg/L as CaCO3)
  const rawCa = data.calcium * CA_TO_CACO3;
  const rawMg = data.magnesium * MG_TO_CACO3;
  const rawHardness = rawCa + rawMg;
  const rawAlk = data.alkalinity;
  
  // Estimate CO2 as CaCO3 (Simplified based on pH and Alk)
  // [CO2] = [Alk] * 10^(pK1 - pH) where pK1 ~ 6.35
  const co2_as_CaCO3 = rawAlk * Math.pow(10, 6.35 - data.ph);

  // 2. Targets (mg/L as CaCO3)
  const targetCa = data.targetCa;
  const targetMg = data.targetMg;
  
  // 3. Dosages Calculation (Stoichiometry in mg/L as CaCO3)
  
  // Lime removes:
  // - CO2 (1:1)
  // - Bicarbonate Alkalinity associated with Calcium (Ca-CH) (1:1)
  // - Bicarbonate Alkalinity associated with Magnesium (Mg-CH) (2:1 because Mg(OH)2 is the precipitate)
  // - Any Magnesium that needs removing (even non-carbonate) requires lime to reach high pH
  
  const carbonateHardness = Math.min(rawHardness, rawAlk);
  const caCH = Math.min(rawCa, carbonateHardness);
  const mgCH = Math.max(0, carbonateHardness - caCH);
  
  const caToRemove = Math.max(0, rawCa - targetCa);
  const mgToRemove = Math.max(0, rawMg - targetMg);
  
  // Basic Lime Demand
  let limeDemand_CaCO3 = co2_as_CaCO3 + caCH + (2 * mgCH);
  
  // If we are removing Mg beyond its Carbonate Hardness, we need extra lime (Mg-NCH)
  const mgNCH = Math.max(0, rawMg - mgCH);
  const mgNCHToRemove = Math.max(0, mgNCH - (targetMg - Math.max(0, mgCH - mgToRemove)));
  limeDemand_CaCO3 += mgNCHToRemove;

  // Excess lime for high pH (required for Mg removal below ~40 mg/L as CaCO3)
  const excessLime = targetMg < 40 ? 30 : 0;
  limeDemand_CaCO3 += excessLime;

  // Convert to mg/L as Ca(OH)2
  const limeDose = (limeDemand_CaCO3 / CACO3_MW) * CAOH2_MW;

  // Soda Ash Demand
  // Used to remove Non-Carbonate Hardness (NCH). 
  // NCH is what's left after Alkalinity is used up.
  const rawNCH = Math.max(0, rawHardness - rawAlk);
  // Total Hardness to remove = (rawHardness - targetHardness)
  // Hardness removed by Lime = (rawHardness - targetHardness) - Hardness removed by Soda Ash
  // Soda Ash is needed if target hardness is lower than the remaining alkalinity after lime softening.
  const sodaAshDemand_CaCO3 = Math.max(0, (rawHardness - targetCa - targetMg) - rawAlk);
  const sodaAshDose = (sodaAshDemand_CaCO3 / CACO3_MW) * NA2CO3_MW;

  // 4. Final Water Quality Estimates
  const softenedCa = targetCa;
  const softenedMg = targetMg;
  const softenedHardness = softenedCa + softenedMg;
  
  // Final Alkalinity
  // Softened Alk = Raw Alk + Soda Ash - Total Hardness Removed
  let softenedAlk = Math.max(20, rawAlk + sodaAshDemand_CaCO3 - (rawHardness - softenedHardness));
  
  // Final pH estimation (typical ranges for lime-soda processes)
  const softenedPh = targetMg < 40 ? 10.6 : 9.8;

  // 5. Sludge Production (mg/L dry solids)
  // CaCO3 = (Ca removed + Lime added) - (Remaining Ca - remaining Lime excess)
  // Simplification: Sludge = (Ca removed as CaCO3) + (Mg removed as Mg(OH)2)
  // Mg(OH)2 MW is ~58.3. 1 mg/L Mg as CaCO3 = 0.58 mg/L Mg(OH)2
  const sludgeCa = (rawCa - softenedCa); 
  const sludgeMg = (rawMg - softenedMg) * (58.3 / 100.08);
  const sludgeProduced = sludgeCa + sludgeMg;

  // 6. Stability Indices (LSI and CCPP)
  const TDS = data.conductivity * 0.65;
  const tempK = data.temperature + 273.15;
  const A = (Math.log10(TDS) - 1) / 10;
  const B = -13.12 * Math.log10(tempK) + 34.55;
  const C = Math.log10(softenedCa) - 0.4;
  const D = Math.log10(softenedAlk);
  const phs = (9.3 + A + B) - (C + D);
  const lsi = softenedPh - phs;

  // CCPP (Simplified calculation)
  const ccpp = lsi > 0 ? (softenedAlk * (1 - Math.pow(10, -lsi))) : 0;

  return {
    limeDose,
    sodaAshDose,
    softenedPh,
    softenedCa,
    softenedMg,
    softenedHardness,
    softenedAlkalinity: softenedAlk,
    sludgeProduced,
    lsi,
    ccpp,
    initialHardness: rawHardness
  };
};

