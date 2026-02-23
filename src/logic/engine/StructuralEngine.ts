import { CalcInputs, Profile, SupportCondition, Solution, Typology, GlassType } from "../types";

export class StructuralEngine {
  static calculateSolution(
    inputs: CalcInputs,
    profile: Profile,
    windPressure: number,
    typology: Typology
  ): Solution {
    const { height: heightMM, width: widthMM, modulusOfElasticity, allowableStress, glassType, glassThickness } = inputs;
    const height = heightMM / 1000;
    const width = widthMM / 1000;
    const totalLoad = windPressure * width; // kN/m

    // 1. Boundary Conditions Coefficients
    const { mCoef, dCoef } = this.getCoefficients(inputs.supportBottom, inputs.supportTop, inputs.category === "guarda-corpo");

    // 2. ELU - Ultimate Limit State
    const momentSoliciting = (totalLoad * Math.pow(height, 2)) * mCoef; // kNm
    const momentResistant = profile.mr || (profile.wx * allowableStress) / 1000; // kNm (Wx in cm3, stress in MPa -> kNm)
    const eluPassed = momentSoliciting <= momentResistant;

    // 3. ELS - Serviceability Limit State
    const deflection = (totalLoad * Math.pow(height, 4) * dCoef * 100000000) / (modulusOfElasticity * 1000000 * profile.ix); // mm
    const deflectionLimit = Math.min(heightMM / typology.defaultSlsRatio, typology.maxDeflectionLimit);
    const elsPassed = deflection <= deflectionLimit;

    // 4. Glass Verification (Simplified NBR 7199)
    const glassAdmissibleStress = glassType === "tempered" ? 50 : 20;
    const glassAlpha = this.getGlassAlpha(height, width);
    const glassStress = (glassAlpha * windPressure * 1000 * Math.pow(Math.min(height, width), 2)) / Math.pow(glassThickness / 1000, 2) / 1000000;
    const glassPassed = glassStress <= glassAdmissibleStress;

    // 5. Metrics
    const usageIndex = (momentSoliciting / momentResistant) * 100;
    const safetyMargin = 100 - usageIndex;
    const isApproved = eluPassed && elsPassed && glassPassed;

    return {
      id: `${profile.code}-${glassThickness}`,
      profile,
      glassThickness,
      glassType,
      ixReq: (totalLoad * Math.pow(height, 4) * dCoef * 100000000) / (modulusOfElasticity * 1000000 * deflectionLimit),
      wxReq: (momentSoliciting * 1000) / allowableStress,
      deflection,
      deflectionLimit,
      momentSoliciting,
      momentResistant,
      usageIndex,
      safetyMargin,
      eluPassed,
      elsPassed,
      isApproved,
      rank: "ideal" // Will be set by RankingEngine
    };
  }

  private static getCoefficients(start: SupportCondition, end: SupportCondition, isRailing: boolean) {
    let mCoef = 0.125;
    let dCoef = 5/384;

    if (isRailing) {
      mCoef = 0.5;
      dCoef = 0.125;
    } else {
      if (start === "fixed" && end === "fixed") { mCoef = 1/12; dCoef = 1/384; }
      else if ((start === "fixed" && end === "pinned") || (start === "pinned" && end === "fixed")) { mCoef = 1/8; dCoef = 1/185; }
      else if (start === "pinned" && end === "pinned") { mCoef = 1/8; dCoef = 5/384; }
      else if ((start === "fixed" && end === "free") || (start === "free" && end === "fixed")) { mCoef = 0.5; dCoef = 0.125; }
    }
    return { mCoef, dCoef };
  }

  private static getGlassAlpha(h: number, w: number): number {
    const ratio = Math.max(h, w) / Math.min(h, w);
    const alphaTable: Record<number, number> = {
      1.0: 0.284, 1.2: 0.372, 1.4: 0.455, 1.6: 0.530, 1.8: 0.598,
      2.0: 0.658, 2.5: 0.778, 3.0: 0.864, 4.0: 0.960, 5.0: 1.000
    };
    const keys = Object.keys(alphaTable).map(Number).sort((a, b) => a - b);
    let alpha = 0.284;
    for (let i = 0; i < keys.length - 1; i++) {
      if (ratio >= keys[i] && ratio <= keys[i+1]) {
        const x0 = keys[i], x1 = keys[i+1];
        const y0 = alphaTable[x0], y1 = alphaTable[x1];
        alpha = y0 + (y1 - y0) * (ratio - x0) / (x1 - x0);
        break;
      }
      if (ratio > keys[keys.length - 1]) alpha = 1.0;
    }
    return alpha;
  }
}
