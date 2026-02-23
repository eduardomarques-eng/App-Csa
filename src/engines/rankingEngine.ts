import { Solution, SolutionRank } from "../core/types";

export const rankSolutions = (solutions: Solution[]): Solution[] => {
  const approved = solutions.filter(s => s.isApproved);
  const rejected = solutions.filter(s => !s.isApproved);

  // Score approved solutions based on weight (cost) and usage index (efficiency)
  approved.forEach(s => {
    // Lower weight is better, usage index closer to 90% is better (efficient)
    const weightScore = 1 / s.profile.weight;
    const efficiencyScore = 1 - Math.abs(0.9 - (s.elu.usageIndex / 100));
    s.score = (weightScore * 0.6) + (efficiencyScore * 0.4);
  });

  // Sort approved by score descending
  approved.sort((a, b) => b.score - a.score);

  // Assign ranks
  approved.forEach((s, index) => {
    let rank: SolutionRank = "ideal";
    if (index === 0) rank = "economica";
    else if (s.elu.usageIndex < 50 && s.els.ratio < 50) rank = "performance";
    else if (s.elu.usageIndex > 95 || s.els.ratio > 95) rank = "minima";
    
    s.rank = rank;
  });

  // Sort rejected by how close they are to passing
  rejected.sort((a, b) => Math.max(a.elu.usageIndex, a.els.ratio) - Math.max(b.elu.usageIndex, b.els.ratio));
  rejected.forEach(s => s.rank = "reprovada");

  return [...approved, ...rejected];
};
