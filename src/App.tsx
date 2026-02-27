import { useState, useEffect, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  Wind,
  Maximize2,
  Layers,
  Download,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
  Building2,
  Box,
  ChevronLeft,
  ShieldCheck,
  FileText,
  Settings,
} from "lucide-react";

import {
  ConfiguratorProvider,
  useConfigurator,
} from "./store/ConfiguratorContext";
import { runStructuralEngine } from "./engines/structuralEngine";
import { runComparison, ComparisonResult } from "./services/comparisonService";
import {
  getCompatibleTypologies,
  getCompatibleProfiles,
  getCompatibleGlasses,
} from "./services/catalogService";
import { getRegionWindSpeed } from "./services/normativeService";
import { generatePDF } from "./logic/pdfGenerator";
import { isFormularioValido, getValidatedConfig } from "./logic/validation";
import { BRAZIL_REGIONS, SUPPLIERS, GLASS_SUPPLIERS, TYPOLOGIES } from "./core/constants";
import {
  Solution,
  CalculationMetrics,
  ItemCategory,
  SupportCondition,
} from "./core/types";
import { MapaIsopletas } from "./components/MapaIsopletas";
import { SmartInputGroup } from "./components/SmartInputGroup";
import { SmartSelectGroup } from "./components/SmartSelectGroup";
import { DetailedDiagrams } from "./components/DetailedDiagrams";
import { CalculationMemory } from "./components/CalculationMemory";

// --- UI Components ---

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase opacity-40 tracking-widest">
        {label}
      </span>
      <span className="text-xs font-black uppercase tracking-tighter">
        {value}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="border border-[#006874] bg-white p-6">
      <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tighter">{value}</span>
        <span className="text-xs font-bold opacity-40">{unit}</span>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  unit,
  subtext,
}: {
  label: string;
  value: string;
  unit: string;
  subtext?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase opacity-40 tracking-widest">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-black">{value}</span>
        <span className="text-[8px] font-bold opacity-40">{unit}</span>
      </div>
      {subtext && <p className="text-[8px] font-mono opacity-30">{subtext}</p>}
    </div>
  );
}

