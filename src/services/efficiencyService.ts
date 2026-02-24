import { Solution, EluResult, ElsResult, GlassResult } from "../core/types";

export const calculateEfficiency = (
  elu: EluResult,
  els: ElsResult,
  glassResult: GlassResult,
): {
  efficiencyIndex: number;
  deflectionEfficiency: number;
  globalEfficiency: number;
  efficiencyClass: "Alta" | "Média" | "Superdimensionado" | "Reprovado";
} => {
  // Eficiência = (Momento resistente utilizado / Momento resistente disponível) × 100
  const efficiencyIndex =
    elu.momentResistant > 0
      ? (elu.momentSoliciting / elu.momentResistant) * 100
      : 0;

  // Eficiência de Flecha = (Flecha calculada / Flecha admissível) × 100
  const deflectionEfficiency =
    els.deflectionLimit > 0 ? (els.deflection / els.deflectionLimit) * 100 : 0;

  // Índice combinado ponderado (ex: 60% ELU, 40% ELS)
  const globalEfficiency = efficiencyIndex * 0.6 + deflectionEfficiency * 0.4;

  let efficiencyClass: "Alta" | "Média" | "Superdimensionado" | "Reprovado" =
    "Reprovado";

  if (!elu.passed || !els.passed || !glassResult.passed) {
    efficiencyClass = "Reprovado";
  } else if (globalEfficiency >= 75 && globalEfficiency <= 95) {
    efficiencyClass = "Alta";
  } else if (globalEfficiency >= 50 && globalEfficiency < 75) {
    efficiencyClass = "Média";
  } else if (globalEfficiency < 50) {
    efficiencyClass = "Superdimensionado";
  } else {
    efficiencyClass = "Reprovado"; // > 100% or something else
  }

  return {
    efficiencyIndex,
    deflectionEfficiency,
    globalEfficiency,
    efficiencyClass,
  };
};
