import React from 'react';
import { CalculationMetrics, Solution, ValidatedConfig } from '../core/types';

interface CalculationMemoryProps {
  metrics: CalculationMetrics;
  solution: Solution;
  solutions: Solution[];
  state: ValidatedConfig;
}

export const CalculationMemory: React.FC<CalculationMemoryProps> = ({ metrics, solution, solutions, state }) => {
  return (
    <div className="mt-12 space-y-6">
      <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
        Memória de Cálculo Detalhada
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Normas Aplicadas */}
        <div className="bg-[#F9F9F7] p-6 border border-[#006874]">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
            Normas de Referência Aplicadas
          </h4>
          <ul className="space-y-3 text-[10px] opacity-80">
            <li>
              <span className="font-bold">ABNT NBR 6123:1988</span> - Forças devidas ao vento em edificações.
              <br />
              <span className="opacity-70">Cálculo da pressão dinâmica do vento (q) considerando velocidade básica (V0), fatores topográficos (S1), rugosidade/dimensões (S2) e estatísticos (S3).</span>
            </li>
            <li>
              <span className="font-bold">ABNT NBR 10821:2017</span> - Esquadrias para edificações.
              <br />
              <span className="opacity-70">Critérios de desempenho estrutural, limites de flecha e pressões de ensaio.</span>
            </li>
            <li>
              <span className="font-bold">ABNT NBR 7199:2016</span> - Vidros na construção civil.
              <br />
              <span className="opacity-70">Projeto, execução e aplicações de vidros, cálculo de espessura e tensão admissível.</span>
            </li>
            <li>
              <span className="font-bold">ABNT NBR 14718:2019</span> - Guarda-corpos para edificação.
              <br />
              <span className="opacity-70">Requisitos, cargas horizontais e verticais de projeto.</span>
            </li>
          </ul>
        </div>

        {/* Detalhamento do Vento */}
        <div className="bg-[#F9F9F7] p-6 border border-[#006874]">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
            Ação do Vento (NBR 6123)
          </h4>
          <ul className="space-y-2 text-[10px] opacity-80">
            <li><span className="font-bold">Velocidade Básica (V0):</span> {state.windSpeed} m/s</li>
            <li><span className="font-bold">Fator Topográfico (S1):</span> {state.s1.toFixed(2)}</li>
            <li><span className="font-bold">Fator de Rugosidade (S2):</span> {metrics.vk ? (metrics.vk / (state.windSpeed * state.s1 * state.s3)).toFixed(2) : "N/A"} (Cat. {state.s2Category}, Classe {state.s2Class})</li>
            <li><span className="font-bold">Fator Estatístico (S3):</span> {state.s3.toFixed(2)}</li>
            <li><span className="font-bold">Velocidade Característica (Vk):</span> {metrics.vk ? metrics.vk.toFixed(2) : "N/A"} m/s</li>
            <li><span className="font-bold">Pressão Dinâmica (q):</span> {metrics.q ? (metrics.q * 1000).toFixed(2) : "N/A"} Pa</li>
            <li><span className="font-bold">Coeficiente de Pressão (Cp):</span> {state.cp.toFixed(2)}</li>
            <li><span className="font-bold">Pressão de Projeto:</span> {(metrics.windPressure * 1000).toFixed(2)} Pa ({metrics.windPressure.toFixed(2)} kN/m²)</li>
          </ul>
        </div>

        {/* Verificação ELU */}
        <div className="bg-[#F9F9F7] p-6 border border-[#006874]">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
            Estado Limite Último (ELU)
          </h4>
          <ul className="space-y-2 text-[10px] opacity-80">
            <li><span className="font-bold">Momento Solicitante (Md):</span> {solution.elu.momentSoliciting.toFixed(3)} kNm</li>
            <li><span className="font-bold">Momento Resistente (Mr):</span> {solution.elu.momentResistant.toFixed(3)} kNm</li>
            <li><span className="font-bold">Cortante Solicitante (Vd):</span> {solution.elu.shearSoliciting.toFixed(3)} kN</li>
            <li><span className="font-bold">Cortante Resistente (Vr):</span> {solution.elu.shearResistant.toFixed(3)} kN</li>
            <li><span className="font-bold">Tensão Admissível do Alumínio:</span> {state.allowableStress} MPa</li>
            <li><span className="font-bold">Índice de Uso (ELU):</span> {solution.elu.usageIndex.toFixed(1)}%</li>
            <li><span className="font-bold">Margem de Segurança:</span> {solution.elu.safetyMargin.toFixed(1)}%</li>
            <li>
              <span className="font-bold">Status ELU:</span>{" "}
              <span className={`font-bold ${
                solution.elu.verification.classificacao === "APROVADO_CONFORTO" ? "text-emerald-600" :
                solution.elu.verification.classificacao === "APROVADO_LIMITE" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {solution.elu.verification.classificacao.replace("_", " ")}
              </span>
            </li>
          </ul>
        </div>

        {/* Verificação ELS */}
        <div className="bg-[#F9F9F7] p-6 border border-[#006874]">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
            Estado Limite de Serviço (ELS)
          </h4>
          <ul className="space-y-2 text-[10px] opacity-80">
            <li><span className="font-bold">Módulo de Elasticidade (E):</span> {state.modulusOfElasticity} GPa</li>
            <li><span className="font-bold">Inércia do Perfil (Ix):</span> {solution.profile.ix.toFixed(2)} cm⁴</li>
            <li><span className="font-bold">Flecha Calculada:</span> {solution.els.deflection.toFixed(2)} mm</li>
            <li><span className="font-bold">Flecha Admissível (Limite):</span> {solution.els.deflectionLimit.toFixed(2)} mm</li>
            <li><span className="font-bold">Índice de Uso (ELS):</span> {solution.els.ratio.toFixed(1)}%</li>
            <li>
              <span className="font-bold">Status ELS:</span>{" "}
              <span className={`font-bold ${
                solution.els.verification.classificacao === "APROVADO_CONFORTO" ? "text-emerald-600" :
                solution.els.verification.classificacao === "APROVADO_LIMITE" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {solution.els.verification.classificacao.replace("_", " ")}
              </span>
            </li>
          </ul>
        </div>

        {/* Eficiência dos Itens Escolhidos */}
        <div className="bg-[#F9F9F7] p-6 border border-[#006874] md:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
            Eficiência da Solução Escolhida
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Perfil de Alumínio</p>
              <p className="text-sm font-black">{solution.profile.code}</p>
              <p className="text-[10px] opacity-80 mt-1">Eficiência Estrutural: <span className="font-bold">{solution.globalEfficiency.toFixed(1)}%</span></p>
              <p className="text-[10px] opacity-80">Peso Estimado: <span className="font-bold">{solution.profile.weight.toFixed(2)} kg/m</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Especificação do Vidro</p>
              <p className="text-sm font-black">{solution.glass.thickness}mm {solution.glass.type}</p>
              <p className="text-[10px] opacity-80 mt-1">Tensão Admissível: <span className="font-bold">{solution.glass.admissibleStress} MPa</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Status Global</p>
              <p className={`text-sm font-black ${
                solution.isApproved ? "text-emerald-600" : "text-red-600"
              }`}>
                {solution.isApproved ? "SOLUÇÃO APROVADA" : "SOLUÇÃO REPROVADA"}
              </p>
              <p className="text-[10px] opacity-80 mt-1">
                {solution.isApproved 
                  ? "Atende a todos os critérios normativos com segurança."
                  : "Não atende aos critérios mínimos exigidos por norma."}
              </p>
            </div>
          </div>
        </div>

        {/* Modelos Sugeridos (Top 3) */}
        {solutions.length > 1 && (
          <div className="bg-[#F9F9F7] p-6 border border-[#006874] md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-[#006874]/10 pb-2">
              Modelos Sugeridos (Alternativas Viáveis)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {solutions
                .filter(s => s.isApproved && s.id !== solution.id)
                .slice(0, 3)
                .map((alt, idx) => (
                  <div key={alt.id} className="border border-[#006874]/20 p-4 bg-white">
                    <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Opção {idx + 1}</p>
                    <p className="text-xs font-black">{alt.profile.code}</p>
                    <p className="text-[10px] opacity-80 mb-2">{alt.glass.thickness}mm {alt.glass.type}</p>
                    <div className="space-y-1 text-[9px]">
                      <div className="flex justify-between">
                        <span className="opacity-60">Uso ELU:</span>
                        <span className="font-bold">{alt.elu.usageIndex.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Flecha:</span>
                        <span className="font-bold">{alt.els.deflection.toFixed(2)} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Eficiência:</span>
                        <span className="font-bold">{alt.globalEfficiency.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              {solutions.filter(s => s.isApproved && s.id !== solution.id).length === 0 && (
                <p className="text-[10px] opacity-60 italic col-span-3">Nenhuma outra alternativa viável encontrada para os parâmetros atuais.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
