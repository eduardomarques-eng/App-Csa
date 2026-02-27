import { ConfigState, Profile, GlassOption, Typology } from "../core/types";
import { CATALOG, GLASS_CATALOG, TYPOLOGIES } from "../core/constants";

export const getCompatibleTypologies = (category: string): Typology[] => {
  return TYPOLOGIES.filter((t) => t.category === category);
};

export const getCompatibleProfiles = (
  aluminumSupplierId: string,
  category: string,
): Profile[] => {
  return CATALOG.filter(
    (p) =>
      p.supplierId === aluminumSupplierId && p.categories.includes(category as any),
  );
};

export const getCompatibleGlasses = (glassSupplierId: string, type: string): GlassOption[] => {
  return GLASS_CATALOG.filter((g) => g.type === type && (!g.supplierId || g.supplierId === glassSupplierId));
};
