export type ItemCategory = "janela" | "porta" | "guarda-corpo" | "pele-de-vidro";
export type GlassType = "monolithic" | "tempered" | "laminated";
export type SupportCondition = "pinned" | "fixed" | "free";

export interface Typology {
  id: string;
  name: string;
  category: ItemCategory;
  defaultSlsRatio: number; // e.g., 175 for L/175
  maxDeflectionLimit: number; // mm
}

export interface Profile {
  code: string;
  series: string;
  supplierId: string;
  weight: number; // kg/m
  ix: number; // cm^4
  wx: number; // cm^3
  mr?: number; // kNm
  categories: ItemCategory[]; // Compatible categories
}

export interface GlassOption {
  thickness: number;
  type: GlassType;
  admissibleStress: number; // MPa
}

export interface Supplier {
  id: string;
  name: string;
}

export interface RegionWind {
  name: string;
  v0: number; // m/s
}

export interface ConfigState {
  step: number;
  category: ItemCategory | "";
  typologyId: string;
  supplierId: string;
  height: number;
  width: number;
  supportTop: SupportCondition;
  supportBottom: SupportCondition;
  supportLeft: SupportCondition;
  supportRight: SupportCondition;
  region: string;
  windSpeed: number;
  s1: number;
  s2Category: number;
  s2Class: "A" | "B" | "C";
  s3: number;
  cp: number;
  modulusOfElasticity: number;
  allowableStress: number;
  glassType: "monolithic" | "tempered" | "laminated";
  glassThickness: number;
}

export interface CalculationMetrics {
  area: number;
  effectiveSpan: number;
  slenderness: number;
  vk: number;
  q: number;
  windPressure: number;
  totalLoad: number;
}

export interface EluResult {
  momentSoliciting: number;
  momentResistant: number;
  usageIndex: number;
  safetyMargin: number;
  passed: boolean;
}

export interface ElsResult {
  deflection: number;
  deflectionLimit: number;
  ratio: number;
  passed: boolean;
}

export interface GlassResult {
  stress: number;
  admissibleStress: number;
  passed: boolean;
}

export type SolutionRank = "minima" | "economica" | "ideal" | "performance" | "reprovada";

export interface Solution {
  id: string;
  profile: Profile;
  glass: GlassOption;
  elu: EluResult;
  els: ElsResult;
  glassResult: GlassResult;
  isApproved: boolean;
  rank: SolutionRank;
  score: number; // For ranking
}
