import { ValidatedConfig, GlassOption, GlassResult } from "../core/types";
import { generateVerificationResult } from "../services/verificationService";

export const calculateGlass = (
  state: ValidatedConfig,
  glass: GlassOption,
  windPressure: number,
  area: number,
): GlassResult => {
  const { glassType } = state;

  // Simplified Glass Stress Calculation (NBR 7199 approximation)
  // Stress (MPa) = Alpha * Pressure (kPa) * (Area (m²) / Thickness² (mm²))
  let alpha = 0.5; // Default for monolithic
  if (glassType === "tempered") alpha = 0.25;
  else if (glassType === "laminated") alpha = 0.75;

  const pressure_kPa = windPressure; // kN/m² = kPa
  const stress = alpha * pressure_kPa * (area / Math.pow(glass.thickness, 2));

  const passed = stress <= glass.admissibleStress;

  return {
    stress,
    admissibleStress: glass.admissibleStress,
    passed,
    verification: generateVerificationResult(stress, glass.admissibleStress, "VIDRO"),
  };
};
