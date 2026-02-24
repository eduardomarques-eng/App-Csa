import { ValidatedConfig, Solution, Profile, GlassOption, Typology } from "../core/types";
import { runStructuralEngine } from "../engines/structuralEngine";

export const runOptimization = (
  state: ValidatedConfig,
  profiles: Profile[],
  glasses: GlassOption[],
  typology: Typology
): Solution[] => {
  // Run the engine with all profiles and glasses
  // The engine already tests all combinations and ranks them
  const result = runStructuralEngine(state, profiles, glasses, typology);
  
  return result.solutions;
};
