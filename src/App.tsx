import { useState, ReactNode, useEffect } from "react";
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
  ChevronRight,
  Info,
  MapPin,
  ShieldCheck,
  Zap,
  LayoutGrid
} from "lucide-react";
import { MotorCalculoFachada, BRAZIL_REGIONS } from "./logic/calculator";
import { generatePDF } from "./logic/pdfGenerator";
import { CalcInputs, CalcResults, Profile, GlassType } from "./logic/types";

// Catálogo Simulado de Perfis Profissional
const CATALOG: Profile[] = [
  { code: "MP-40.001", weight: 1.15, ix: 8.4, wx: 4.2 },
  { code: "MP-40.002", weight: 1.45, ix: 15.6, wx: 7.8 },
  { code: "MP-40.080", weight: 2.35, ix: 52.4, wx: 13.1 },
  { code: "MP-50.100", weight: 3.80, ix: 168.2, wx: 33.6 },
  { code: "MP-50.150", weight: 5.10, ix: 485.0, wx: 64.7 },
  { code: "MP-60.200", weight: 6.80, ix: 1120.0, wx: 112.0 },
  { code: "MP-80.250", weight: 9.20, ix: 2450.0, wx: 196.0 },
];

type TabType = "geometry" | "wind" | "glass" | "memorial";

