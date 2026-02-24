import { Solution } from "../types";

export class RankingEngine {
  static rankSolutions(solutions: Solution[]): Solution[] {
    const approved = solutions.filter((s) => s.isApproved);
    const rejected = solutions
      .filter((s) => !s.isApproved)
      .map((s) => ({ ...s, rank: "reprovada" as const }));

    if (approved.length === 0) return rejected;

    // Sort by weight (proxy for cost)
    const sorted = [...approved].sort(
      (a, b) => a.profile.weight - b.profile.weight,
    );

    return (
      sorted.map((s, index) => {
        let rank: Solution["rank"] = "ideal";
        if (index === 0) rank = "economica";
        else if (index === sorted.length - 1) rank = "performance";
        else if (s.usageIndex > 70 && s.usageIndex < 90) rank = "ideal";

        return { ...s, rank };
      }) as Solution[]
    ).concat(rejected);
  }
}
