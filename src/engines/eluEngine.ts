import { ValidatedConfig, EluResult, Profile } from "../core/types";
import { generateVerificationResult } from "../services/verificationService";

export const calculateElu = (
  state: ValidatedConfig,
  profile: Profile,
  totalLoad: number,
  effectiveSpan: number,
  structuralSystem: "Biapoiado" | "Engastado" | "Consola" | "Contínuo",
): EluResult => {
  const { allowableStress } = state;
  const gammaM = 1.1; // Partial safety factor for aluminum

  // Moment Coefficient (Km)
  let km = 8; // Default simply supported (qL²/8)
  if (structuralSystem === "Engastado")
    km = 12; // Fixed-fixed (qL²/12)
  else if (structuralSystem === "Consola")
    km = 2; // Cantilever (qL²/2)
  else if (structuralSystem === "Contínuo") km = 10; // Approximation for continuous beams (qL²/10)

  // Soliciting Moment (Md) in kNm
  // M = (q * L²) / Km
  const momentSoliciting = (totalLoad * Math.pow(effectiveSpan, 2)) / km;

  // Shear Force (Vd) in kN
  let shearCoeff = 2; // qL/2 for simply supported
  if (structuralSystem === "Engastado")
    shearCoeff = 2; // qL/2
  else if (structuralSystem === "Consola")
    shearCoeff = 1; // qL
  else if (structuralSystem === "Contínuo") shearCoeff = 1.6; // ~0.6qL

  const shearSoliciting = (totalLoad * effectiveSpan) / shearCoeff;
  
  // Shear Resistant (Vr) in kN (simplified estimate for aluminum profile web)
  // Vr = (Aw * fy / sqrt(3)) / gammaM
  // Aw = Area of web. We'll approximate Aw as 30% of total area for a typical profile
  // Area is not directly in profile, we can estimate from weight: Area (cm2) = weight (kg/m) / 0.27
  const areaCm2 = profile.weight / 0.27;
  const awMm2 = (areaCm2 * 100) * 0.3; 
  const shearResistant = (awMm2 * (allowableStress / Math.sqrt(3))) / gammaM / 1000;

  // Resistant Moment (Mr) in kNm
  // Mr = (Wx * fy) / gamma_m
  // Wx is in cm³, fy is allowable stress in MPa (N/mm²)
  // Wx (cm³) * 1000 = Wx (mm³)
  // Mr (N.mm) = Wx (mm³) * fy (N/mm²)
  // Mr (kNm) = Mr (N.mm) / 1,000,000
  const momentResistant =
    (profile.wx * 1000 * allowableStress) / gammaM / 1000000;

  const usageIndex = (momentSoliciting / momentResistant) * 100;
  const safetyMargin = momentResistant > 0 ? ((momentResistant - momentSoliciting) / momentResistant) * 100 : 0;
  const passed = momentSoliciting <= momentResistant && shearSoliciting <= shearResistant;

  return {
    momentSoliciting,
    momentResistant,
    shearSoliciting,
    shearResistant,
    usageIndex,
    safetyMargin,
    passed,
    verification: generateVerificationResult(momentSoliciting, momentResistant, "ELU"),
  };
};
