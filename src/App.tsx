import { useState, useEffect, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, Wind, Maximize2, Layers, Download, CheckCircle2, AlertCircle,
  LayoutGrid, ChevronRight, ArrowRight, Building2, Box, ChevronLeft, ShieldCheck
} from "lucide-react";

import { ConfiguratorProvider, useConfigurator } from "./store/ConfiguratorContext";
import { runStructuralEngine } from "./engines/structuralEngine";
import { getCompatibleTypologies, getCompatibleProfiles, getCompatibleGlasses } from "./services/catalogService";
import { getRegionWindSpeed } from "./services/normativeService";
import { BRAZIL_REGIONS, SUPPLIERS, TYPOLOGIES } from "./core/constants";
import { Solution, CalculationMetrics, ItemCategory, SupportCondition } from "./core/types";

// --- UI Components ---

function HeaderStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase opacity-40 tracking-widest">{label}</span>
      <span className="text-xs font-black uppercase tracking-tighter">{value}</span>
    </div>
  );
}

function MetricBox({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="border border-[#141414] bg-white p-6">
      <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tighter">{value}</span>
        <span className="text-xs font-bold opacity-40">{unit}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, subtext }: { label: string, value: string, unit: string, subtext?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase opacity-40 tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-black">{value}</span>
        <span className="text-[8px] font-bold opacity-40">{unit}</span>
      </div>
      {subtext && <p className="text-[8px] font-mono opacity-30">{subtext}</p>}
    </div>
  );
}

