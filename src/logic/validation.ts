import { ConfigState, ValidatedConfig } from "../core/types";

export const isFormularioValido = (state: ConfigState): boolean => {
  if (!state.category) return false;
  if (!state.typologyId) return false;
  if (!state.systemSupplierId) return false;
  if (!state.aluminumSupplierId) return false;
  if (!state.glassSupplierId) return false;

  if (state.height === "" || state.height <= 0 || isNaN(state.height))
    return false;
  if (state.width === "" || state.width <= 0 || isNaN(state.width))
    return false;
  if (state.buildingHeight === "" || state.buildingHeight <= 0 || isNaN(state.buildingHeight))
    return false;

  if (state.category === "guarda-corpo" || state.category === "pele-de-vidro") {
    const totalLength = Number(state.length || state.height);
    if (!totalLength || totalLength <= 0 || isNaN(totalLength))
      return false;
    if (
      state.intermediateSupports === "" ||
      state.intermediateSupports < 0 ||
      isNaN(state.intermediateSupports)
    )
      return false;

    if (state.intermediateSupports > 0) {
      // Validate spans sum equals length
      const totalSpans = state.spans.reduce((acc, val) => acc + val, 0);
      // Allow a small margin of error for floating point arithmetic
      if (isNaN(totalSpans) || Math.abs(totalSpans - totalLength) > 0.1) return false;
    }
  }

  if (state.buildingHeight > 90) {
    if (state.windTunnelPressure === "" || state.windTunnelPressure <= 0 || isNaN(state.windTunnelPressure))
      return false;
  } else {
    if (!state.region) return false;
    if (state.windSpeed === "" || state.windSpeed <= 0 || isNaN(state.windSpeed))
      return false;
  }

  return true;
};

export const getValidatedConfig = (
  state: ConfigState,
): ValidatedConfig | null => {
  if (!isFormularioValido(state)) return null;

  return {
    ...state,
    height: Number(state.height),
    width: Number(state.width),
    length: Number(state.length) || 0,
    intermediateSupports: Number(state.intermediateSupports) || 0,
    windSpeed: Number(state.windSpeed) || 0,
    glassThickness: Number(state.glassThickness) || 0,
    buildingHeight: Number(state.buildingHeight),
    windTunnelPressure: Number(state.windTunnelPressure) || 0,
  };
};
