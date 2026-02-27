import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ConfigState, ItemCategory, SupportCondition, SystemType } from "../core/types";
import { SUPPLIERS, GLASS_SUPPLIERS, BRAZIL_REGIONS } from "../core/constants";

type Action =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_CATEGORY"; payload: ItemCategory }
  | { type: "SET_TYPOLOGY"; payload: string }
  | { type: "SET_SYSTEM_SUPPLIER"; payload: string }
  | { type: "SET_ALUMINUM_SUPPLIER"; payload: string }
  | { type: "SET_GLASS_SUPPLIER"; payload: string }
  | { type: "SET_PROFILE"; payload: string }
  | { type: "SET_GLASS"; payload: string }
  | {
      type: "SET_GEOMETRY";
      payload: {
        height: number | "";
        width: number | "";
        length: number | "";
        systemType: SystemType;
        intermediateSupports: number | "";
        spans: number[];
        supportTop: SupportCondition;
        supportBottom: SupportCondition;
        supportLeft: SupportCondition;
        supportRight: SupportCondition;
        intermediateSupport1Type: SupportCondition;
        intermediateSupport2Type: SupportCondition;
        buildingHeight: number | "";
      };
    }
  | {
      type: "SET_WIND";
      payload: {
        region: string;
        windSpeed: number | "";
        windTunnelPressure: number | "";
        s1: number;
        s2Category: number;
        s2Class: "A" | "B" | "C";
        s3: number;
        cp: number;
      };
    }
  | {
      type: "SET_MATERIALS";
      payload: {
        glassType: "monolithic" | "tempered" | "laminated";
        glassThickness: number | "";
      };
    }
  | { type: "TOGGLE_AUTO_OPTIMIZE" }
  | { type: "TOGGLE_COMPARE_SUPPLIERS" }
  | { type: "RESET" };

const initialState: ConfigState = {
  step: 1,
  category: "",
  typologyId: "",
  systemSupplierId: SUPPLIERS[0].id,
  aluminumSupplierId: SUPPLIERS[0].id,
  glassSupplierId: GLASS_SUPPLIERS[0].id,
  profileId: "",
  glassId: "",
  height: "",
  width: "",
  length: "",
  systemType: "biapoiada",
  intermediateSupports: "",
  spans: [],
  supportTop: "pinned",
  supportBottom: "pinned",
  supportLeft: "pinned",
  supportRight: "pinned",
  intermediateSupport1Type: "pinned",
  intermediateSupport2Type: "pinned",
  buildingHeight: "",
  windTunnelPressure: "",
  region: "",
  windSpeed: "",
  s1: 1.0,
  s2Category: 4,
  s2Class: "B",
  s3: 1.0,
  cp: -0.7,
  modulusOfElasticity: 70,
  allowableStress: 80,
  glassType: "laminated",
  glassThickness: "",
  autoOptimize: false,
  compareSuppliers: false,
};

const reducer = (state: ConfigState, action: Action): ConfigState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload, typologyId: "", profileId: "", step: 2 };
    case "SET_TYPOLOGY":
      return { ...state, typologyId: action.payload, step: 3 };
    case "SET_SYSTEM_SUPPLIER":
      return { ...state, systemSupplierId: action.payload, profileId: "", step: 4 };
    case "SET_ALUMINUM_SUPPLIER":
      return { ...state, aluminumSupplierId: action.payload, profileId: "" };
    case "SET_GLASS_SUPPLIER":
      return { ...state, glassSupplierId: action.payload, glassId: "" };
    case "SET_PROFILE":
      return { ...state, profileId: action.payload };
    case "SET_GLASS":
      return { ...state, glassId: action.payload };
    case "SET_GEOMETRY":
      return { ...state, ...action.payload, step: 5 };
    case "SET_WIND":
      return { ...state, ...action.payload };
    case "SET_MATERIALS":
      return { ...state, ...action.payload };
    case "TOGGLE_AUTO_OPTIMIZE":
      return { ...state, autoOptimize: !state.autoOptimize, profileId: !state.autoOptimize ? "" : state.profileId, glassId: !state.autoOptimize ? "" : state.glassId };
    case "TOGGLE_COMPARE_SUPPLIERS":
      return { ...state, compareSuppliers: !state.compareSuppliers, profileId: !state.compareSuppliers ? "" : state.profileId, glassId: !state.compareSuppliers ? "" : state.glassId };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const ConfiguratorContext = createContext<{
  state: ConfigState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const ConfiguratorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ConfiguratorContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfiguratorContext.Provider>
  );
};

export const useConfigurator = () => useContext(ConfiguratorContext);
