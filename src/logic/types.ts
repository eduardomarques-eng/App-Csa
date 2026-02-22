export type GlassType = "monolithic" | "tempered" | "laminated";
export type ItemType = "guarda-corpo" | "pele-de-vidro" | "janela" | "porta";
export type SupportType = "bi-apoiado" | "engastado-apoiado" | "bi-engastado" | "balanco";

export interface Profile {
  code: string;
  weight: number; // kg/m
  ix: number; // cm^4
  wx: number; // cm^3
}

export interface Supplier {
  id: string;
  name: string;
}

export interface RegionWind {
  name: string;
  v0: number; // m/s
}

export type CalculationMode = "standard" | "railing";
export type SupportCondition = "pinned" | "fixed" | "free";

export interface CalcInputs {
  item: ItemType;
  calculationMode: CalculationMode;
  typology: string;
  profileSeries: string;
  aluminumSupplier: string;
  glassSupplier: string;
  region: string;
  height: number; // mm (Total height)
  width: number; // mm (Influence width)
  
  // New Multi-Point Support Model
  supports: SupportCondition[]; // Array of 2 or 4 supports
  spanDistances: number[]; // Distances between supports (mm)
  
  supportOffset: number; // mm (Offset from start/end)
  windSpeed: number; // m/s (V0)
  s1: number;
  s2Category: number; // 1 to 5
  s2Class: "A" | "B" | "C";
  s3: number;
  cp: number;
  glassType: GlassType;
  glassThickness: number; // mm
  modulusOfElasticity: number; // GPa
  allowableStress: number; // MPa
}

export interface CalcResults {
  vk: number; // m/s
  q: number; // kN/m^2 (Dynamic pressure)
  windPressure: number; // kN/m^2 (Design pressure)
  totalLoad: number; // kN/m
  maxMoment: number; // kNm
  maxDeflection: number; // mm
  requiredIx: number; // cm^4
  requiredWx: number; // cm^3
  glassStress: number; // MPa
  glassDeflection: number; // mm
  glassAlpha: number; // NBR 7199 alpha
  momentCoefficient: number; // e.g., 1/8 = 0.125
  deflectionCoefficient: number; // e.g., 5/384
  selectedProfile: Profile | null;
  slsPassed: boolean;
  ulsPassed: boolean;
  glassPassed: boolean;
  performanceClass: string;
  glassSpecification: string;
  profileSpecification: string;
}
