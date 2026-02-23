import { useState, useEffect, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Wind, 
  Maximize2, 
  Layers, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ShieldCheck,
  Zap,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
  Info,
  Building2,
  Box,
  ChevronLeft
} from "lucide-react";
import { MotorCalculoFachada } from "./logic/calculator";
import { BRAZIL_REGIONS, SUPPLIERS, TYPOLOGIES, CATALOG } from "./logic/constants";
import { CalcInputs, CalcResults, Solution, ItemCategory } from "./logic/types";
import { MetricBox } from "./components/UIComponents";

export default function App() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<CalcInputs>({
    category: "",
    typologyId: "",
    supplierId: SUPPLIERS[0].id,
    height: 3000,
    width: 1200,
    supportTop: "pinned",
    supportBottom: "pinned",
    supportLeft: "pinned",
    supportRight: "pinned",
    region: BRAZIL_REGIONS[1].name,
    windSpeed: BRAZIL_REGIONS[1].v0,
    s1: 1.0,
    s2Category: 2,
    s2Class: "B",
    s3: 1.0,
    cp: -0.8,
    glassType: "laminated",
    glassThickness: 10,
    modulusOfElasticity: 70,
    allowableStress: 80,
  });

  const [results, setResults] = useState<CalcResults | null>(null);

  // Filtered Typologies based on Category
  const filteredTypologies = useMemo(() => {
    return TYPOLOGIES.filter(t => t.category === inputs.category);
  }, [inputs.category]);

  // Real-time Calculation
  useEffect(() => {
    if (inputs.category && inputs.typologyId && inputs.supplierId) {
      const timer = setTimeout(() => {
        const res = MotorCalculoFachada.calculate(inputs, CATALOG);
        setResults(res);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputs]);

  const handleInputChange = (field: keyof CalcInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#086775] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#141414] bg-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#141414] flex items-center justify-center">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">EsquadriasCalc Pro</h1>
              <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Dimensionamento Estrutural Normativo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <HeaderStat label="Status" value={results ? "Calculado" : "Aguardando"} />
            <HeaderStat label="Norma" value="NBR 6123 / 10821" />
            <button className="bg-[#141414] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#086775] transition-colors flex items-center gap-2">
              <Download size={14} />
              Exportar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[450px_1fr] min-h-[calc(100vh-73px)]">
        {/* Left Column: Guided Workflow */}
        <aside className="bg-white border-r border-[#141414] flex flex-col">
          <div className="p-8 border-b border-[#141414] bg-[#F9F9F7]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest">Configurador</h2>
              <span className="text-[10px] font-mono opacity-40">Passo {step} de 5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-1 flex-1 transition-all ${s <= step ? "bg-[#141414]" : "bg-[#D1D1D1]"}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepContainer key="step1" title="Categoria do Item" icon={<LayoutGrid size={18} />}>
                  <div className="grid grid-cols-2 gap-3">
                    {["janela", "porta", "guarda-corpo", "pele-de-vidro"].map((cat) => (
                      <CategoryButton 
                        key={cat}
                        active={inputs.category === cat}
                        label={cat}
                        onClick={() => {
                          handleInputChange("category", cat);
                          handleInputChange("typologyId", ""); // Reset typology
                          nextStep();
                        }}
                      />
                    ))}
                  </div>
                </StepContainer>
              )}

              {step === 2 && (
                <StepContainer key="step2" title="Tipologia" icon={<Box size={18} />}>
                  <div className="space-y-3">
                    {filteredTypologies.map((t) => (
                      <SelectionButton 
                        key={t.id}
                        active={inputs.typologyId === t.id}
                        label={t.name}
                        onClick={() => {
                          handleInputChange("typologyId", t.id);
                          nextStep();
                        }}
                      />
                    ))}
                    {filteredTypologies.length === 0 && (
                      <p className="text-[10px] font-bold uppercase opacity-40 text-center py-8 border border-dashed border-[#141414]">Selecione uma categoria primeiro</p>
                    )}
                  </div>
                </StepContainer>
              )}

              {step === 3 && (
                <StepContainer key="step3" title="Fornecedor" icon={<Building2 size={18} />}>
                  <div className="space-y-3">
                    {SUPPLIERS.map((s) => (
                      <SelectionButton 
                        key={s.id}
                        active={inputs.supplierId === s.id}
                        label={s.name}
                        onClick={() => {
                          handleInputChange("supplierId", s.id);
                          nextStep();
                        }}
                      />
                    ))}
                  </div>
                </StepContainer>
              )}

              {step === 4 && (
                <StepContainer key="step4" title="Geometria e Apoios" icon={<Maximize2 size={18} />}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label="Altura Total" 
                        unit="mm" 
                        value={inputs.height} 
                        onChange={(v) => handleInputChange("height", v)} 
                      />
                      <InputGroup 
                        label="Largura Influência" 
                        unit="mm" 
                        value={inputs.width} 
                        onChange={(v) => handleInputChange("width", v)} 
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Condições de Contorno</p>
                      <div className="grid grid-cols-2 gap-3">
                        <SupportSelect 
                          label="Base" 
                          value={inputs.supportBottom} 
                          onChange={(v) => handleInputChange("supportBottom", v)} 
                        />
                        <SupportSelect 
                          label="Topo" 
                          value={inputs.supportTop} 
                          onChange={(v) => handleInputChange("supportTop", v)} 
                        />
                      </div>
                    </div>
                  </div>
                </StepContainer>
              )}

              {step === 5 && (
                <StepContainer key="step5" title="Vento e Localização" icon={<Wind size={18} />}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase opacity-50">Região do Brasil</label>
                      <select 
                        className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold outline-none"
                        value={inputs.region}
                        onChange={(e) => {
                          const reg = BRAZIL_REGIONS.find(r => r.name === e.target.value);
                          if (reg) {
                            handleInputChange("region", reg.name);
                            handleInputChange("windSpeed", reg.v0);
                          }
                        }}
                      >
                        {BRAZIL_REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="V0" unit="m/s" value={inputs.windSpeed} onChange={(v) => handleInputChange("windSpeed", v)} />
                      <InputGroup label="Coef. Pressão (Cp)" unit="-" value={inputs.cp} onChange={(v) => handleInputChange("cp", v)} />
                    </div>
                  </div>
                </StepContainer>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="p-8 border-t border-[#141414] flex gap-4 bg-white">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 border border-[#141414] py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#E4E3E0] transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} />
                Voltar
              </button>
            )}
            {step < 5 && inputs.category && (
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
                <MetricBox label="Pressão de Vento" value={results.windPressure.toFixed(2)} unit="kN/m²" />
                <MetricBox label="Velocidade VK" value={results.vk.toFixed(1)} unit="m/s" />
                <MetricBox label="Classe Desempenho" value={results.performanceClass} unit="" />
              </div>

              {/* Structural Visualization */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 size={14} />
                  Análise Estrutural
                </h3>
                <StructuralVisualizer inputs={inputs} />
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

function HeaderStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase opacity-40 tracking-widest">{label}</span>
      <span className="text-xs font-black uppercase tracking-tighter">{value}</span>
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
    economica: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ideal: "bg-blue-100 text-blue-800 border-blue-200",
    performance: "bg-purple-100 text-purple-800 border-purple-200",
    reprovada: "bg-red-100 text-red-800 border-red-200",
  };

  const rankLabels = {
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
          <p className="text-[10px] font-bold uppercase opacity-40">{solution.profile.series} • {solution.glassThickness}mm {solution.glassType}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Índice de Uso</p>
          <p className={`text-2xl font-black tracking-tighter ${solution.usageIndex > 90 ? "text-red-600" : "text-[#141414]"}`}>
            {solution.usageIndex.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MiniStat label="Inércia (Ix)" value={`${solution.profile.ix.toFixed(1)}`} unit="cm⁴" subtext={`Req: ${solution.ixReq.toFixed(1)}`} />
        <MiniStat label="Flecha (ELS)" value={`${solution.deflection.toFixed(2)}`} unit="mm" subtext={`Lim: ${solution.deflectionLimit.toFixed(2)}`} />
        <MiniStat label="Momento (ELU)" value={`${solution.momentSoliciting.toFixed(2)}`} unit="kNm" subtext={`Res: ${solution.momentResistant.toFixed(2)}`} />
        <MiniStat label="Peso" value={`${solution.profile.weight.toFixed(2)}`} unit="kg/m" />
      </div>

      {/* Progress Bar for Usage */}
      <div className="mt-6 h-1 bg-[#E4E3E0] relative">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${solution.usageIndex > 100 ? "bg-red-600" : "bg-[#086775]"}`}
          style={{ width: `${Math.min(solution.usageIndex, 100)}%` }}
        />
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

function StructuralVisualizer({ inputs }: { inputs: CalcInputs }) {
  return (
    <div className="h-40 border border-dashed border-[#141414] bg-[#F9F9F7] flex items-center justify-center overflow-hidden relative p-4">
      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 absolute top-4">Esquema Estático (Montante)</p>
      <BeamSVG 
        orientation="vertical" 
        supports={[inputs.supportBottom, inputs.supportTop]}
        length={inputs.height}
      />
    </div>
  );
}

function BeamSVG({ orientation, supports, length }: any) {
  const isVert = orientation === "vertical";
  const w = 240;
  const h = 160;
  const margin = 30;
  
  const x1 = isVert ? w/2 : margin;
  const y1 = isVert ? margin : h/2;
  const x2 = isVert ? w/2 : w - margin;
  const y2 = isVert ? h - margin : h/2;

  const beamLength = isVert ? (y2 - y1) : (x2 - x1);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="opacity-90">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141414" strokeWidth="3" />
      
      {supports.map((s: any, i: number) => {
        const progress = i === 0 ? 0 : 1;
        const sx = isVert ? w/2 : margin + (beamLength * progress);
        const sy = isVert ? margin + (beamLength * progress) : h/2;
        return <SupportMarker key={i} type={s} x={sx} y={sy} orientation={orientation} isStart={i === 0} />;
      })}

      <path 
        d={isVert 
          ? `M${w/2} ${y1} Q${w/2 + 30} ${h/2} ${w/2} ${y2}` 
          : `M${x1} ${h/2} Q${w/2} ${h/2 + 30} ${x2} ${h/2}`} 
        fill="none" 
        stroke="#086775" 
        strokeWidth="1.5" 
        strokeDasharray="4,2" 
      />

      <g className="text-[8px] font-bold fill-[#141414] opacity-60">
        {isVert ? (
          <>
            <line x1={w/2 - 40} y1={y1} x2={w/2 - 40} y2={y2} stroke="#141414" strokeWidth="0.5" />
            <text x={w/2 - 45} y={h/2} transform={`rotate(-90, ${w/2 - 45}, ${h/2})`} textAnchor="middle">{length}mm</text>
          </>
        ) : (
          <>
            <line x1={x1} y1={h/2 + 40} x2={x2} y2={h/2 + 40} stroke="#141414" strokeWidth="0.5" />
            <text x={w/2} y={h/2 + 50} textAnchor="middle">{length}mm</text>
          </>
        )}
      </g>
    </svg>
  );
}

function SupportMarker({ type, x, y, orientation, isStart }: any) {
  if (type === "free") return null;
  const isVert = orientation === "vertical";
  
  if (type === "fixed") {
    return <rect x={x - 10} y={y - 10} width={isVert ? 20 : 5} height={isVert ? 5 : 20} fill="#141414" />;
  }
  
  return (
    <path 
      d="M-6 0 L6 0 L0 -8 Z" 
      fill="#141414" 
      transform={`translate(${x}, ${y}) rotate(${isVert ? (isStart ? 0 : 180) : (isStart ? -90 : 90)})`} 
    />
  );
}
