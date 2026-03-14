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
    // S2 Factor (NBR 6123 interpolation based on building height)
    const z = Math.max(buildingHeight, 5); // Minimum height is usually 5m for calculation
    
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