function StepContainer({ title, icon, children }: { title: string, icon: ReactNode, children: ReactNode, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border border-[#141414] flex items-center justify-center bg-[#F9F9F7]">
          {icon}
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CategoryButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 border transition-all text-left flex flex-col justify-between h-32 ${
        active 
          ? "bg-[#141414] border-[#141414] text-white" 
          : "bg-white border-[#D1D1D1] hover:border-[#141414]"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <ArrowRight size={16} className={active ? "text-white" : "opacity-20"} />
    </button>
  );
}

function SelectionButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 border text-left text-[10px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${
        active 
          ? "bg-[#141414] border-[#141414] text-white" 
          : "bg-white border-[#D1D1D1] hover:border-[#141414]"
      }`}
    >
      {label}
      {active && <CheckCircle2 size={14} />}
    </button>
  );
}

function SupportSelect({ label, value, onChange }: { label: string, value: string, onChange: (v: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase opacity-50">{label}</label>
      <select 
        className="w-full bg-transparent border border-[#141414] p-3 text-[10px] font-bold uppercase outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="pinned">Apoiado (Pinned)</option>
        <option value="fixed">Engastado (Fixed)</option>
        <option value="free">Livre (Free)</option>
      </select>
    </div>
  );
}

function InputGroup({ label, unit, value, onChange }: { label: string, unit: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold uppercase opacity-50">{label}</label>
        <span className="text-[8px] font-mono opacity-40">{unit}</span>
      </div>
      <input 
        type="number"
        className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold outline-none focus:bg-white"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

function SolutionCard({ solution }: { solution: Solution, key?: string }) {
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
    <div className={`border border-[#141414] bg-white p-6 relative overflow-hidden transition-all hover:shadow-lg ${!solution.isApproved ? "opacity-60" : ""}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[8px] font-black uppercase px-2 py-1 border ${rankColors[solution.rank]}`}>
              {rankLabels[solution.rank]}
            </span>
            {solution.isApproved ? (
              <span className="flex items-center gap-1 text-emerald-600 text-[8px] font-black uppercase">
                <ShieldCheck size={12} />
                Aprovada
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-[8px] font-black uppercase">
                <AlertCircle size={12} />
                Falha Técnica
              </span>
            )}
          </div>
          <h4 className="text-lg font-black uppercase tracking-tighter">{solution.profile.code}</h4>
          <p className="text-[10px] font-bold uppercase opacity-40">{solution.profile.series} • Vidro {solution.glass.thickness}mm {solution.glass.type}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Índice de Uso (ELU)</p>
          <p className={`text-2xl font-black tracking-tighter ${solution.elu.usageIndex > 90 ? "text-red-600" : "text-[#141414]"}`}>
            {solution.elu.usageIndex.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MiniStat label="Inércia (Ix)" value={`${solution.profile.ix.toFixed(1)}`} unit="cm⁴" />
        <MiniStat label="Flecha (ELS)" value={`${solution.els.deflection.toFixed(2)}`} unit="mm" subtext={`Lim: ${solution.els.deflectionLimit.toFixed(2)}`} />
        <MiniStat label="Momento (ELU)" value={`${solution.elu.momentSoliciting.toFixed(2)}`} unit="kNm" subtext={`Res: ${solution.elu.momentResistant.toFixed(2)}`} />
        <MiniStat label="Peso" value={`${solution.profile.weight.toFixed(2)}`} unit="kg/m" />
      </div>

      {/* Progress Bar for Usage */}
      <div className="mt-6 h-1 bg-[#E4E3E0] relative">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${solution.elu.usageIndex > 100 ? "bg-red-600" : "bg-[#086775]"}`}
          style={{ width: `${Math.min(solution.elu.usageIndex, 100)}%` }}
        />
      </div>
    </div>
  );
}

// --- Main Application ---

function ConfiguratorApp() {
  const { state, dispatch } = useConfigurator();
  const [results, setResults] = useState<{ metrics: CalculationMetrics, solutions: Solution[] } | null>(null);

  const filteredTypologies = useMemo(() => getCompatibleTypologies(state.category), [state.category]);
  const filteredProfiles = useMemo(() => getCompatibleProfiles(state.supplierId, state.category), [state.supplierId, state.category]);
  const filteredGlasses = useMemo(() => getCompatibleGlasses("laminated"), []); // Defaulting to laminated for now, could be dynamic

  useEffect(() => {
    if (state.category && state.typologyId && state.supplierId && state.height > 0 && state.width > 0) {
      const timer = setTimeout(() => {
        const typology = TYPOLOGIES.find(t => t.id === state.typologyId);
        if (typology) {
          const res = runStructuralEngine(state, filteredProfiles, filteredGlasses, typology);
          setResults(res);
        }
      }, 300); // Debounce
      return () => clearTimeout(timer);
    } else {
      setResults(null);
    }
  }, [state, filteredProfiles, filteredGlasses]);

  const nextStep = () => dispatch({ type: "SET_STEP", payload: Math.min(state.step + 1, 5) });
  const prevStep = () => dispatch({ type: "SET_STEP", payload: Math.max(state.step - 1, 1) });

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#086775] selection:text-white">
      <header className="border-b border-[#141414] bg-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#141414] flex items-center justify-center">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">EsquadriasCalc Pro</h1>
              <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Dimensionamento Estrutural</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <HeaderStat label="Status" value={results ? "Calculado" : "Incompleto"} />
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch({ type: "RESET" })} className="border border-[#141414] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[#E4E3E0]">Reset</button>
              <button disabled={!results} className="bg-[#141414] text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-[#086775] disabled:opacity-20 flex items-center gap-2">
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[450px_1fr] min-h-[calc(100vh-73px)]">
        {/* Left Column: Guided Workflow */}
        <aside className="bg-white border-r border-[#141414] flex flex-col">
          <div className="p-8 border-b border-[#141414] bg-[#F9F9F7]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest">Configurador</h2>
              <span className="text-[10px] font-mono opacity-40">Passo {state.step} de 5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-1 flex-1 transition-all ${s <= state.step ? "bg-[#141414]" : "bg-[#D1D1D1]"}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <AnimatePresence mode="wait">
              {state.step === 1 && (
                <StepContainer key="step1" title="Categoria do Item" icon={<LayoutGrid size={18} />}>
                  <div className="grid grid-cols-2 gap-3">
                    {["janela", "porta", "guarda-corpo", "pele-de-vidro"].map((cat) => (
                      <CategoryButton 
                        key={cat}
                        active={state.category === cat}
                        label={cat}
                        onClick={() => dispatch({ type: "SET_CATEGORY", payload: cat as ItemCategory })}
                      />
                    ))}
                  </div>
                </StepContainer>
              )}

              {state.step === 2 && (
                <StepContainer key="step2" title="Tipologia" icon={<Box size={18} />}>
                  <div className="space-y-3">
                    {filteredTypologies.map((t) => (
                      <SelectionButton 
                        key={t.id}
                        active={state.typologyId === t.id}
                        label={t.name}
                        onClick={() => dispatch({ type: "SET_TYPOLOGY", payload: t.id })}
                      />
                    ))}
                    {filteredTypologies.length === 0 && (
                      <p className="text-[10px] font-bold uppercase opacity-40 text-center py-8 border border-dashed border-[#141414]">Selecione uma categoria primeiro</p>
                    )}
                  </div>
                </StepContainer>
              )}

              {state.step === 3 && (
                <StepContainer key="step3" title="Fornecedor" icon={<Building2 size={18} />}>
                  <div className="space-y-3">
                    {SUPPLIERS.map((s) => (
                      <SelectionButton 
                        key={s.id}
                        active={state.supplierId === s.id}
                        label={s.name}
                        onClick={() => dispatch({ type: "SET_SUPPLIER", payload: s.id })}
                      />
                    ))}
                  </div>
                </StepContainer>
              )}

              {state.step === 4 && (
                <StepContainer key="step4" title="Geometria e Apoios" icon={<Maximize2 size={18} />}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label="Altura Total" 
                        unit="mm" 
                        value={state.height} 
                        onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, height: v } })} 
                      />
                      <InputGroup 
                        label="Largura Influência" 
                        unit="mm" 
                        value={state.width} 
                        onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, width: v } })} 
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Condições de Contorno</p>
                      <div className="grid grid-cols-2 gap-3">
                        <SupportSelect 
                          label="Base" 
                          value={state.supportBottom} 
                          onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportBottom: v } })} 
                        />
                        <SupportSelect 
                          label="Topo" 
                          value={state.supportTop} 
                          onChange={(v) => dispatch({ type: "SET_GEOMETRY", payload: { ...state, supportTop: v } })} 
                        />
                      </div>
                    </div>
                  </div>
                </StepContainer>
              )}

              {state.step === 5 && (
                <StepContainer key="step5" title="Vento e Localização" icon={<Wind size={18} />}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase opacity-50">Região do Brasil</label>
                      <select 
                        className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold outline-none"
                        value={state.region}
                        onChange={(e) => {
                          const v0 = getRegionWindSpeed(e.target.value);
                          dispatch({ type: "SET_WIND", payload: { ...state, region: e.target.value, windSpeed: v0 } });
                        }}
                      >
                        {BRAZIL_REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="V0" unit="m/s" value={state.windSpeed} onChange={(v) => dispatch({ type: "SET_WIND", payload: { ...state, windSpeed: v } })} />
                      <InputGroup label="Coef. Pressão (Cp)" unit="-" value={state.cp} onChange={(v) => dispatch({ type: "SET_WIND", payload: { ...state, cp: v } })} />
                    </div>
                  </div>
                </StepContainer>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="p-8 border-t border-[#141414] flex gap-4 bg-white">
            {state.step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 border border-[#141414] py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#E4E3E0] transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} />
                Voltar
              </button>
            )}
            {state.step < 5 && state.category && (
              <button 
                onClick={nextStep}
                className="flex-[2] bg-[#141414] text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#086775] transition-colors flex items-center justify-center gap-2"
              >
                Próximo
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </aside>

        {/* Right Column: Real-time Results */}
        <section className="overflow-y-auto p-8 lg:p-12 space-y-12 bg-[#E4E3E0]">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <Calculator size={64} strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-widest">Aguardando Configuração</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                <MetricBox label="Pressão de Vento" value={results.metrics.windPressure.toFixed(2)} unit="kN/m²" />
                <MetricBox label="Velocidade VK" value={results.metrics.vk.toFixed(1)} unit="m/s" />
                <MetricBox label="Carga Total" value={results.metrics.totalLoad.toFixed(2)} unit="kN/m" />
              </div>

              {/* Solutions Ranking */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} />
                    Soluções Recomendadas
                  </h3>
                  <span className="text-[10px] font-bold uppercase opacity-40">{results.solutions.length} Opções Encontradas</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {results.solutions.map((sol) => (
                    <SolutionCard key={sol.id} solution={sol} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
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
