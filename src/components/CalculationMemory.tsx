import React from 'react';
import { CalculationMetrics, Solution, ValidatedConfig } from '../core/types';

interface CalculationMemoryProps {
  metrics: CalculationMetrics;
  solution: Solution;
  state: ValidatedConfig;
}

export const CalculationMemory: React.FC<CalculationMemoryProps> = ({ metrics, solution, state }) => {
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
            {state.category === "guarda-corpo" && (
              <li>
                <span className="font-bold">ABNT NBR 14718:2019</span> - Guarda-corpos para edificação.
                <br />
                <span className="opacity-70">Requisitos, cargas horizontais e verticais de projeto.</span>
              </li>
            )}
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
            <li><span className="font-bold">Status ELU:</span> {solution.elu.passed ? "APROVADO" : "REPROVADO"}</li>
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
            <li><span className="font-bold">Status ELS:</span> {solution.els.passed ? "APROVADO" : "REPROVADO"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
