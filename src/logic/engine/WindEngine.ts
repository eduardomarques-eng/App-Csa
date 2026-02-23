import { CalcInputs } from "../types";

export class WindEngine {
  static calculatePressure(inputs: CalcInputs): { vk: number; q: number; windPressure: number } {
    const { windSpeed, s1, s2Category, s2Class, s3, cp } = inputs;

    // Fator S2 (NBR 6123)
    const s2Table: Record<number, Record<string, number>> = {
      1: { A: 1.06, B: 1.04, C: 1.01 },
      2: { A: 1.02, B: 0.98, C: 0.93 },
      3: { A: 0.94, B: 0.88, C: 0.82 },
      4: { A: 0.86, B: 0.79, C: 0.71 },
      5: { A: 0.74, B: 0.65, C: 0.56 },
    };
    const s2 = s2Table[s2Category][s2Class] || 0.9;

    // Pressão Dinâmica (q) = 0.613 * (V0 * S1 * S2 * S3)^2
    const vk = windSpeed * s1 * s2 * s3;
    const q = 0.613 * Math.pow(vk, 2); // N/m^2
    const windPressure = (q * Math.abs(cp)) / 1000; // kN/m^2

    return { vk, q: q / 1000, windPressure };
  }
}
