import { ConfigState, CalculationMetrics } from "../core/types";

export const calculateWindPressure = (state: ConfigState): CalculationMetrics => {
  const { height, width, windSpeed, s1, s2Category, s2Class, s3, cp } = state;

  // Area and Effective Span
  const area = (height / 1000) * (width / 1000); // m²
  const effectiveSpan = height / 1000; // m (assuming vertical element for now)
  const slenderness = height / width;

  // S2 Factor (Simplified NBR 6123 interpolation)
  // In a real scenario, this would be a complex table lookup based on height, category, and class.
  // We'll use a simplified approximation for demonstration.
  let s2Base = 1.0;
  if (s2Category === 1) s2Base = 1.1;
  else if (s2Category === 2) s2Base = 1.0;
  else if (s2Category === 3) s2Base = 0.9;
  else if (s2Category === 4) s2Base = 0.8;
  else if (s2Category === 5) s2Base = 0.7;

  let s2ClassMod = 0;
  if (s2Class === "A") s2ClassMod = 0.05;
  else if (s2Class === "C") s2ClassMod = -0.05;

  const s2 = s2Base + s2ClassMod;

  // Characteristic Wind Speed (Vk)
  const vk = windSpeed * s1 * s2 * s3;

  // Dynamic Pressure (q) in N/m²
  const q_N = 0.613 * Math.pow(vk, 2);
  
  // Dynamic Pressure (q) in kN/m²
  const q = q_N / 1000;

  // Design Wind Pressure (p) in kN/m²
  const windPressure = q * Math.abs(cp);

  // Total Load on the element (kN/m)
  const totalLoad = windPressure * (width / 1000);

  return {
    area,
    effectiveSpan,
    slenderness,
    vk,
    q,
    windPressure,
    totalLoad
  };
};
