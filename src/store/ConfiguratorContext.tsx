import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ConfigState, ItemCategory, SupportCondition } from "../core/types";
import { SUPPLIERS, BRAZIL_REGIONS } from "../core/constants";

type Action =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_CATEGORY"; payload: ItemCategory }
  | { type: "SET_TYPOLOGY"; payload: string }
  | { type: "SET_SUPPLIER"; payload: string }
  | { type: "SET_GEOMETRY"; payload: { height: number; width: number; supportTop: SupportCondition; supportBottom: SupportCondition; supportLeft: SupportCondition; supportRight: SupportCondition } }
  | { type: "SET_WIND"; payload: { region: string; windSpeed: number; s1: number; s2Category: number; s2Class: "A" | "B" | "C"; s3: number; cp: number } }
  | { type: "SET_MATERIALS"; payload: { glassType: "monolithic" | "tempered" | "laminated"; glassThickness: number } }
  | { type: "RESET" };

const initialState: ConfigState = {
  step: 1,
  category: "",
  typologyId: "",
  supplierId: SUPPLIERS[0].id,
  height: 2500,
  width: 1000,
  supportTop: "pinned",
  supportBottom: "pinned",
  supportLeft: "pinned",
  supportRight: "pinned",
  region: BRAZIL_REGIONS[1].name,
  windSpeed: BRAZIL_REGIONS[1].v0,
  s1: 1.0,
  s2Category: 4,
  s2Class: "B",
  s3: 1.0,
  cp: -0.7,
  modulusOfElasticity: 70,
  allowableStress: 80,
  glassType: "laminated",
  glassThickness: 10,
};

const reducer = (state: ConfigState, action: Action): ConfigState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload, typologyId: "", step: 2 };
    case "SET_TYPOLOGY":
      return { ...state, typologyId: action.payload, step: 3 };
    case "SET_SUPPLIER":
      return { ...state, supplierId: action.payload, step: 4 };
    case "SET_GEOMETRY":
      return { ...state, ...action.payload, step: 5 };
    case "SET_WIND":
      return { ...state, ...action.payload };
    case "SET_MATERIALS":
      return { ...state, ...action.payload };
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
