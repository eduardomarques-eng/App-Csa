import { ValidatedConfig, Solution, Profile, GlassOption, Typology, Supplier } from "../core/types";
import { runStructuralEngine } from "../engines/structuralEngine";
import { getCompatibleProfiles } from "./catalogService";

export interface ComparisonResult {
  supplier: Supplier;
  bestSolution: Solution | null;
}

export const runComparison = (
  state: ValidatedConfig,
  suppliers: Supplier[],
  allProfiles: Profile[],
  glasses: GlassOption[],
  typology: Typology
): ComparisonResult[] => {
  const results: ComparisonResult[] = [];

  for (const supplier of suppliers) {
    // Get profiles for this supplier
    const supplierProfiles = getCompatibleProfiles(supplier.id, state.category);
    
    if (supplierProfiles.length === 0) {
      results.push({ supplier, bestSolution: null });
      continue;
    }

    // Run engine for this supplier's profiles
    const engineResult = runStructuralEngine(state, supplierProfiles, glasses, typology);
    
    // Get the best approved solution, or null if none
    const bestSolution = engineResult.solutions.find(s => s.isApproved) || null;
    
    results.push({ supplier, bestSolution });
  }

  // Sort results: approved first, then by score descending
  results.sort((a, b) => {
    if (a.bestSolution && !b.bestSolution) return -1;
    if (!a.bestSolution && b.bestSolution) return 1;
    if (a.bestSolution && b.bestSolution) {
      return b.bestSolution.score - a.bestSolution.score;
    }
    return 0;
  });

  return results;
};
