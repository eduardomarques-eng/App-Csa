import { ConfigState, EluResult, Profile } from "../core/types";

export const calculateElu = (
  state: ConfigState,
  profile: Profile,
  totalLoad: number,
  effectiveSpan: number
): EluResult => {
  const { supportTop, supportBottom, allowableStress } = state;

  // Moment Coefficient (Km)
  let km = 8; // Default simply supported (qL²/8)
  if (supportTop === "fixed" && supportBottom === "fixed") km = 12; // Fixed-fixed (qL²/12)
  else if (supportTop === "fixed" || supportBottom === "fixed") km = 8; // Fixed-pinned max moment is ~qL²/8 (actually 9/128 qL², but 8 is conservative)
  else if (supportTop === "free" || supportBottom === "free") km = 2; // Cantilever (qL²/2)

  // Soliciting Moment (Md) in kNm
  // M = (q * L²) / Km
  const momentSoliciting = (totalLoad * Math.pow(effectiveSpan, 2)) / km;

  // Resistant Moment (Mr) in kNm
  // Mr = (Wx * fy) / gamma_m
  // Wx is in cm³, fy is allowable stress in MPa (N/mm²)
  // Wx (cm³) * 1000 = Wx (mm³)
  // Mr (N.mm) = Wx (mm³) * fy (N/mm²)
  // Mr (kNm) = Mr (N.mm) / 1,000,000
  const gammaM = 1.1; // Partial safety factor for aluminum
  const momentResistant = (profile.wx * 1000 * allowableStress) / gammaM / 1000000;

  const usageIndex = (momentSoliciting / momentResistant) * 100;
  const safetyMargin = (momentResistant / momentSoliciting) - 1;
  const passed = momentSoliciting <= momentResistant;

  return {
    momentSoliciting,
    momentResistant,
    usageIndex,
    safetyMargin,
    passed
  };
};
