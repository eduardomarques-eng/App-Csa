import {
  Solution,
  Profile,
  GlassOption,
  Typology,
  CalculationMetrics,
  ValidatedConfig,
} from "../core/types";
import { calculateWindPressure } from "./windEngine";
import { calculateElu } from "./eluEngine";
import { calculateEls } from "./elsEngine";
import { calculateGlass } from "./glassEngine";
import { rankSolutions } from "./rankingEngine";
import { calculateEfficiency } from "../services/efficiencyService";

export const runStructuralEngine = (
  state: ValidatedConfig,
  profiles: Profile[],
  glasses: GlassOption[],
  typology: Typology,
): { metrics: CalculationMetrics; solutions: Solution[] } => {
  const metrics = calculateWindPressure(state);
  const { totalLoad, effectiveSpan, windPressure, area, structuralSystem } =
    metrics;

  const validSolutions: Solution[] = [];

  const glassesToTest =
    state.glassThickness > 0
      ? glasses.filter((g) => g.thickness === state.glassThickness)
      : glasses;

  for (const profile of profiles) {
    for (const glass of glassesToTest) {
      const elu = calculateElu(
        state,
        profile,
        totalLoad,
        effectiveSpan,
        structuralSystem,
      );
      const els = calculateEls(
        state,
        profile,
        totalLoad,
        effectiveSpan,
        typology,
        structuralSystem,
      );
      const glassResult = calculateGlass(state, glass, windPressure, area);

      const isApproved = elu.passed && els.passed && glassResult.passed;

      const efficiency = calculateEfficiency(elu, els, glassResult);

      if (isApproved || (elu.usageIndex < 150 && els.ratio < 150)) {
        validSolutions.push({
          id: `${profile.code}-${glass.thickness}-${glass.type}`,
          profile,
          glass,
          elu,
          els,
          glassResult,
          isApproved,
          rank: "reprovada",
          score: 0,
          ...efficiency,
        });
      }
    }
  }

  const rankedSolutions = rankSolutions(validSolutions);

  return {
    metrics,
    solutions: rankedSolutions,
  };
};
