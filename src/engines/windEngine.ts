import { ValidatedConfig, CalculationMetrics } from "../core/types";

export const calculateWindPressure = (
  state: ValidatedConfig,
): CalculationMetrics => {
  const {
    height,
    width,
    length,
    intermediateSupports,
    spans,
    supportTop,
    supportBottom,
    windSpeed,
    s1,
    s2Category,
    s2Class,
    s3,
    cp,
    category,
    buildingHeight,
    windTunnelPressure,
  } = state;

  // Area and Effective Span
  const area = (height / 1000) * (width / 1000); // m²

  let effectiveSpan = height / 1000; // m
  let structuralSystem: "Biapoiado" | "Engastado" | "Consola" | "Contínuo" | "Engastado-Apoiado" =
    "Biapoiado";

  if (category === "guarda-corpo" || category === "pele-de-vidro") {
    if (intermediateSupports > 0) {
      structuralSystem = "Contínuo";
      // For continuous beams, effective span is the maximum span
      effectiveSpan = spans && spans.length > 0 ? Math.max(...spans) / 1000 : (length || height) / 1000;
    } else {
      effectiveSpan = (length || height) / 1000;
      if (supportBottom === "fixed" && supportTop === "free") {
        structuralSystem = "Consola";
      } else if (supportBottom === "fixed" && supportTop === "fixed") {
        structuralSystem = "Engastado";
      } else if ((supportBottom === "fixed" && supportTop === "pinned") || (supportBottom === "pinned" && supportTop === "fixed")) {
        structuralSystem = "Engastado-Apoiado";
      } else {
        structuralSystem = "Biapoiado";
      }
    }
  } else {
    if (supportBottom === "fixed" && supportTop === "free") {
      structuralSystem = "Consola";
    } else if (supportBottom === "fixed" && supportTop === "fixed") {
      structuralSystem = "Engastado";
    } else if ((supportBottom === "fixed" && supportTop === "pinned") || (supportBottom === "pinned" && supportTop === "fixed")) {
      structuralSystem = "Engastado-Apoiado";
    } else {
      structuralSystem = "Biapoiado";
    }
  }

  const slenderness = height / width;

  let vk = 0;
  let q = 0;
  let windPressure = 0;
  let windMethod: "NBR 6123" | "Túnel de Vento" = "NBR 6123";

  if (buildingHeight > 90) {
    windMethod = "Túnel de Vento";
    windPressure = windTunnelPressure / 1000; // Convert Pa to kN/m²
    q = windPressure / Math.abs(cp); // Back-calculate q for display purposes if needed, though not strictly accurate
  } else {
    // S2 Factor (Simplified NBR 6123 interpolation)
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
    vk = windSpeed * s1 * s2 * s3;

    // Dynamic Pressure (q) in N/m²
    const q_N = 0.613 * Math.pow(vk, 2);

    // Dynamic Pressure (q) in kN/m²
    q = q_N / 1000;

    // Design Wind Pressure (p) in kN/m²
    windPressure = q * Math.abs(cp);
  }

  // Total Load on the element (kN/m)
  const totalLoad = windPressure * (width / 1000);

  return {
    area,
    effectiveSpan,
    slenderness,
    vk,
    q,
    windPressure,
    totalLoad,
    structuralSystem,
    windMethod,
    spans,
    intermediateSupports,
    intermediateSupportTypes: [state.intermediateSupport1Type, state.intermediateSupport2Type].filter(Boolean) as any,
  };
};
