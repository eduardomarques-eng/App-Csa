import { ConfigState, Profile, GlassOption, Typology } from "../core/types";
import { CATALOG, GLASS_CATALOG, TYPOLOGIES } from "../core/constants";

export const getCompatibleTypologies = (category: string): Typology[] => {
  return TYPOLOGIES.filter(t => t.category === category);
};

export const getCompatibleProfiles = (supplierId: string, category: string): Profile[] => {
  return CATALOG.filter(p => p.supplierId === supplierId && p.categories.includes(category as any));
};

export const getCompatibleGlasses = (type: string): GlassOption[] => {
  return GLASS_CATALOG.filter(g => g.type === type);
};