const ALUMINUM_SUPPLIERS = ["Hydro Alumínio", "Perfil Alumínio", "Alcoa", "CBA", "Alucom"];
const GLASS_SUPPLIERS = ["Cebrace", "Guardian", "Saint-Gobain", "PKO Vidros", "Viminas"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("geometry");
  const [inputs, setInputs] = useState<CalcInputs>({
    item: "pele-de-vidro",
    calculationMode: "standard",
    typology: "Fachada Grid",
    profileSeries: "Série 35 / 40",
    aluminumSupplier: ALUMINUM_SUPPLIERS[0],
    glassSupplier: GLASS_SUPPLIERS[0],
    region: BRAZIL_REGIONS[1].name,
    height: 3000,
    width: 1200,
    supports: ["pinned", "pinned"],
    spanDistances: [3000],
    supportOffset: 0,
    windSpeed: BRAZIL_REGIONS[1].v0,
    s1: 1.0,
    s2Category: 2,
    s2Class: "B",
    s3: 1.0,
    cp: -0.8,
    glassType: "laminated",
    glassThickness: 10,
    modulusOfElasticity: 70, // GPa
    allowableStress: 80, // MPa
  });

  const [results, setResults] = useState<CalcResults | null>(null);

  const handleInputChange = (field: keyof CalcInputs, value: any) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      
      // Auto-Optimization Logic
      if (field === "item") {
        if (value === "guarda-corpo") {
          newInputs.calculationMode = "railing";
          newInputs.supports = ["fixed", "free"];
          newInputs.spanDistances = [newInputs.height];
        } else if (value === "pele-de-vidro") {
          newInputs.calculationMode = "standard";
          newInputs.supports = ["pinned", "pinned", "pinned", "pinned"];
          const span = newInputs.height / 3;
          newInputs.spanDistances = [span, span, span];
        } else {
          newInputs.calculationMode = "standard";
          newInputs.supports = ["pinned", "pinned"];
          newInputs.spanDistances = [newInputs.height];
        }
      }
      return newInputs;
    });
  };

  const handleSupportChange = (index: number, value: SupportCondition) => {
    setInputs(prev => {
      const newSupports = [...prev.supports];
      newSupports[index] = value;
      return { ...prev, supports: newSupports };
    });
  };

  const handleSpanChange = (index: number, value: number) => {
    setInputs(prev => {
      const newSpans = [...prev.spanDistances];
      newSpans[index] = value;
      return { ...prev, spanDistances: newSpans };
    });
  };

  const handleRegionChange = (regionName: string) => {
    const region = BRAZIL_REGIONS.find(r => r.name === regionName);
    if (region) {
      setInputs(prev => ({ ...prev, region: region.name, windSpeed: region.v0 }));
    }
  };

  const runCalculation = () => {
    const res = MotorCalculoFachada.calculate(inputs, CATALOG);
    setResults(res);
  };

  // Auto-calculate on input change for real-time feel
  useEffect(() => {
    runCalculation();
  }, [inputs]);

  const downloadReport = () => {
    if (results) {
      generatePDF(inputs, results);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#086775] selection:text-[#E4E3E0]">
      {/* Professional Grid Header */}
      <header className="border-b border-[#141414] bg-[#E4E3E0] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto flex items-stretch h-20">
          <div className="flex items-center gap-4 px-8 border-r border-[#141414] bg-[#086775] text-[#E4E3E0]">
            <LayoutGrid size={28} />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">CSA EsquadriasCalc</h1>
              <span className="text-[10px] font-mono opacity-60">V.1.0 PRO</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-center px-8 gap-12 overflow-x-auto">
            <HeaderStat label="NORMA" value="NBR 6123:2023 / 7199:2025" />
            <HeaderStat label="PROJETO" value={inputs.typology || "Dimensionamento Executivo"} />
            <HeaderStat label="MODELO / SÉRIE" value={inputs.profileSeries} />
          </div>

          <div className="flex items-center px-8 border-l border-[#141414] gap-4">
            <button 
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Link do projeto copiado para a área de transferência!");
              }}
              className="flex items-center gap-2 border border-[#141414] px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
            >
              Compartilhar
            </button>
            <button 
              onClick={downloadReport}
              disabled={!results}
              className="flex items-center gap-2 bg-[#086775] text-[#E4E3E0] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-30"
            >
              <Download size={16} /> Exportar Memorial
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-3 border-r border-[#141414] bg-[#F0F0EE] overflow-y-auto">
          <div className="flex flex-col">
            <SidebarTab 
              active={activeTab === "geometry"} 
              onClick={() => setActiveTab("geometry")}
              icon={<Maximize2 size={18} />}
              label="01. Projeto & Fornecedores"
            />
            <SidebarTab 
              active={activeTab === "wind"} 
              onClick={() => setActiveTab("wind")}
              icon={<Wind size={18} />}
              label="02. Cargas de Vento"
            />
            <SidebarTab 
              active={activeTab === "glass"} 
              onClick={() => setActiveTab("glass")}
              icon={<Layers size={18} />}
              label="03. Vidro & Materiais"
            />
            <SidebarTab 
              active={activeTab === "memorial"} 
              onClick={() => setActiveTab("memorial")}
              icon={<FileText size={18} />}
              label="04. Memorial Descritivo"
            />
          </div>

          <div className="p-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "geometry" && (
                <motion.div key="geo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase opacity-50">Item / Tipologia</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={inputs.item}
                        onChange={(e) => handleInputChange("item", e.target.value)}
                        className="bg-transparent border border-[#141414] p-2 text-xs font-bold outline-none"
                      >
                        <option value="guarda-corpo">Guarda-corpo</option>
                        <option value="pele-de-vidro">Pele de Vidro</option>
                        <option value="janela">Janela</option>
                        <option value="porta">Porta</option>
                      </select>
                      <input 
                        type="text"
                        placeholder="Tipologia"
                        value={inputs.typology}
                        onChange={(e) => handleInputChange("typology", e.target.value)}
                        className="bg-transparent border border-[#141414] p-2 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase opacity-50">Modelo ou Série do Perfil</label>
                      <input 
                        type="text"
                        placeholder="Ex: Série 35, 40, Fachada Grid..."
                        value={inputs.profileSeries}
                        onChange={(e) => handleInputChange("profileSeries", e.target.value)}
                        className="w-full bg-transparent border border-[#141414] p-2 text-xs font-bold outline-none focus:bg-white"
                      />
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 text-[10px] leading-tight text-amber-900">
                      <p className="font-bold uppercase mb-1">Nota ao Projetista:</p>
                      Utilize os resultados de Inércia (Ix) e Módulo (Wx) para selecionar perfis e vidros adequados nos catálogos técnicos.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Altura Total" unit="mm" value={inputs.height} onChange={(v) => handleInputChange("height", v)} min={100} step={1} />
                    <InputGroup label="Largura Influência" unit="mm" value={inputs.width} onChange={(v) => handleInputChange("width", v)} min={100} step={1} />
                  </div>

                  <div className="space-y-4 p-4 bg-white border border-[#141414]">
                    <p className="text-[10px] font-black uppercase opacity-50 mb-2">Configuração de Apoios (Multi-Ponto)</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {inputs.supports.map((s, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[9px] font-bold uppercase opacity-40">Apoio {i + 1}</label>
                          <select 
                            value={s}
                            onChange={(e) => handleSupportChange(i, e.target.value as SupportCondition)}
                            className="w-full bg-transparent border border-[#141414] p-1 text-[10px] font-bold outline-none"
                          >
                            <option value="pinned">Apoio</option>
                            <option value="fixed">Engaste</option>
                            <option value="free">Livre</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase opacity-40">Vãos entre Apoios (mm)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {inputs.spanDistances.map((d, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[9px] font-mono opacity-40">{i+1}-{i+2}:</span>
                            <input 
                              type="number"
                              value={d}
                              onChange={(e) => handleSpanChange(i, Number(e.target.value))}
                              className="w-full bg-transparent border border-[#141414] p-1 text-[10px] font-bold outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                  <StructuralVisualizer inputs={inputs} />
                </motion.div>
              )}

              {activeTab === "wind" && (
                <motion.div key="wind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase opacity-50 flex items-center gap-1">
                      <MapPin size={12} /> Região (Isopetas 2023)
                    </label>
                    <select 
                      value={inputs.region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold focus:bg-white outline-none"
                    >
                      {BRAZIL_REGIONS.map(r => <option key={r.name} value={r.name}>{r.name} - {r.v0}m/s</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="S1 (Topog.)" unit="-" value={inputs.s1} onChange={(v) => handleInputChange("s1", v)} />
                    <InputGroup label="S3 (Estat.)" unit="-" value={inputs.s3} onChange={(v) => handleInputChange("s3", v)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase opacity-50">Rugosidade (S2 - Categoria)</label>
                    <select 
                      value={inputs.s2Category}
                      onChange={(e) => handleInputChange("s2Category", parseInt(e.target.value))}
                      className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold focus:bg-white outline-none"
                    >
                      <option value={1}>Cat. I (Mar aberto)</option>
                      <option value={2}>Cat. II (Campos abertos)</option>
                      <option value={3}>Cat. III (Vilas/Subúrbios)</option>
                      <option value={4}>Cat. IV (Cidades densas)</option>
                      <option value={5}>Cat. V (Centros urbanos)</option>
                    </select>
                  </div>
                  <InputGroup label="Coef. Pressão (Cp)" unit="-" value={inputs.cp} onChange={(v) => handleInputChange("cp", v)} />
                </motion.div>
              )}

              {activeTab === "glass" && (
                <motion.div key="glass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase opacity-50">Fornecedor Alumínio / Vidro</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={inputs.aluminumSupplier}
                        onChange={(e) => handleInputChange("aluminumSupplier", e.target.value)}
                        className="w-full bg-transparent border border-[#141414] p-2 text-xs font-bold outline-none"
                      >
                        {ALUMINUM_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select 
                        value={inputs.glassSupplier}
                        onChange={(e) => handleInputChange("glassSupplier", e.target.value)}
                        className="w-full bg-transparent border border-[#141414] p-2 text-xs font-bold outline-none"
                      >
                        {GLASS_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase opacity-50">Tipo de Vidro (NBR 7199:2025)</label>
                    <select 
                      value={inputs.glassType}
                      onChange={(e) => handleInputChange("glassType", e.target.value)}
                      className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold focus:bg-white outline-none"
                    >
                      <option value="monolithic">Monolítico Comum</option>
                      <option value="tempered">Temperado de Segurança</option>
                      <option value="laminated">Laminado de Segurança</option>
                    </select>
                  </div>
                  <InputGroup label="Espessura do Vidro" unit="mm" value={inputs.glassThickness} onChange={(v) => handleInputChange("glassThickness", v)} min={4} max={30} />
                </motion.div>
              )}

              {activeTab === "memorial" && (
                <motion.div key="memorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
                  <div className="bg-white border border-[#141414] p-8 space-y-8">
                    <div className="border-b border-[#141414] pb-6 flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tighter">Memorial Descritivo de Cálculo</h4>
                        <p className="text-xs opacity-60 mt-1">Validação Técnica - {inputs.typology}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Data do Cálculo</p>
                        <p className="text-xs font-bold">{new Date().toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <section className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-[#086775]">01. Critérios de Vento (NBR 6123)</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Velocidade Básica (V0):</span> <span className="font-bold">{inputs.windSpeed} m/s</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Fator Topográfico (S1):</span> <span className="font-bold">{inputs.s1}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Fator Estatístico (S3):</span> <span className="font-bold">{inputs.s3}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Velocidade Característica (Vk):</span> <span className="font-bold">{results?.vk.toFixed(2)} m/s</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Pressão Dinâmica (q):</span> <span className="font-bold">{results?.q.toFixed(3)} kN/m²</span></div>
                          </div>
                        </section>

                        <section className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-[#086775]">02. Dimensionamento Vidro (NBR 7199)</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Tipo de Vidro:</span> <span className="font-bold uppercase">{inputs.glassType}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Espessura:</span> <span className="font-bold">{inputs.glassThickness} mm</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Coeficiente Alpha:</span> <span className="font-bold">{results?.glassAlpha.toFixed(3)}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Tensão Calculada:</span> <span className="font-bold">{results?.glassStress.toFixed(2)} MPa</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Status:</span> <span className={`font-bold ${results?.glassPassed ? "text-green-600" : "text-red-600"}`}>{results?.glassPassed ? "APROVADO" : "REPROVADO"}</span></div>
                          </div>
                        </section>
                      </div>

                      <div className="space-y-6">
                        <section className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-[#086775]">03. Análise Estrutural (NBR 10821)</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Esquema Estático:</span> <span className="font-bold uppercase">{inputs.supportType}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Vão de Cálculo:</span> <span className="font-bold">{inputs.supportDistance} mm</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Coef. Momento (Km):</span> <span className="font-bold">{results?.momentCoefficient.toFixed(4)}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Coef. Flecha (Kf):</span> <span className="font-bold">{results?.deflectionCoefficient.toFixed(4)}</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Momento Fletor:</span> <span className="font-bold">{results?.maxMoment.toFixed(3)} kNm</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Inércia Requerida:</span> <span className="font-bold">{results?.requiredIx.toFixed(2)} cm⁴</span></div>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span>Módulo Requerido:</span> <span className="font-bold">{results?.requiredWx.toFixed(2)} cm³</span></div>
                          </div>
                        </section>

                        <section className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-[#086775]">04. Especificação Final</h5>
                          <div className="p-4 bg-gray-50 border border-gray-200 space-y-2 text-xs">
                            <div className="flex justify-between"><span>Perfil:</span> <span className="font-bold">{results?.selectedProfile?.code || "Consulte Catálogo"}</span></div>
                            <div className="flex justify-between"><span>Modelo/Série:</span> <span className="font-bold">{inputs.profileSeries}</span></div>
                            <div className="flex justify-between"><span>Fornecedor Alum.:</span> <span className="font-bold">{inputs.aluminumSupplier}</span></div>
                            <div className="flex justify-between"><span>Fornecedor Vidro:</span> <span className="font-bold">{inputs.glassSupplier}</span></div>
                          </div>
                        </section>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-[#141414] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Info size={20} className="text-[#086775]" />
                      <p className="text-[10px] leading-relaxed opacity-60 max-w-md">
                        Cálculo gerado via CSA EsquadriasCalc Pro 1.0. Este memorial é um documento de pré-dimensionamento. A validação final deve ser realizada por um engenheiro calculista habilitado com a respectiva emissão de ART/RRT.
                      </p>
                      </div>
                      <button 
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#086775] transition-all"
                      >
                        <Download size={14} /> Baixar PDF Oficial
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Main Dashboard */}
        <div className="lg:col-span-6 bg-[#E4E3E0] p-12 overflow-y-auto">
          <div className="space-y-12">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#141414] border border-[#141414]">
              <MetricBox label="Pressão Projeto" value={results?.windPressure.toFixed(3) || "0.000"} unit="kN/m²" />
              <MetricBox label="Pressão Dinâmica (q)" value={results?.q.toFixed(3) || "0.000"} unit="kN/m²" />
              <MetricBox label="Classe NBR 10821" value={results?.performanceClass || "-"} unit="Desempenho" />
            </div>

            {/* Structural Visualization */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                <h3 className="font-serif italic text-xl">Verificações NBR 7199 & 6123</h3>
                <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${results?.slsPassed && results?.ulsPassed && results?.glassPassed ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                  {results?.slsPassed && results?.ulsPassed && results?.glassPassed ? "Sistema Aprovado" : "Sistema Reprovado"}
                </div>
              </div>
              <div className="space-y-8">
                <ProgressBar 
                  label="Inércia do Perfil (SLS - Deformação)" 
                  current={results?.requiredIx || 0} 
                  max={results?.selectedProfile?.ix || 100} 
                  unit="cm⁴" 
                  subtext={`Limite Máx: ${results?.maxDeflection.toFixed(1)}mm (L/175)`}
                />
                <ProgressBar 
                  label="Resistência do Perfil (ULS - Ruptura)" 
                  current={results?.requiredWx || 0} 
                  max={results?.selectedProfile?.wx || 100} 
                  unit="cm³" 
                  subtext={`Tensão Adm: ${inputs.allowableStress} MPa`}
                />
                <ProgressBar 
                  label="Tensão no Vidro (Vento)" 
                  current={results?.glassStress || 0} 
                  max={inputs.glassType === "tempered" ? 50 : 20} 
                  unit="MPa" 
                />
              </div>
            </div>

            {/* Specification Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-[#141414] p-8 space-y-4 bg-white">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Especificação do Vidro</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black tracking-tighter">{results?.glassSpecification}</p>
                  <CheckCircle2 className={results?.glassPassed ? "text-green-600" : "text-red-600"} size={24} />
                </div>
                <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Fornecedor: {inputs.glassSupplier}</p>
              </div>

              <div className="border border-[#141414] p-8 space-y-4 bg-white">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Especificação do Perfil</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black tracking-tighter">{results?.selectedProfile?.code || "Selecione no Catálogo"}</p>
                  <ShieldCheck className={results?.slsPassed && results?.ulsPassed ? "text-green-600" : "text-red-600"} size={24} />
                </div>
                <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Série: {inputs.profileSeries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Summary */}
        <div className="lg:col-span-3 border-l border-[#141414] bg-[#F0F0EE] p-8 overflow-y-auto">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 pb-4 border-b border-[#141414]">Resumo Executivo</h3>
          <div className="space-y-6">
            <SummaryItem label="Estado Limite Serviço" passed={results?.slsPassed || false} />
            <SummaryItem label="Estado Limite Último" passed={results?.ulsPassed || false} />
            <SummaryItem label="Dimensionamento Vidro" passed={results?.glassPassed || false} />
            
            <div className="pt-8 border-t border-[#141414] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                <Zap size={14} /> DADOS DE ENTRADA
              </div>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex justify-between"><span>VÃO:</span> <span>{inputs.height}mm x {inputs.width}mm</span></div>
                <div className="flex justify-between"><span>V0:</span> <span>{inputs.windSpeed} m/s</span></div>
                <div className="flex justify-between"><span>S1/S2/S3:</span> <span>{inputs.s1} / {results?.vk ? (results.vk / (inputs.windSpeed * inputs.s1 * inputs.s3)).toFixed(2) : "-"} / {inputs.s3}</span></div>
                <div className="flex justify-between"><span>VIDRO:</span> <span>{inputs.glassThickness}mm ({inputs.glassType})</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold uppercase opacity-40 tracking-widest">{label}</span>
      <span className="text-xs font-black uppercase tracking-tight">{value}</span>
    </div>
  );
}

function StructuralVisualizer({ inputs }: { inputs: CalcInputs }) {
  const isRailing = inputs.calculationMode === "railing";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Vertical Analysis */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Análise Vertical (Montante)</p>
        <div className="h-48 border border-dashed border-[#141414] bg-[#F9F9F7] flex items-center justify-center overflow-hidden relative p-4">
          <BeamSVG 
            orientation="vertical" 
            supports={inputs.supports}
            spanDistances={inputs.spanDistances}
            length={inputs.height}
          />
        </div>
      </div>

      {/* Horizontal Analysis (Only for Standard) */}
      {!isRailing && (
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-center">Análise Horizontal (Travessa)</p>
          <div className="h-48 border border-dashed border-[#141414] bg-[#F9F9F7] flex items-center justify-center overflow-hidden relative p-4">
            <BeamSVG 
              orientation="horizontal" 
              supports={["pinned", "pinned"]}
              spanDistances={[inputs.width]}
              length={inputs.width}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BeamSVG({ orientation, supports, spanDistances, length }: any) {
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
      {/* Beam */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141414" strokeWidth="3" />
      
      {/* Supports */}
      {supports.map((s: any, i: number) => {
        let currentPos = 0;
        for (let j = 0; j < i; j++) {
          currentPos += spanDistances[j];
        }
        const progress = currentPos / length;
        const sx = isVert ? w/2 : margin + (beamLength * progress);
        const sy = isVert ? margin + (beamLength * progress) : h/2;
        return <SupportMarker key={i} type={s} x={sx} y={sy} orientation={orientation} isStart={i === 0} />;
      })}

      {/* Moment Diagram (Symbolic) */}
      <path 
        d={isVert 
          ? `M${w/2} ${y1} Q${w/2 + 30} ${h/2} ${w/2} ${y2}` 
          : `M${x1} ${h/2} Q${w/2} ${h/2 + 30} ${x2} ${h/2}`} 
        fill="none" 
        stroke="#086775" 
        strokeWidth="1.5" 
        strokeDasharray="4,2" 
      />

      {/* Dimensions */}
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

function SidebarTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-8 py-6 text-xs font-bold uppercase tracking-widest border-b border-[#141414] transition-all ${
        active ? "bg-[#086775] text-[#E4E3E0]" : "hover:bg-[#E4E3E0]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputGroup({ label, unit, value, onChange, min, max, step = 0.01 }: { 
  label: string, unit: string, value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number 
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase opacity-50">{label}</label>
        <span className="text-[9px] font-mono bg-[#141414] text-[#E4E3E0] px-1.5 py-0.5">{unit}</span>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-transparent border border-[#141414] p-3 text-sm font-bold focus:bg-white outline-none transition-all"
      />
    </div>
  );
}

function MetricBox({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="bg-[#E4E3E0] p-8 flex flex-col justify-between h-40">
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</span>
      <div>
        <span className="text-4xl font-black tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold uppercase ml-2 opacity-50">{unit}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, current, max, unit, subtext }: { label: string, current: number, max: number, unit: string, subtext?: string }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isOver = current > max;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span className={isOver ? "text-red-600" : "opacity-50"}>{current.toFixed(2)} / {max.toFixed(2)} {unit}</span>
      </div>
      <div className="h-4 bg-[#D1D1D1] border border-[#141414] relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${isOver ? "bg-red-600" : "bg-[#086775]"}`}
        />
      </div>
      {subtext && <p className="text-[9px] font-mono opacity-40 uppercase">{subtext}</p>}
    </div>
  );
}

function SummaryItem({ label, passed }: { label: string, passed: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 border border-[#141414] bg-[#E4E3E0]">
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {passed ? (
        <div className="flex items-center gap-1 text-green-700">
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-black">OK</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black">FAIL</span>
        </div>
      )}
    </div>
  );
}
