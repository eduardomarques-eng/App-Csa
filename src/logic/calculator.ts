import { CalcInputs, CalcResults, Profile, Solution, Typology } from "./types";
import { WindEngine } from "./engine/WindEngine";
import { StructuralEngine } from "./engine/StructuralEngine";
import { RankingEngine } from "./engine/RankingEngine";
import { TYPOLOGIES } from "./constants";

export class MotorCalculoFachada {
  static calculate(inputs: CalcInputs, catalog: Profile[]): CalcResults {
    // 1. Wind Pressure Calculation
    const { vk, q, windPressure } = WindEngine.calculatePressure(inputs);

    // 2. Find Typology
    const typology =
      TYPOLOGIES.find((t) => t.id === inputs.typologyId) || TYPOLOGIES[0];

    // 3. Filter Catalog by Supplier
    const filteredCatalog = catalog.filter(
      (p) => p.supplierId === inputs.supplierId,
    );

    // 4. Generate Solutions
    const rawSolutions: Solution[] = filteredCatalog.map((profile) =>
      StructuralEngine.calculateSolution(
        inputs,
        profile,
        windPressure,
        typology,
      ),
    );

    // 5. Rank Solutions
    const rankedSolutions = RankingEngine.rankSolutions(rawSolutions);

    // 6. Determine Performance Class
    const bestSolution = rankedSolutions.find((s) => s.isApproved) || null;
    const performanceClass = this.determinePerformanceClass(
      windPressure,
      bestSolution,
    );

    return {
      vk,
      q,
      windPressure,
      solutions: rankedSolutions,
      bestSolution,
      performanceClass,
    };
  }

  private static determinePerformanceClass(
    pressure: number,
    solution: Solution | null,
  ): string {
    if (!solution || !solution.isApproved) return "Não Atende";

    if (pressure > 2.5) return "Excepcional (S)";
    if (pressure > 1.5) return "Alta (A)";
    if (pressure > 1.0) return "Média (M)";
    return "Mínima (P)";
  }
}
