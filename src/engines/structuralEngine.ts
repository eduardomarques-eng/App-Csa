import { ConfigState, Solution, Profile, GlassOption, Typology, CalculationMetrics } from "../core/types";
import { calculateWindPressure } from "./windEngine";
import { calculateElu } from "./eluEngine";
import { calculateEls } from "./elsEngine";
import { calculateGlass } from "./glassEngine";
import { rankSolutions } from "./rankingEngine";

export const runStructuralEngine = (
  state: ConfigState,
  profiles: Profile[],
  glasses: GlassOption[],
  typology: Typology
): { metrics: CalculationMetrics, solutions: Solution[] } => {
  const metrics = calculateWindPressure(state);
  const { totalLoad, effectiveSpan, windPressure, area } = metrics;

  const validSolutions: Solution[] = [];

  for (const profile of profiles) {
    for (const glass of glasses) {
      const elu = calculateElu(state, profile, totalLoad, effectiveSpan);
      const els = calculateEls(state, profile, totalLoad, effectiveSpan, typology);
      const glassResult = calculateGlass(state, glass, windPressure, area);

      const isApproved = elu.passed && els.passed && glassResult.passed;

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
          score: 0
        });
      }
    }
  }

  const rankedSolutions = rankSolutions(validSolutions);

  return {
    metrics,
    solutions: rankedSolutions
  };
};
