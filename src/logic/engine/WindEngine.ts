import { CalcInputs } from "../types";

export class WindEngine {
  static calculatePressure(inputs: CalcInputs): {
    vk: number;
    q: number;
    windPressure: number;
  } {
    const { windSpeed, s1, s2Category, s2Class, s3, cp } = inputs;

    // Fator S2 (NBR 6123)
    // S2 Factor (NBR 6123 interpolation based on building height)
    // For this simple engine, we assume z = 10m if buildingHeight is not provided
    const z = 10;
    
    const s2Params: Record<string, Record<number, { b: number, p: number, Fr: number }>> = {
      "A": {
        1: { b: 1.10, p: 0.06, Fr: 1.00 },
        2: { b: 1.00, p: 0.085, Fr: 1.00 },
        3: { b: 0.94, p: 0.10, Fr: 1.00 },
        4: { b: 0.86, p: 0.12, Fr: 1.00 },
        5: { b: 0.74, p: 0.15, Fr: 1.00 }
      },
      "B": {
        1: { b: 1.11, p: 0.065, Fr: 0.98 },
        2: { b: 1.00, p: 0.09, Fr: 0.98 },
        3: { b: 0.94, p: 0.105, Fr: 0.98 },
        4: { b: 0.86, p: 0.125, Fr: 0.98 },
        5: { b: 0.74, p: 0.16, Fr: 0.98 }
      },
      "C": {
        1: { b: 1.12, p: 0.07, Fr: 0.95 },
        2: { b: 1.00, p: 0.095, Fr: 0.95 },
        3: { b: 0.94, p: 0.115, Fr: 0.95 },
        4: { b: 0.86, p: 0.135, Fr: 0.95 },
        5: { b: 0.74, p: 0.175, Fr: 0.95 }
      }
    };

    const params = s2Params[s2Class][s2Category];
    const s2 = params.b * params.Fr * Math.pow(z / 10, params.p);

    // Pressão Dinâmica (q) = 0.613 * (V0 * S1 * S2 * S3)^2
    const vk = windSpeed * s1 * s2 * s3;
    const q = 0.613 * Math.pow(vk, 2); // N/m^2
    const windPressure = (q * Math.abs(cp)) / 1000; // kN/m^2

    return { vk, q: q / 1000, windPressure };
  }
}
