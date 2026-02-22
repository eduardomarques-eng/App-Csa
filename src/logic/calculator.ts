import { CalcInputs, CalcResults, Profile, RegionWind, SupportCondition } from "./types";

export const BRAZIL_REGIONS: RegionWind[] = [
  { name: "Região I (Sul / RS / SC)", v0: 45 },
  { name: "Região II (Sudeste / SP / RJ / PR)", v0: 40 },
  { name: "Região III (Centro / MG / GO / MS)", v0: 35 },
  { name: "Região IV (Norte / Nordeste / BA / PE)", v0: 30 },
  { name: "Região V (Extremo Norte / AM / RR)", v0: 25 },
];

export class MotorCalculoFachada {
  static calculate(inputs: CalcInputs, catalog: Profile[]): CalcResults {
    const {
      height: heightMM,
      width: widthMM,
      supports,
      spanDistances,
      windSpeed,
      s1,
      s2Category,
      s2Class,
      s3,
      cp,
      allowableStress,
      modulusOfElasticity,
      glassThickness,
      glassType
    } = inputs;

    // Convert mm to meters for calculations
    const height = heightMM / 1000;
    const width = widthMM / 1000;

    // 1. Fator S2 (NBR 6123 - Simplificado para o MVP)
    const s2Table: Record<number, Record<string, number>> = {
      1: { A: 1.06, B: 1.04, C: 1.01 },
      2: { A: 1.02, B: 0.98, C: 0.93 },
      3: { A: 0.94, B: 0.88, C: 0.82 },
      4: { A: 0.86, B: 0.79, C: 0.71 },
      5: { A: 0.74, B: 0.65, C: 0.56 },
    };
    const s2 = s2Table[s2Category][s2Class] || 0.9;

    // 2. Pressão Dinâmica (q) = 0.613 * (V0 * S1 * S2 * S3)^2
    const vk = windSpeed * s1 * s2 * s3;
    const q_dynamic = 0.613 * Math.pow(vk, 2); // N/m^2
    const windPressure = (q_dynamic * Math.abs(cp)) / 1000; // kN/m^2

    // 3. Carga Linear no Montante (kN/m)
    const totalLoad = windPressure * width;

    // 4. Momento Fletor Máximo (kNm) e Inércia Requerida (cm^4)
    let maxMoment = 0;
    let requiredIx = 0;
    let momentCoefficient = 0;
    let deflectionCoefficient = 0;
    let criticalSpanLength = 0;

    const calculateSpan = (L_mm: number, start: SupportCondition, end: SupportCondition, isContinuous: boolean) => {
      const L = L_mm / 1000;
      let mCoef = 0;
      let dCoef = 0;

      if (inputs.calculationMode === "railing") {
        mCoef = 1/2;
        dCoef = 1/8;
      } else if (isContinuous) {
        mCoef = 1/10;
        dCoef = 1/145;
      } else {
        if (start === "fixed" && end === "fixed") {
          mCoef = 1/12;
          dCoef = 1/384;
        } else if ((start === "fixed" && end === "pinned") || (start === "pinned" && end === "fixed")) {
          mCoef = 1/8;
          dCoef = 1/185;
        } else if (start === "pinned" && end === "pinned") {
          mCoef = 1/8;
          dCoef = 5/384;
        } else if ((start === "fixed" && end === "free") || (start === "free" && end === "fixed")) {
          mCoef = 1/2;
          dCoef = 1/8;
        } else {
          mCoef = 1/8;
          dCoef = 5/384;
        }
      }

      const moment = (totalLoad * Math.pow(L, 2)) * mCoef;
      const iReq = (totalLoad * Math.pow(L, 4) * dCoef) / (modulusOfElasticity * 1000000 * Math.min(L / 175, 0.02));
      return { moment, iReq, mCoef, dCoef };
    };

    // Analyze each span and pick the worst case
    const isContinuous = supports.length > 2;
    for (let i = 0; i < spanDistances.length; i++) {
      const spanRes = calculateSpan(spanDistances[i], supports[i], supports[i+1], isContinuous);
      if (spanRes.moment > maxMoment) {
        maxMoment = spanRes.moment;
        momentCoefficient = spanRes.mCoef;
        deflectionCoefficient = spanRes.dCoef;
        criticalSpanLength = spanDistances[i];
      }
      if (spanRes.iReq * 100000000 > requiredIx) {
        requiredIx = spanRes.iReq * 100000000;
      }
    }

    const maxAllowedDeflection = Math.min(criticalSpanLength / 175000, 0.02);

    // 5. Módulo Requerido (cm^3) - ULS
    const f_d_kNm2 = allowableStress * 1000;
    const wReqM3 = maxMoment / f_d_kNm2;
    const requiredWx = wReqM3 * 1000000;

    // 6. Cálculo do Vidro (NBR 7199:2025 - Interpolação Alpha)
    const ratio = Math.max(height, width) / Math.min(height, width);
    const alphaTable: Record<number, number> = {
      1.0: 0.284, 1.2: 0.372, 1.4: 0.455, 1.6: 0.530, 1.8: 0.598,
      2.0: 0.658, 2.5: 0.778, 3.0: 0.864, 4.0: 0.960, 5.0: 1.000
    };
    
    // Interpolação Linear Simples
    const keys = Object.keys(alphaTable).map(Number).sort((a, b) => a - b);
    let glassAlpha = 0.284;
    for (let i = 0; i < keys.length - 1; i++) {
      if (ratio >= keys[i] && ratio <= keys[i+1]) {
        const x0 = keys[i], x1 = keys[i+1];
        const y0 = alphaTable[x0], y1 = alphaTable[x1];
        glassAlpha = y0 + (y1 - y0) * (ratio - x0) / (x1 - x0);
        break;
      }
      if (ratio > keys[keys.length - 1]) glassAlpha = 1.0;
    }

    const glassAdmissibleStress = glassType === "tempered" ? 50 : 20;
    const glassStress = (glassAlpha * windPressure * 1000 * Math.pow(Math.min(height, width), 2)) / Math.pow(glassThickness / 1000, 2) / 1000000;
    const glassPassed = glassStress <= glassAdmissibleStress;

    // 7. Otimização de Perfil
    let selectedProfile: Profile | null = null;
    const validProfiles = catalog
      .filter((p) => p.ix >= requiredIx && p.wx >= requiredWx)
      .sort((a, b) => a.weight - b.weight);

    if (validProfiles.length > 0) {
      selectedProfile = validProfiles[0];
    }

    // 8. Classe de Desempenho (NBR 10821)
    let performanceClass = "Mínima";
    if (windPressure > 1.5) performanceClass = "Excepcional";
    else if (windPressure > 1.0) performanceClass = "Superior";
    else if (windPressure > 0.6) performanceClass = "Intermediária";

    // Especificações
    const glassMap: Record<string, string> = {
      monolithic: "Monolítico",
      tempered: "Temperado",
      laminated: "Laminado"
    };
    const glassSpecification = `${glassThickness}mm ${glassMap[glassType] || glassType}`;
    const profileSpecification = selectedProfile ? `Perfil ${selectedProfile.code}` : "Nenhum perfil encontrado";

    return {
      vk,
      q: q_dynamic / 1000,
      windPressure,
      totalLoad,
      maxMoment,
      maxDeflection: maxAllowedDeflection * 1000,
      requiredIx,
      requiredWx,
      glassStress,
      glassDeflection: 0,
      glassAlpha,
      momentCoefficient,
      deflectionCoefficient,
      selectedProfile,
      slsPassed: selectedProfile ? selectedProfile.ix >= requiredIx : false,
      ulsPassed: selectedProfile ? selectedProfile.wx >= requiredWx : false,
      glassPassed,
      performanceClass,
      glassSpecification,
      profileSpecification
    };
  }
}
