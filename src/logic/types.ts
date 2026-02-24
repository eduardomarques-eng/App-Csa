export type GlassType = "monolithic" | "tempered" | "laminated";
export type ItemCategory =
  | "janela"
  | "porta"
  | "guarda-corpo"
  | "pele-de-vidro";

export interface Typology {
  id: string;
  name: string;
  category: ItemCategory;
  defaultSlsRatio: number; // e.g., 175 for L/175
  maxDeflectionLimit: number; // mm, e.g., 20mm
}

export interface Profile {
  code: string;
  series: string;
  supplierId: string;
  weight: number; // kg/m
  ix: number; // cm^4
  wx: number; // cm^3
  mr?: number; // kNm (Resistant Moment - calculated or provided)
}

export interface Supplier {
  id: string;
  name: string;
  logo?: string;
}

export interface RegionWind {
  name: string;
  v0: number; // m/s
}

export type SupportCondition = "pinned" | "fixed" | "free";

export interface CalcInputs {
  category: ItemCategory | "";
  typologyId: string;
  supplierId: string;
  height: number; // mm
  width: number; // mm
  supportTop: SupportCondition;
  supportBottom: SupportCondition;
  supportLeft: SupportCondition;
  supportRight: SupportCondition;
  windSpeed: number; // m/s (V0)
  region: string;
  s1: number;
  s2Category: number;
  s2Class: "A" | "B" | "C";
  s3: number;
  cp: number;
  glassType: GlassType;
  glassThickness: number; // mm
  modulusOfElasticity: number; // GPa
  allowableStress: number; // MPa
}

export interface Solution {
  id: string;
  profile: Profile;
  glassThickness: number;
  glassType: GlassType;
  ixReq: number;
  wxReq: number;
  deflection: number;
  deflectionLimit: number;
  momentSoliciting: number;
  momentResistant: number;
  usageIndex: number; // %
  safetyMargin: number; // %
  eluPassed: boolean;
  elsPassed: boolean;
  isApproved: boolean;
  rank: "economica" | "ideal" | "performance" | "reprovada";
}

export interface CalcResults {
  vk: number;
  q: number;
  windPressure: number;
  solutions: Solution[];
  bestSolution: Solution | null;
  performanceClass: string;
}
