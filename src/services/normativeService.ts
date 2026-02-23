import { RegionWind } from "../core/types";
import { BRAZIL_REGIONS } from "../core/constants";

export const getRegionWindSpeed = (regionName: string): number => {
  const region = BRAZIL_REGIONS.find(r => r.name === regionName);
  return region ? region.v0 : 30; // Default 30 m/s
};