function StepContainer({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  key?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border border-[#006874] flex items-center justify-center bg-[#F9F9F7]">
          {icon}
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  key?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-6 border transition-all text-left flex flex-col justify-between h-32 ${
        active
          ? "bg-[#006874] border-[#006874] text-white"
          : "bg-white border-[#D1D1D1] hover:border-[#006874]"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
      <ArrowRight size={16} className={active ? "text-white" : "opacity-20"} />
    </button>
  );
}

function SelectionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  key?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border text-left text-[10px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${
        active
          ? "bg-[#006874] border-[#006874] text-white"
          : "bg-white border-[#D1D1D1] hover:border-[#006874]"
      }`}
    >
      {label}
      {active && <CheckCircle2 size={14} />}
    </button>
  );
}

function SolutionCard({ solution, onViewDetails }: { solution: Solution; key?: string; onViewDetails?: () => void }) {
  const rankColors = {
    minima: "bg-gray-100 text-gray-800 border-gray-200",
    economica: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ideal: "bg-blue-100 text-blue-800 border-blue-200",
    performance: "bg-purple-100 text-purple-800 border-purple-200",
    reprovada: "bg-red-100 text-red-800 border-red-200",
  };

  const rankLabels = {
    minima: "Mínima Normativa",
    economica: "Mais Econômica",
    ideal: "Equilíbrio Ideal",
    performance: "Alta Performance",
    reprovada: "Reprovada",
  };

  return (
    <div
      className={`border border-[#006874] bg-white p-6 relative overflow-hidden transition-all hover:shadow-lg ${!solution.isApproved ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[8px] font-black uppercase px-2 py-1 border ${rankColors[solution.rank]}`}
            >
              {rankLabels[solution.rank]}
            </span>
            {solution.elu.verification.classificacao === "APROVADO_CONFORTO" ? (
              <span className="flex items-center gap-1 text-emerald-600 text-[8px] font-black uppercase">
                <ShieldCheck size={12} />
                Aprovado com Conforto
              </span>
            ) : solution.elu.verification.classificacao === "APROVADO_LIMITE" ? (
              <span className="flex items-center gap-1 text-yellow-600 text-[8px] font-black uppercase">
                <ShieldCheck size={12} />
                Aprovado no Limite
              </span>
            ) : solution.elu.verification.classificacao === "CRITICO" ? (
              <span className="flex items-center gap-1 text-orange-600 text-[8px] font-black uppercase">
                <AlertCircle size={12} />
                Crítico / Limite Normativo
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-[8px] font-black uppercase">
                <AlertCircle size={12} />
                Reprovado
              </span>
            )}
            {solution.efficiencyClass && (
              <span className={`text-[8px] font-black uppercase px-2 py-1 border ${
                solution.efficiencyClass === "Alta" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                solution.efficiencyClass === "Média" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                solution.efficiencyClass === "Superdimensionado" ? "bg-blue-100 text-blue-800 border-blue-200" :
                "bg-red-100 text-red-800 border-red-200"
              }`}>
                {solution.efficiencyClass} ({solution.globalEfficiency.toFixed(1)}%)
              </span>
            )}
          </div>
          <h4 className="text-lg font-black uppercase tracking-tighter">
            {solution.profile.code}
          </h4>
          <p className="text-[10px] font-bold uppercase opacity-40">
            {solution.profile.series} • Vidro {solution.glass.thickness}mm{" "}
            {solution.glass.type}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[9px] font-bold uppercase opacity-40 mb-1">
            Índice de Uso (ELU)
          </p>
          <p
            className={`text-2xl font-black tracking-tighter ${solution.elu.usageIndex > 90 ? "text-red-600" : "text-[#006874]"}`}
          >
            {solution.elu.usageIndex.toFixed(1)}%
          </p>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="mt-2 text-[9px] font-bold uppercase tracking-widest text-[#006874] hover:underline flex items-center gap-1"
            >
              Ver Detalhes <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <MiniStat
          label="Inércia (Ix)"
          value={`${solution.profile.ix.toFixed(1)}`}
          unit="cm⁴"
        />
        <MiniStat
          label="Módulo (Wx)"
          value={`${solution.profile.wx.toFixed(1)}`}
          unit="cm³"
        />
        <MiniStat
          label="Flecha (ELS)"
          value={`${solution.els.deflection.toFixed(2)}`}
          unit="mm"
          subtext={`Lim: ${solution.els.deflectionLimit.toFixed(2)}`}
        />
        <MiniStat
          label="Momento (ELU)"
          value={`${solution.elu.momentSoliciting.toFixed(2)}`}
          unit="kNm"
          subtext={`Res: ${solution.elu.momentResistant.toFixed(2)}`}
        />
        <MiniStat
          label="Cortante (Vd)"
          value={`${solution.elu.shearSoliciting.toFixed(2)}`}
          unit="kN"
          subtext={`Res: ${solution.elu.shearResistant.toFixed(2)}`}
        />
        <MiniStat
          label="Tensão Vidro"
          value={`${solution.glassResult.stress.toFixed(1)}`}
          unit="MPa"
          subtext={`Adm: ${solution.glassResult.admissibleStress.toFixed(1)}`}
        />
        <MiniStat
          label="Peso"
          value={`${solution.profile.weight.toFixed(2)}`}
          unit="kg/m"
        />
        <MiniStat
          label="Uso Vidro"
          value={`${((solution.glassResult.stress / solution.glassResult.admissibleStress) * 100).toFixed(1)}`}
          unit="%"
        />
      </div>

      <div className="mt-4 p-3 bg-[#F9F9F7] border border-[#006874]/10 text-[10px] font-bold uppercase opacity-60">
        <p>Recomendação Técnica: {solution.elu.verification.recomendacaoTecnica}</p>
      </div>

      {/* Progress Bar for Usage */}
      <div className="mt-4 h-1 bg-[#E4E3E0] relative">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
            solution.elu.verification.classificacao === "REPROVADO" ? "bg-red-600" :
            solution.elu.verification.classificacao === "CRITICO" ? "bg-orange-500" :
            solution.elu.verification.classificacao === "APROVADO_LIMITE" ? "bg-yellow-500" :
            "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(solution.elu.usageIndex, 100)}%` }}
        />
      </div>
    </div>
  );
}

// --- Main Application ---

function ConfiguratorApp() {
  const { state, dispatch } = useConfigurator();
  const [results, setResults] = useState<{
    metrics: CalculationMetrics;
    solutions: Solution[];
  } | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[] | null>(null);
  const [status, setStatus] = useState<string>("Aguardando preenchimento...");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [isCustomCp, setIsCustomCp] = useState(false);

  const handleLengthChange = (field: "length" | "height", value: number | "") => {
    const newState = { ...state, [field]: value };
    const totalLength = Number(newState.length || newState.height);
    
    if (state.intermediateSupports && state.intermediateSupports > 0) {
      const currentSpansSum = state.spans.reduce((a, b) => a + b, 0);
      if (Math.abs(currentSpansSum - totalLength) > 0.1) {
        if (state.intermediateSupports === 1) {
          newState.spans = [totalLength / 2, totalLength / 2];
        } else if (state.intermediateSupports === 2) {
          newState.spans = [totalLength / 3, totalLength / 3, totalLength / 3];
        }
      }
    }
    
    dispatch({ type: "SET_GEOMETRY", payload: newState });
  };

  useEffect(() => {
    const predefinedCps = [-1.4, -1.0, 1.0, -2.0, -0.7];
    if (!predefinedCps.includes(state.cp) && !isCustomCp) {
      setIsCustomCp(true);
    }
  }, [state.cp]);

  const filteredTypologies = useMemo(
    () => getCompatibleTypologies(state.category),
    [state.category],
  );
  const filteredProfiles = useMemo(
    () => getCompatibleProfiles(state.systemSupplierId, state.category),
    [state.systemSupplierId, state.category],
  );
  const filteredGlasses = useMemo(
    () => getCompatibleGlasses(state.glassSupplierId, state.glassType),
    [state.glassSupplierId, state.glassType],
  );

  useEffect(() => {
    const validatedConfig = getValidatedConfig(state);

    if (validatedConfig) {
      setStatus("Calculando...");
      const timer = setTimeout(() => {
        const typology = TYPOLOGIES.find(
          (t) => t.id === validatedConfig.typologyId,
        );
        
        if (typology) {
          if (state.compareSuppliers) {
            // Run comparison
            const compRes = runComparison(
              validatedConfig,
              SUPPLIERS,
              filteredProfiles, // This is not used correctly in comparisonService, we'll fix it
              filteredGlasses,
              typology
            );
            setComparisonResults(compRes);
            
            // Also run normal engine for the first supplier to get metrics
            const res = runStructuralEngine(
              validatedConfig,
              getCompatibleProfiles(SUPPLIERS[0].id, state.category),
              filteredGlasses,
              typology
            );
            setResults(res);
            setStatus("Comparação concluída");
          } else {
            setComparisonResults(null);
            const profilesToTest = state.profileId && !state.autoOptimize
              ? filteredProfiles.filter(p => p.code === state.profileId)
              : filteredProfiles;
              
            const glassesToTest = state.glassId && !state.autoOptimize
              ? filteredGlasses.filter(g => g.id === state.glassId)
              : filteredGlasses;

            const res = runStructuralEngine(
              validatedConfig,
              profilesToTest,
              glassesToTest,
              typology,
            );
            setResults(res);
            if (res.solutions.length > 0) {
              const best = res.solutions.find(s => s.isApproved) || res.solutions[0];
              setSelectedSolutionId(best.id);
            } else {
              setSelectedSolutionId(null);
            }
            setStatus(
              res.solutions.length > 0 && res.solutions[0].isApproved
                ? "Solução aprovada"
                : "Solução reprovada",
            );
          }
        }
      }, 300); // Debounce
      return () => clearTimeout(timer);
    } else {
      setResults(null);
      setStatus("Preencha todos os campos obrigatórios (*)");
    }
  }, [state, filteredProfiles, filteredGlasses]);

  const nextStep = () =>
    dispatch({ type: "SET_STEP", payload: Math.min(state.step + 1, 6) });
  const prevStep = () =>
    dispatch({ type: "SET_STEP", payload: Math.max(state.step - 1, 1) });

  const handleExportPDF = () => {
    if (results && results.solutions.length > 0) {
      generatePDF(state, {
        vk: results.metrics.vk,
        q: results.metrics.q,
        windPressure: results.metrics.windPressure,
        performanceClass: "Classe B", // Mock
        maxMoment: results.solutions[0].elu.momentSoliciting || 0,
        momentCoefficient: 8,
        deflectionCoefficient: 5 / 384,
        requiredIx: results.solutions[0].profile.ix || 0,
        requiredWx: results.solutions[0].profile.wx || 0,
        glassStress: results.solutions[0].glassResult.stress || 0,
        glassAlpha: 0.5,
        slsPassed: results.solutions[0].els.passed || false,
        ulsPassed: results.solutions[0].elu.passed || false,
        glassPassed: results.solutions[0].glassResult.passed || false,
        glassSpecification: `${results.solutions[0].glass.thickness}mm ${results.solutions[0].glass.type}`,
        totalLoad: results.metrics.totalLoad,
        solutions: results.solutions,
        bestSolution: results.solutions[0],
        effectiveSpan: results.metrics.effectiveSpan,
        area: results.metrics.area,
        structuralSystem: results.metrics.structuralSystem,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#006874] font-sans selection:bg-[#086775] selection:text-white">
      <header className="border-b border-[#006874] bg-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#006874] flex items-center justify-center">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter leading-none">
                CSA CalcPro
              </h1>
              <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">
                Dimensionamento Estrutural
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <HeaderStat label="Status" value={status} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: "RESET" })}
                className="border border-[#006874] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[#E4E3E0]"
              >
                Reset
              </button>
              <button
                onClick={() => setShowReportPreview(!showReportPreview)}
                disabled={!results}
                className={`border border-[#006874] px-4 py-2 text-[10px] font-bold uppercase transition-colors disabled:opacity-20 ${showReportPreview ? "bg-[#006874] text-white" : "hover:bg-[#E4E3E0]"}`}
              >
                {showReportPreview ? "Ocultar Pré-visualização" : "Pré-visualizar Relatório"}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!results || !showReportPreview}
                className="bg-[#006874] text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-[#086775] disabled:opacity-20 flex items-center gap-2"
              >
                <Download size={14} /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[450px_1fr] min-h-[calc(100vh-73px)]">
        {/* Left Column: Guided Workflow */}
        <aside className="bg-white border-r border-[#006874] flex flex-col overflow-y-auto">
          <div className="p-8 space-y-10">
            {/* Section 1: Identificação */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-[#006874] pb-2">
                <LayoutGrid size={16} /> 1. Identificação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["janela", "porta", "guarda-corpo", "pele-de-vidro"].map(
                  (cat) => (
                    <CategoryButton
                      key={cat}
                      active={state.category === cat}
                      label={cat}
                      onClick={() =>
                        dispatch({
                          type: "SET_CATEGORY",
                          payload: cat as ItemCategory,
                        })
                      }
                    />
                  ),
                )}
              </div>

              {state.category && (
                <div className="space-y-3 pt-4">
                  <label className="text-[9px] font-bold uppercase opacity-50 flex items-center gap-1">
                    Tipologia <span className="text-red-500">*</span>
                  </label>
                  {filteredTypologies.map((t) => (
                    <SelectionButton
                      key={t.id}
                      active={state.typologyId === t.id}
                      label={t.name}
                      onClick={() =>
                        dispatch({ type: "SET_TYPOLOGY", payload: t.id })
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Especificação Técnica */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#006874] pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Settings size={16} /> 2. Especificação Técnica
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_COMPARE_SUPPLIERS" })}
                    className={`text-[9px] font-bold uppercase px-2 py-1 border border-[#006874] transition-colors ${state.compareSuppliers ? "bg-[#006874] text-white" : "hover:bg-[#E4E3E0]"}`}
                  >
                    Comparar Sistemistas
                  </button>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_AUTO_OPTIMIZE" })}
                    className={`text-[9px] font-bold uppercase px-2 py-1 border border-[#006874] transition-colors ${state.autoOptimize ? "bg-[#006874] text-white" : "hover:bg-[#E4E3E0]"}`}
                  >
                    Otimização Automática
                  </button>
                </div>
              </div>

              {state.typologyId && !state.compareSuppliers && (
                <SmartSelectGroup
                  label="Sistemista"
                  value={state.systemSupplierId}
                  onChange={(v) => dispatch({ type: "SET_SYSTEM_SUPPLIER", payload: v })}
                  options={SUPPLIERS.map(s => ({ value: s.id, label: s.name }))}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#006874]/10">
                <SmartInputGroup
                  label="Altura Total"
                  unit="mm"
                  value={state.height}
                  onChange={(v) => handleLengthChange("height", v)}
                />
                <SmartInputGroup
                  label="Largura Influência"
                  unit="mm"
                  value={state.width}
                  onChange={(v) =>
                    dispatch({
                      type: "SET_GEOMETRY",
                      payload: { ...state, width: v },
                    })
                  }
                />
              </div>

              {(state.category === "guarda-corpo" ||
                state.category === "pele-de-vidro") && (
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#006874]/10">
                  <SmartInputGroup
                    label="Comprimento Total"
                    unit="mm"
                    value={state.length}
                    onChange={(v) => handleLengthChange("length", v)}
                  />
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-[#006874]/10">
                {!state.autoOptimize && !state.compareSuppliers && (
                  <SmartSelectGroup
                    label="Perfil de Alumínio"
                    value={state.profileId}
                    onChange={(v) => dispatch({ type: "SET_PROFILE", payload: v })}
                    options={filteredProfiles.map(p => ({ value: p.code, label: `${p.code} - ${p.series} (Ix: ${p.ix}cm⁴, Wx: ${p.wx}cm³)` }))}
                    placeholder="Selecione um perfil..."
                  />
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-[#006874]/10">
                {!state.compareSuppliers && (
                  <SmartSelectGroup
                    label="Fornecedor do Vidro"
                    value={state.glassSupplierId}
                    onChange={(v) => dispatch({ type: "SET_GLASS_SUPPLIER", payload: v })}
                    options={GLASS_SUPPLIERS.map(s => ({ value: s.id, label: s.name }))}
                    required={false}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SmartSelectGroup
                    label="Tipo de Vidro"
                    value={state.glassType}
                    onChange={(v) => dispatch({ type: "SET_MATERIALS", payload: { ...state, glassType: v as any, glassId: "" } })}
                    options={[
                      { value: "monolithic", label: "Monolítico" },
                      { value: "tempered", label: "Temperado" },
                      { value: "laminated", label: "Laminado" },
                    ]}
                  />
                  
                  {!state.autoOptimize && !state.compareSuppliers && (
                    <SmartSelectGroup
                      label="Espessura do Vidro"
                      value={state.glassId}
                      onChange={(v) => dispatch({ type: "SET_GLASS", payload: v })}
                      options={filteredGlasses.map(g => ({ value: g.id, label: `${g.thickness}mm` }))}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Vento e Localização */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-[#006874] pb-2">
                <Wind size={16} /> 3. Ação do Vento
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <SmartInputGroup
                  label="Altura da Edificação"
                  unit="m"
                  value={state.buildingHeight}
                  onChange={(v) =>
                    dispatch({
                      type: "SET_GEOMETRY",
                      payload: { ...state, buildingHeight: v },
                    })
                  }
                />
              </div>

              {Number(state.buildingHeight) > 90 ? (
                <div className="p-4 border border-[#006874] bg-[#F9F9F7] space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Edificação &gt; 90m (Ensaio em Túnel de Vento Obrigatório)</span>
                  </div>
                  <SmartInputGroup
                    label="Pressão de Ensaio"
                    unit="Pa"
                    value={state.windTunnelPressure}
                    onChange={(v) =>
                      dispatch({
                        type: "SET_WIND",
                        payload: { ...state, windTunnelPressure: v },
                      })
                    }
                  />
                </div>
              ) : (
                <>
                  <MapaIsopletas
                    selectedRegion={state.region}
                    onSelect={(region) => {
                      const v0 = getRegionWindSpeed(region);
                      dispatch({
                        type: "SET_WIND",
                        payload: { ...state, region, windSpeed: v0 },
                      });
                    }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SmartInputGroup
                      label="Velocidade (V0)"
                      unit="m/s"
                      value={state.windSpeed}
                      onChange={(v) =>
                        dispatch({
                          type: "SET_WIND",
                          payload: { ...state, windSpeed: v },
                        })
                      }
                    />
                    <div className="space-y-2">
                      {!isCustomCp ? (
                        <SmartSelectGroup
                          label="Coef. Pressão (Cp)"
                          value={state.cp.toString()}
                          onChange={(v) => {
                            if (v === "custom") {
                              setIsCustomCp(true);
                            } else {
                              dispatch({
                                type: "SET_WIND",
                                payload: { ...state, cp: parseFloat(v) },
                              });
                            }
                          }}
                          options={[
                            { value: "-1.4", label: "Alta Sucção (-1.4) - Quinas/Bordas" },
                            { value: "-1.0", label: "Sucção Normal (-1.0) - Meio da Fachada" },
                            { value: "1.0", label: "Pressão Positiva (+1.0) - Barlavento" },
                            { value: "-2.0", label: "Sucção Extrema (-2.0) - Coberturas/Marquises" },
                            { value: "-0.7", label: "Padrão (-0.7)" },
                            { value: "custom", label: "Personalizado..." },
                          ]}
                        />
                      ) : (
                        <div className="relative">
                          <SmartInputGroup
                            label="Coef. Pressão (Cp)"
                            unit="-"
                            value={state.cp}
                            onChange={(v) =>
                              dispatch({
                                type: "SET_WIND",
                                payload: { ...state, cp: v as number },
                              })
                            }
                          />
                          <button
                            onClick={() => setIsCustomCp(false)}
                            className="absolute top-0 right-0 text-[8px] font-bold uppercase opacity-50 hover:opacity-100"
                          >
                            Voltar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Section 4: Modelo Estrutural */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-[#006874] pb-2">
                <Maximize2 size={16} /> 4. Modelo Estrutural
              </h3>
              
              {(state.category === "pele-de-vidro" || state.category === "guarda-corpo") && (
                <div className="space-y-4">
                  <SmartSelectGroup
                    label="Tipo de Sistema"
                    value={state.systemType}
                    onChange={(v) => {
                      const sysType = v as any;
                      let numSupports = 0;
                      if (sysType === "biapoiada-1-apoio") numSupports = 1;
                      if (sysType === "biapoiada-2-apoios") numSupports = 2;
                      
                      let top = state.supportTop;
                      let bottom = state.supportBottom;
                      
                      if (sysType === "biapoiada") {
                        top = "pinned";
                        bottom = "pinned";
                      } else if (sysType === "engaste-engaste") {
                        top = "fixed";
                        bottom = "fixed";
                      } else if (sysType === "engaste-livre") {
                        top = "free";
                        bottom = "fixed";
                      } else if (sysType === "engaste-apoio") {
                        top = "pinned";
                        bottom = "fixed";
                      } else if (sysType === "biapoiada-1-apoio" || sysType === "biapoiada-2-apoios") {
                        top = "pinned";
                        bottom = "pinned";
                      }
                      
                      dispatch({
                        type: "SET_GEOMETRY",
                        payload: {
                          ...state,
                          systemType: sysType,
                          intermediateSupports: numSupports,
                          supportTop: top,
                          supportBottom: bottom,
                          spans: numSupports === 1 ? [Number(state.length || state.height) / 2, Number(state.length || state.height) / 2] : 
                                 numSupports === 2 ? [Number(state.length || state.height) / 3, Number(state.length || state.height) / 3, Number(state.length || state.height) / 3] : []
                        }
                      });
                    }}
                    options={[
                      { value: "biapoiada", label: "Biapoiada simples" },
                      { value: "engaste-engaste", label: "Engaste–engaste" },
                      { value: "engaste-livre", label: "Engaste–livre (balanço)" },
                      { value: "engaste-apoio", label: "Engaste–apoio" },
                      { value: "biapoiada-1-apoio", label: "Biapoiada + 1 apoio intermediário" },
                      { value: "biapoiada-2-apoios", label: "Biapoiada + 2 apoios intermediários" },
                    ]}
                  />
                  
                  {state.intermediateSupports === 1 && (
                    <div className="p-4 border border-[#006874] bg-[#F9F9F7] space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-[#006874]/10 pb-2">Apoio Intermediário 1</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SmartSelectGroup
                          label="Tipo de Vínculo"
                          value={state.intermediateSupport1Type}
                          onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, intermediateSupport1Type: v as any } })}
                          options={[
                            { value: "pinned", label: "Apoio simples" },
                            { value: "fixed", label: "Engaste" },
                            { value: "free", label: "Livre" },
                          ]}
                        />
                        <SmartInputGroup
                          label="Distância (a)"
                          unit="mm"
                          value={state.spans[0] || ""}
                          onChange={(v) => {
                            const L = Number(state.length || state.height);
                            const val = Number(v) || 0;
                            if (val >= 0 && val <= L) {
                              dispatch({
                                type: "SET_GEOMETRY",
                                payload: { ...state, spans: [val, L - val] }
                              });
                            }
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-bold opacity-50">Distância restante (b): {Number(state.length || state.height) - (state.spans[0] || 0)} mm</p>
                    </div>
                  )}
                  
                  {state.intermediateSupports === 2 && (
                    <div className="p-4 border border-[#006874] bg-[#F9F9F7] space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-[#006874]/10 pb-2">Apoios Intermediários</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SmartSelectGroup
                          label="Vínculo Apoio 1"
                          value={state.intermediateSupport1Type}
                          onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, intermediateSupport1Type: v as any } })}
                          options={[
                            { value: "pinned", label: "Apoio simples" },
                            { value: "fixed", label: "Engaste" },
                            { value: "free", label: "Livre" },
                          ]}
                        />
                        <SmartInputGroup
                          label="Distância 1 (a)"
                          unit="mm"
                          value={state.spans[0] || ""}
                          onChange={(v) => {
                            const L = Number(state.length || state.height);
                            const val = Number(v) || 0;
                            const span2 = state.spans[1] || L/3;
                            if (val >= 0 && val + span2 <= L) {
                              dispatch({
                                type: "SET_GEOMETRY",
                                payload: { ...state, spans: [val, span2, L - val - span2] }
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SmartSelectGroup
                          label="Vínculo Apoio 2"
                          value={state.intermediateSupport2Type}
                          onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, intermediateSupport2Type: v as any } })}
                          options={[
                            { value: "pinned", label: "Apoio simples" },
                            { value: "fixed", label: "Engaste" },
                            { value: "free", label: "Livre" },
                          ]}
                        />
                        <SmartInputGroup
                          label="Distância 2 (b)"
                          unit="mm"
                          value={state.spans[1] || ""}
                          onChange={(v) => {
                            const L = Number(state.length || state.height);
                            const val = Number(v) || 0;
                            const span1 = state.spans[0] || L/3;
                            if (val >= 0 && val + span1 <= L) {
                              dispatch({
                                type: "SET_GEOMETRY",
                                payload: { ...state, spans: [span1, val, L - span1 - val] }
                              });
                            }
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-bold opacity-50">Distância restante (c): {Number(state.length || state.height) - (state.spans[0] || 0) - (state.spans[1] || 0)} mm</p>
                    </div>
                  )}
                </div>
              )}
              
              {state.category !== "pele-de-vidro" && state.category !== "guarda-corpo" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SmartSelectGroup
                    label="Apoio Base"
                    value={state.supportBottom}
                    onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportBottom: v as any } })}
                    options={[
                      { value: "pinned", label: "Apoio simples" },
                      { value: "fixed", label: "Engaste" },
                      { value: "free", label: "Livre" },
                    ]}
                  />
                  <SmartSelectGroup
                    label="Apoio Topo"
                    value={state.supportTop}
                    onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportTop: v as any } })}
                    options={[
                      { value: "pinned", label: "Apoio simples" },
                      { value: "fixed", label: "Engaste" },
                      { value: "free", label: "Livre" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Real-time Results */}
        <section className="overflow-y-auto p-8 lg:p-12 space-y-8 bg-[#E4E3E0]">
          {showReportPreview && results ? (
            <div className="space-y-8 bg-white p-8 border border-[#006874] shadow-lg max-w-4xl mx-auto">
              <div className="border-b border-[#006874] pb-4 mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Aba de Verificação Técnica</h2>
                <p className="text-xs font-bold uppercase opacity-40">Pré-visualização do Memorial de Cálculo</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">Dados de Entrada</h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-bold opacity-50">Categoria:</span> {state.category.toUpperCase()}</li>
                    <li><span className="font-bold opacity-50">Tipologia:</span> {TYPOLOGIES.find(t => t.id === state.typologyId)?.name}</li>
                    <li><span className="font-bold opacity-50">Altura:</span> {state.height} mm</li>
                    <li><span className="font-bold opacity-50">Largura:</span> {state.width} mm</li>
                    <li><span className="font-bold opacity-50">Região:</span> {state.region || "N/A"}</li>
                    <li><span className="font-bold opacity-50">Pressão Vento:</span> {results.metrics.windPressure.toFixed(2)} kN/m²</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">Modelo Estrutural</h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-bold opacity-50">Sistema:</span> {results.metrics.structuralSystem}</li>
                    <li><span className="font-bold opacity-50">Vão Efetivo:</span> {(results.metrics.effectiveSpan * 1000).toFixed(0)} mm</li>
                    <li><span className="font-bold opacity-50">Carga Linear:</span> {results.metrics.totalLoad.toFixed(2)} kN/m</li>
                  </ul>
                </div>
              </div>

              {results.solutions.length > 0 && (
                <div className="mt-8 space-y-8">
                  <div className="bg-[#F9F9F7] p-6 border border-[#006874]">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">Diagnóstico Estrutural ({selectedSolutionId === results.solutions[0].id ? "Melhor Solução" : "Solução Selecionada"})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="font-black text-xl mb-1">{(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).profile.code}</p>
                        <p className="text-[10px] font-bold uppercase opacity-50 mb-4">{(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).profile.series} • Vidro {(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).glass.thickness}mm {(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).glass.type}</p>
                        
                        <div className={`inline-block px-3 py-1 border text-[10px] font-black uppercase mb-4 ${
                          (results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).elu.verification.classificacao === "REPROVADO" ? "bg-red-100 text-red-800 border-red-200" :
                          (results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).elu.verification.classificacao === "CRITICO" ? "bg-orange-100 text-orange-800 border-orange-200" :
                          (results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).elu.verification.classificacao === "APROVADO_LIMITE" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                          "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}>
                          {(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).elu.verification.classificacao.replace("_", " ")}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold uppercase opacity-70 leading-relaxed">
                        <p className="mb-2">Recomendação Técnica:</p>
                        <p className="bg-white p-3 border border-[#006874]/10">{(results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]).elu.verification.recomendacaoTecnica}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest border-b border-[#006874]/10 pb-2">Diagramas de Análise Estrutural</h3>
                    <DetailedDiagrams
                      solution={results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]}
                      metrics={results.metrics}
                    />
                  </div>
                  
                  <CalculationMemory 
                    metrics={results.metrics}
                    solution={results.solutions.find(s => s.id === selectedSolutionId) || results.solutions[0]}
                    solutions={results.solutions}
                    state={getValidatedConfig(state)!}
                  />
                </div>
              )}

              {/* Viable Solutions List */}
              {results.solutions.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">Lista de Soluções Viáveis (Clique para ver detalhes)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="border-b border-[#006874]">
                          <th className="p-2 font-black uppercase">Perfil</th>
                          <th className="p-2 font-black uppercase">Vidro</th>
                          <th className="p-2 font-black uppercase">Uso ELU</th>
                          <th className="p-2 font-black uppercase">Flecha</th>
                          <th className="p-2 font-black uppercase">Eficiência</th>
                          <th className="p-2 font-black uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.solutions.filter(s => s.isApproved).map(sol => (
                          <tr 
                            key={sol.id} 
                            className={`border-b border-[#006874]/10 cursor-pointer hover:bg-[#006874]/5 transition-colors ${selectedSolutionId === sol.id ? 'bg-[#006874]/10' : ''}`}
                            onClick={() => setSelectedSolutionId(sol.id)}
                          >
                            <td className="p-2 font-bold">{sol.profile.code}</td>
                            <td className="p-2">{sol.glass.thickness}mm {sol.glass.type}</td>
                            <td className="p-2">{sol.elu.usageIndex.toFixed(1)}%</td>
                            <td className="p-2">{sol.els.deflection.toFixed(2)} mm</td>
                            <td className="p-2">{sol.globalEfficiency.toFixed(1)}%</td>
                            <td className="p-2">
                              <span className={`font-bold ${
                                sol.elu.verification.classificacao === "APROVADO_CONFORTO" ? "text-emerald-600" :
                                sol.elu.verification.classificacao === "APROVADO_LIMITE" ? "text-yellow-600" :
                                "text-orange-600"
                              }`}>
                                {sol.elu.verification.classificacao.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : !results ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <Calculator size={64} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-widest">
                Aguardando Configuração
              </p>
              <p className="text-[10px] font-bold uppercase">
                Preencha todos os campos obrigatórios (*) no painel lateral para
                visualizar os resultados.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Quick Parameters Edit */}
              <div className="bg-white border border-[#006874] p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Maximize2 size={14} />
                  Ajuste Rápido de Parâmetros
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SmartInputGroup
                    label="Altura Total"
                    unit="mm"
                    value={state.height}
                    onChange={(v) => handleLengthChange("height", v)}
                  />
                  <SmartInputGroup
                    label="Largura de Influência"
                    unit="mm"
                    value={state.width}
                    onChange={(v) =>
                      dispatch({
                        type: "SET_GEOMETRY",
                        payload: { ...state, width: v },
                      })
                    }
                  />
                  <div className="space-y-2">
                    <SmartSelectGroup
                      label="Região de Vento"
                      value={state.region}
                      onChange={(v) => {
                        const v0 = getRegionWindSpeed(v);
                        dispatch({
                          type: "SET_WIND",
                          payload: {
                            ...state,
                            region: v,
                            windSpeed: v0,
                          },
                        });
                      }}
                      options={BRAZIL_REGIONS.map(r => ({ value: r.name, label: r.name }))}
                    />
                  </div>
                  <SmartInputGroup
                    label={Number(state.buildingHeight) > 90 ? "Pressão (Pa)" : "Velocidade (V0)"}
                    unit={Number(state.buildingHeight) > 90 ? "Pa" : "m/s"}
                    value={Number(state.buildingHeight) > 90 ? state.windTunnelPressure : state.windSpeed}
                    onChange={(v) => {
                      if (Number(state.buildingHeight) > 90) {
                        dispatch({
                          type: "SET_WIND",
                          payload: { ...state, windTunnelPressure: v },
                        });
                      } else {
                        dispatch({
                          type: "SET_WIND",
                          payload: { ...state, windSpeed: v },
                        });
                      }
                    }}
                  />
                  <div className="space-y-2">
                    {!isCustomCp ? (
                      <SmartSelectGroup
                        label="Coef. Pressão (Cp)"
                        value={state.cp.toString()}
                        onChange={(v) => {
                          if (v === "custom") {
                            setIsCustomCp(true);
                          } else {
                            dispatch({
                              type: "SET_WIND",
                              payload: { ...state, cp: parseFloat(v) },
                            });
                          }
                        }}
                        options={[
                          { value: "-1.4", label: "Alta Sucção (-1.4) - Quinas/Bordas" },
                          { value: "-1.0", label: "Sucção Normal (-1.0) - Meio da Fachada" },
                          { value: "1.0", label: "Pressão Positiva (+1.0) - Barlavento" },
                          { value: "-2.0", label: "Sucção Extrema (-2.0) - Coberturas/Marquises" },
                          { value: "-0.7", label: "Padrão (-0.7)" },
                          { value: "custom", label: "Personalizado..." },
                        ]}
                      />
                    ) : (
                      <div className="relative">
                        <SmartInputGroup
                          label="Coef. Pressão (Cp)"
                          unit="-"
                          value={state.cp}
                          onChange={(v) =>
                            dispatch({
                              type: "SET_WIND",
                              payload: { ...state, cp: v as number },
                            })
                          }
                        />
                        <button
                          onClick={() => setIsCustomCp(false)}
                          className="absolute top-0 right-0 text-[8px] font-bold uppercase opacity-50 hover:opacity-100"
                        >
                          Voltar
                        </button>
                      </div>
                    )}
                  </div>
                  <SmartSelectGroup
                    label="Apoio Base"
                    value={state.supportBottom}
                    onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportBottom: v as any } })}
                    options={[
                      { value: "pinned", label: "Apoiado (Pinned)" },
                      { value: "fixed", label: "Engastado (Fixed)" },
                      { value: "free", label: "Livre (Free)" },
                    ]}
                  />
                  <SmartSelectGroup
                    label="Apoio Topo"
                    value={state.supportTop}
                    onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportTop: v as any } })}
                    options={[
                      { value: "pinned", label: "Apoiado (Pinned)" },
                      { value: "fixed", label: "Engastado (Fixed)" },
                      { value: "free", label: "Livre (Free)" },
                    ]}
                  />
                  <SmartSelectGroup
                    label="Tipo de Vidro"
                    value={state.glassType}
                    onChange={(v) => dispatch({ type: "SET_MATERIALS", payload: { ...state, glassType: v as any } })}
                    options={[
                      { value: "monolithic", label: "Monolítico" },
                      { value: "tempered", label: "Temperado" },
                      { value: "laminated", label: "Laminado" },
                    ]}
                  />
                  <SmartSelectGroup
                    label="Espessura do Vidro"
                    value={state.glassId}
                    onChange={(v) => dispatch({ type: "SET_GLASS", payload: v })}
                    options={filteredGlasses.map(g => ({ value: g.id, label: `${g.thickness}mm` }))}
                  />
                </div>
              </div>

              {/* Top Metrics */}
              {!state.compareSuppliers && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                  <MetricBox
                    label="Pressão de Vento"
                    value={results.metrics.windPressure.toFixed(2)}
                    unit="kN/m²"
                  />
                  <MetricBox
                    label="Velocidade VK"
                    value={results.metrics.vk.toFixed(1)}
                    unit="m/s"
                  />
                  <MetricBox
                    label="Carga Total"
                    value={results.metrics.totalLoad.toFixed(2)}
                    unit="kN/m"
                  />
                </div>
              )}

              {/* Comparison Results */}
              {state.compareSuppliers && comparisonResults && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} />
                      Comparativo entre Sistemistas
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#006874]">
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest">Sistemista</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest">Perfil Viável</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest">Peso (kg/m)</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest">Eficiência (%)</th>
                          <th className="p-3 text-[10px] font-black uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonResults.map((res, idx) => (
                          <tr key={res.supplier.id} className={`border-b border-[#006874]/10 ${idx === 0 && res.bestSolution ? 'bg-[#086775]/10' : ''}`}>
                            <td className="p-3 text-sm font-bold flex items-center gap-2">
                              {idx === 0 && res.bestSolution && <CheckCircle2 size={14} className="text-[#086775]" />}
                              {res.supplier.name}
                            </td>
                            <td className="p-3 text-sm">{res.bestSolution?.profile.code || "-"}</td>
                            <td className="p-3 text-sm">{res.bestSolution?.profile.weight.toFixed(2) || "-"}</td>
                            <td className="p-3 text-sm">{res.bestSolution?.globalEfficiency.toFixed(1) || "-"}</td>
                            <td className="p-3 text-sm">
                              {res.bestSolution ? (
                                <span className="text-[#086775] font-bold">Aprovado</span>
                              ) : (
                                <span className="text-red-600 font-bold">Sem solução</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Solutions Ranking */}
              {!state.compareSuppliers && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} />
                      {state.profileId && state.glassId && !state.autoOptimize ? "Solução Calculada" : "Soluções Viáveis Encontradas"}
                    </h3>
                    <span className="text-[10px] font-bold uppercase opacity-40">
                      {results.solutions.length} Opções Encontradas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {results.solutions.map((sol, idx) => (
                      <div key={sol.id} className={`relative ${idx === 0 && state.autoOptimize ? 'ring-2 ring-[#086775]' : ''}`}>
                        {idx === 0 && state.autoOptimize && (
                          <div className="absolute -top-3 left-4 bg-[#086775] text-white text-[9px] font-black uppercase px-2 py-1 tracking-widest z-10">
                            Perfil estrutural otimizado recomendado
                          </div>
                        )}
                        <SolutionCard 
                          solution={sol} 
                          onViewDetails={() => {
                            setSelectedSolutionId(sol.id);
                            setShowReportPreview(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Detailing */}
              {!state.compareSuppliers && results.solutions.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-[#006874]/10">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} />
                    Análise Estrutural Detalhada
                  </h3>
                  <DetailedDiagrams
                    solution={results.solutions[0]}
                    metrics={results.metrics}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#006874] bg-white py-4 mt-8">
        <div className="max-w-[1600px] mx-auto px-8 text-center text-[10px] font-bold uppercase opacity-40 tracking-widest">
          Developed by Eduardo Marques
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ConfiguratorProvider>
      <ConfiguratorApp />
    </ConfiguratorProvider>
  );
}
