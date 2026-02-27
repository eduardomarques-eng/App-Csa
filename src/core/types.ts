export type ItemCategory =
  | "janela"
  | "porta"
  | "guarda-corpo"
  | "pele-de-vidro";
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
  id: string;
  thickness: number;
  type: GlassType;
  admissibleStress: number; // MPa
  supplierId?: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface RegionWind {
  name: string;
  v0: number; // m/s
}

export type SystemType = "biapoiada" | "engaste-engaste" | "engaste-livre" | "biapoiada-1-apoio" | "biapoiada-2-apoios";

export interface ConfigState {
  step: number;
  category: ItemCategory | "";
  typologyId: string;
  systemSupplierId: string;
  aluminumSupplierId: string;
  glassSupplierId: string;
  profileId: string;
  glassId: string;
  height: number | "";
  width: number | "";
  length: number | ""; // Comprimento total (para guarda-corpo/pele de vidro)
  systemType: SystemType;
  intermediateSupports: number | "";
  spans: number[]; // Distâncias entre apoios
  supportTop: SupportCondition;
  supportBottom: SupportCondition;
  supportLeft: SupportCondition;
  supportRight: SupportCondition;
  intermediateSupport1Type: SupportCondition;
  intermediateSupport2Type: SupportCondition;
  buildingHeight: number | "";
  windTunnelPressure: number | "";
  region: string;
  windSpeed: number | "";
  s1: number;
  s2Category: number;
  s2Class: "A" | "B" | "C";
  s3: number;
  cp: number;
  modulusOfElasticity: number;
  allowableStress: number;
  glassType: "monolithic" | "tempered" | "laminated";
  glassThickness: number | "";
  autoOptimize: boolean;
  compareSuppliers: boolean;
}

export interface ValidatedConfig extends Omit<
  ConfigState,
  | "height"
  | "width"
  | "length"
  | "intermediateSupports"
  | "windSpeed"
  | "glassThickness"
  | "buildingHeight"
  | "windTunnelPressure"
> {
  height: number;
  width: number;
  length: number;
  intermediateSupports: number;
  windSpeed: number;
  glassThickness: number;
  buildingHeight: number;
  windTunnelPressure: number;
}

export interface CalculationMetrics {
  area: number;
  effectiveSpan: number;
  slenderness: number;
  vk: number;
  q: number;
  windPressure: number;
  totalLoad: number;
  structuralSystem: "Biapoiado" | "Engastado" | "Consola" | "Contínuo" | "Engastado-Apoiado";
  windMethod: "NBR 6123" | "Túnel de Vento";
  spans?: number[];
  intermediateSupports?: number;
  intermediateSupportTypes?: SupportCondition[];
}

export type StatusClassificacao = "APROVADO_CONFORTO" | "APROVADO_LIMITE" | "CRITICO" | "REPROVADO";

export interface VerificationResult {
  valorCalculado: number;
  limiteNormativo: number;
  percentualUtilizado: number;
  margemSeguranca: number;
  classificacao: StatusClassificacao;
  recomendacaoTecnica: string;
}

export interface EluResult {
  momentSoliciting: number;
  momentResistant: number;
  shearSoliciting: number; // Esforço cortante
  shearResistant: number; // Esforço cortante resistente
  usageIndex: number;
  safetyMargin: number;
  passed: boolean;
  verification: VerificationResult;
}

export interface ElsResult {
  deflection: number;
  deflectionLimit: number;
  ratio: number;
  passed: boolean;
  verification: VerificationResult;
}

export interface GlassResult {
  stress: number;
  admissibleStress: number;
  passed: boolean;
  verification: VerificationResult;
}

export type SolutionRank =
  | "minima"
  | "economica"
  | "ideal"
  | "performance"
  | "reprovada";

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
  efficiencyIndex: number; // %
  deflectionEfficiency: number; // %
  globalEfficiency: number; // %
  efficiencyClass: "Alta" | "Média" | "Superdimensionado" | "Reprovado";
}
