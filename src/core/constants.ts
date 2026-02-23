import { Supplier, RegionWind, Typology, Profile, GlassOption } from "./types";

export const BRAZIL_REGIONS: RegionWind[] = [
  { name: "Região I (Sul/Sudeste)", v0: 45 },
  { name: "Região II (Centro-Oeste)", v0: 40 },
  { name: "Região III (Nordeste)", v0: 35 },
  { name: "Região IV (Norte)", v0: 30 },
  { name: "Região V (Extremo Sul)", v0: 50 },
];

export const SUPPLIERS: Supplier[] = [
  { id: "sup-01", name: "Alcoa / Hydro" },
  { id: "sup-02", name: "CBA" },
  { id: "sup-03", name: "Alumasa" },
  { id: "sup-04", name: "Perfileve" },
];

export const TYPOLOGIES: Typology[] = [
  { id: "jan-correr", name: "Janela de Correr", category: "janela", defaultSlsRatio: 175, maxDeflectionLimit: 15 },
  { id: "jan-max", name: "Janela Maxim-ar", category: "janela", defaultSlsRatio: 175, maxDeflectionLimit: 15 },
  { id: "por-correr", name: "Porta de Correr", category: "porta", defaultSlsRatio: 175, maxDeflectionLimit: 20 },
  { id: "por-giro", name: "Porta de Giro", category: "porta", defaultSlsRatio: 175, maxDeflectionLimit: 20 },
  { id: "gc-torre", name: "Guarda-corpo Torre", category: "guarda-corpo", defaultSlsRatio: 175, maxDeflectionLimit: 10 },
  { id: "gc-perfil", name: "Guarda-corpo Perfil Contínuo", category: "guarda-corpo", defaultSlsRatio: 175, maxDeflectionLimit: 10 },
  { id: "pv-stick", name: "Pele de Vidro Stick", category: "pele-de-vidro", defaultSlsRatio: 250, maxDeflectionLimit: 20 },
  { id: "pv-unit", name: "Pele de Vidro Unitizada", category: "pele-de-vidro", defaultSlsRatio: 250, maxDeflectionLimit: 20 },
];

export const CATALOG: Profile[] = [
  // Hydro
  { code: "SU-200", series: "Suprema", supplierId: "sup-01", weight: 0.85, ix: 12.5, wx: 4.2, categories: ["janela", "porta"] },
  { code: "SU-201", series: "Suprema", supplierId: "sup-01", weight: 1.10, ix: 18.2, wx: 6.1, categories: ["janela", "porta"] },
  { code: "SU-202", series: "Suprema", supplierId: "sup-01", weight: 1.45, ix: 25.4, wx: 8.5, categories: ["janela", "porta"] },
  { code: "MA-300", series: "Master", supplierId: "sup-01", weight: 1.20, ix: 22.0, wx: 7.5, categories: ["janela", "porta"] },
  { code: "MA-301", series: "Master", supplierId: "sup-01", weight: 1.65, ix: 35.5, wx: 12.0, categories: ["janela", "porta"] },
  { code: "CG-001", series: "CG", supplierId: "sup-01", weight: 2.50, ix: 50.0, wx: 15.0, categories: ["guarda-corpo"] },
  { code: "PV-100", series: "Ecovida", supplierId: "sup-01", weight: 3.20, ix: 120.0, wx: 35.0, categories: ["pele-de-vidro"] },
  { code: "PV-101", series: "Ecovida", supplierId: "sup-01", weight: 4.50, ix: 180.0, wx: 50.0, categories: ["pele-de-vidro"] },
  // CBA
  { code: "CB-25", series: "Linha 25", supplierId: "sup-02", weight: 0.90, ix: 14.0, wx: 4.8, categories: ["janela", "porta"] },
  { code: "CB-30", series: "Linha 30", supplierId: "sup-02", weight: 1.30, ix: 24.0, wx: 8.0, categories: ["janela", "porta"] },
  { code: "CB-42", series: "Linha 42", supplierId: "sup-02", weight: 1.80, ix: 40.0, wx: 14.0, categories: ["janela", "porta"] },
  { code: "CB-GC", series: "Linha GC", supplierId: "sup-02", weight: 2.80, ix: 55.0, wx: 18.0, categories: ["guarda-corpo"] },
  { code: "CB-PV", series: "Linha PV", supplierId: "sup-02", weight: 3.50, ix: 130.0, wx: 40.0, categories: ["pele-de-vidro"] },
];

export const GLASS_CATALOG: GlassOption[] = [
  { thickness: 4, type: "monolithic", admissibleStress: 15 },
  { thickness: 6, type: "monolithic", admissibleStress: 15 },
  { thickness: 8, type: "monolithic", admissibleStress: 15 },
  { thickness: 10, type: "monolithic", admissibleStress: 15 },
  { thickness: 6, type: "tempered", admissibleStress: 40 },
  { thickness: 8, type: "tempered", admissibleStress: 40 },
  { thickness: 10, type: "tempered", admissibleStress: 40 },
  { thickness: 12, type: "tempered", admissibleStress: 40 },
  { thickness: 6, type: "laminated", admissibleStress: 15 },
  { thickness: 8, type: "laminated", admissibleStress: 15 },
  { thickness: 10, type: "laminated", admissibleStress: 15 },
  { thickness: 12, type: "laminated", admissibleStress: 15 },
  { thickness: 16, type: "laminated", admissibleStress: 15 },
  { thickness: 20, type: "laminated", admissibleStress: 15 },
];
