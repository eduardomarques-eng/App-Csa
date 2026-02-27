import { Profile, Supplier, Typology, RegionWind } from "./types";

export const BRAZIL_REGIONS: RegionWind[] = [
  { name: "Região I", v0: 30 },
  { name: "Região II", v0: 35 },
  { name: "Região III", v0: 40 },
  { name: "Região IV", v0: 45 },
  { name: "Região V", v0: 50 },
];

export const SUPPLIERS: Supplier[] = [
  { id: "hydro", name: "Hydro Alumínio" },
  { id: "perfil", name: "Perfil Alumínio" },
  { id: "alcoa", name: "Alcoa" },
  { id: "cba", name: "CBA" },
];

export const TYPOLOGIES: Typology[] = [
  {
    id: "jan-correr-2",
    name: "Janela de Correr (2 Folhas)",
    category: "janela",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "jan-correr-4",
    name: "Janela de Correr (4 Folhas)",
    category: "janela",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "jan-max-ar",
    name: "Janela Maxim-Ar",
    category: "janela",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 15,
  },
  {
    id: "porta-correr",
    name: "Porta de Correr",
    category: "porta",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "porta-giro",
    name: "Porta de Giro",
    category: "porta",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 15,
  },
  {
    id: "gc-parapeito",
    name: "Guarda-corpo Parapeito",
    category: "guarda-corpo",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "gc-gradil",
    name: "Guarda-corpo Gradil",
    category: "guarda-corpo",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "pv-grid",
    name: "Pele de Vidro (Grid)",
    category: "pele-de-vidro",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
  {
    id: "pv-unitizada",
    name: "Pele de Vidro (Unitizada)",
    category: "pele-de-vidro",
    defaultSlsRatio: 175,
    maxDeflectionLimit: 20,
  },
];

export const CATALOG: Profile[] = [
  // Hydro Profiles
  {
    code: "HY-4001",
    series: "Série 40",
    supplierId: "hydro",
    weight: 1.15,
    ix: 8.4,
    wx: 4.2,
  },
  {
    code: "HY-4002",
    series: "Série 40",
    supplierId: "hydro",
    weight: 1.45,
    ix: 15.6,
    wx: 7.8,
  },
  {
    code: "HY-5010",
    series: "Série 50",
    supplierId: "hydro",
    weight: 3.8,
    ix: 168.2,
    wx: 33.6,
  },
  {
    code: "HY-8025",
    series: "Série 80",
    supplierId: "hydro",
    weight: 9.2,
    ix: 2450.0,
    wx: 196.0,
  },

  // Perfil Alumínio Profiles
  {
    code: "PA-3501",
    series: "Série 35",
    supplierId: "perfil",
    weight: 0.95,
    ix: 5.2,
    wx: 2.8,
  },
  {
    code: "PA-3502",
    series: "Série 35",
    supplierId: "perfil",
    weight: 1.2,
    ix: 10.4,
    wx: 5.2,
  },
  {
    code: "PA-6020",
    series: "Série 60",
    supplierId: "perfil",
    weight: 6.8,
    ix: 1120.0,
    wx: 112.0,
  },

  // Alcoa Profiles
  {
    code: "AL-4080",
    series: "Série 40",
    supplierId: "alcoa",
    weight: 2.35,
    ix: 52.4,
    wx: 13.1,
  },
  {
    code: "AL-5015",
    series: "Série 50",
    supplierId: "alcoa",
    weight: 5.1,
    ix: 485.0,
    wx: 64.7,
  },
];
