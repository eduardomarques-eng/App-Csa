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
  // For now, glassSupplierId is not used in filtering since we don't have supplier-specific glass catalogs,
  // but we keep it in the signature for future expansion.
  return GLASS_CATALOG.filter((g) => g.type === type);
};
