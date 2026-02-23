import { ConfigState, ElsResult, Profile, Typology } from "../core/types";

export const calculateEls = (
  state: ConfigState,
  profile: Profile,
  totalLoad: number,
  effectiveSpan: number,
  typology: Typology
): ElsResult => {
  const { supportTop, supportBottom, modulusOfElasticity } = state;

  // Deflection Coefficient (Kf)
  let kf = 5 / 384; // Default simply supported (5qL⁴/384EI)
  if (supportTop === "fixed" && supportBottom === "fixed") kf = 1 / 384; // Fixed-fixed (qL⁴/384EI)
  else if (supportTop === "fixed" || supportBottom === "fixed") kf = 1 / 185; // Fixed-pinned (qL⁴/185EI)
  else if (supportTop === "free" || supportBottom === "free") kf = 1 / 8; // Cantilever (qL⁴/8EI)

  // Deflection (f) in mm
  // f = (Kf * q * L⁴) / (E * I)
  // q in N/mm (kN/m), L in mm, E in MPa (N/mm²), I in mm⁴
  const q_Nmm = totalLoad; // kN/m = N/mm
  const L_mm = effectiveSpan * 1000;
  const E_MPa = modulusOfElasticity * 1000; // GPa to MPa
  const I_mm4 = profile.ix * 10000; // cm⁴ to mm⁴

  const deflection = (kf * q_Nmm * Math.pow(L_mm, 4)) / (E_MPa * I_mm4);

  // Admissible Deflection (fadm)
  const ratioLimit = L_mm / typology.defaultSlsRatio;
  const maxLimit = typology.maxDeflectionLimit;
  const deflectionLimit = Math.min(ratioLimit, maxLimit);

  const ratio = (deflection / deflectionLimit) * 100;
  const passed = deflection <= deflectionLimit;

  return {
    deflection,
    deflectionLimit,
    ratio,
    passed
  };
};
