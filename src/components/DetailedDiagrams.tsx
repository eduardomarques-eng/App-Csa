import React from "react";
import { Solution, CalculationMetrics } from "../core/types";

interface DetailedDiagramsProps {
  solution: Solution;
  metrics: CalculationMetrics;
}

export const DetailedDiagrams: React.FC<DetailedDiagramsProps> = ({
  solution,
  metrics,
}) => {
  const { effectiveSpan, totalLoad, structuralSystem, windMethod } = metrics;
  const { elu, els } = solution;

  // Constants for drawing
  const svgWidth = 600;
  const svgHeight = 150;
  const padding = 40;
  const drawWidth = svgWidth - padding * 2;
  const drawHeight = svgHeight - padding * 2;
  const midY = svgHeight / 2;

  // Helper to format numbers
  const fmt = (n: number) => n.toFixed(2);

  // 1. Esquema Estrutural
  const renderEsquemaEstrutural = () => {
    const totalLength = metrics.spans && metrics.spans.length > 0 
      ? metrics.spans.reduce((a, b) => a + b, 0) / 1000 
      : effectiveSpan;

    return (
      <div className="border border-[#006874] bg-white p-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[#006874]/10 pb-1">
          1. Esquema Estrutural
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Beam line */}
          <line x1={padding} y1={midY} x2={svgWidth - padding} y2={midY} stroke="#006874" strokeWidth="4" />
          
          {/* Supports */}
          {structuralSystem === "Biapoiado" || structuralSystem === "Contínuo" ? (
            <>
              {/* Left Support (Pinned) */}
              <polygon points={`${padding},${midY} ${padding - 10},${midY + 15} ${padding + 10},${midY + 15}`} fill="none" stroke="#006874" strokeWidth="2" />
              <line x1={padding - 15} y1={midY + 15} x2={padding + 15} y2={midY + 15} stroke="#006874" strokeWidth="2" />
              <text x={padding} y={midY + 30} fontSize="12" textAnchor="middle" fill="#006874" fontWeight="bold">A</text>
              
              {/* Intermediate Supports */}
              {metrics.spans && metrics.spans.length > 1 && metrics.spans.map((span, index) => {
                if (index === metrics.spans!.length - 1) return null; // Skip the last one as it's the right support
                
                // Calculate position based on cumulative span
                const cumulativeSpan = metrics.spans!.slice(0, index + 1).reduce((a, b) => a + b, 0) / 1000;
                const xPos = padding + (cumulativeSpan / totalLength) * drawWidth;
                
                const supportType = metrics.intermediateSupportTypes?.[index] || "pinned";
                
                return (
                  <g key={`int-support-${index}`}>
                    {supportType === "pinned" && (
                      <>
                        <polygon points={`${xPos},${midY} ${xPos - 10},${midY + 15} ${xPos + 10},${midY + 15}`} fill="none" stroke="#006874" strokeWidth="2" />
                        <line x1={xPos - 15} y1={midY + 15} x2={xPos + 15} y2={midY + 15} stroke="#006874" strokeWidth="2" />
                        <circle cx={xPos - 5} cy={midY + 18} r="3" fill="#006874" />
                        <circle cx={xPos + 5} cy={midY + 18} r="3" fill="#006874" />
                      </>
                    )}
                    {supportType === "fixed" && (
                      <rect x={xPos - 10} y={midY} width="20" height="15" fill="#006874" />
                    )}
                    {supportType === "free" && (
                      <text x={xPos} y={midY + 15} fontSize="10" textAnchor="middle" fill="#006874" opacity="0.5">Livre</text>
                    )}
                    <text x={xPos} y={midY + 30} fontSize="12" textAnchor="middle" fill="#006874" fontWeight="bold">{String.fromCharCode(66 + index)}</text>
                  </g>
                );
              })}

              {/* Right Support (Roller) */}
              <polygon points={`${svgWidth - padding},${midY} ${svgWidth - padding - 10},${midY + 15} ${svgWidth - padding + 10},${midY + 15}`} fill="none" stroke="#006874" strokeWidth="2" />
              <line x1={svgWidth - padding - 15} y1={midY + 15} x2={svgWidth - padding + 15} y2={midY + 15} stroke="#006874" strokeWidth="2" />
              <circle cx={svgWidth - padding - 5} cy={midY + 18} r="3" fill="#006874" />
              <circle cx={svgWidth - padding + 5} cy={midY + 18} r="3" fill="#006874" />
              <text x={svgWidth - padding} y={midY + 30} fontSize="12" textAnchor="middle" fill="#006874" fontWeight="bold">
                {metrics.spans && metrics.spans.length > 1 ? String.fromCharCode(65 + metrics.spans.length) : 'B'}
              </text>
            </>
          ) : structuralSystem === "Engastado" ? (
            <>
              {/* Left Fixed */}
              <rect x={padding - 10} y={midY - 20} width="10" height="40" fill="#006874" />
              <text x={padding - 20} y={midY + 5} fontSize="12" textAnchor="end" fill="#006874" fontWeight="bold">A</text>
              {/* Right Fixed */}
              <rect x={svgWidth - padding} y={midY - 20} width="10" height="40" fill="#006874" />
              <text x={svgWidth - padding + 20} y={midY + 5} fontSize="12" textAnchor="start" fill="#006874" fontWeight="bold">B</text>
            </>
          ) : structuralSystem === "Engastado-Apoiado" ? (
            <>
              {/* Left Fixed */}
              <rect x={padding - 10} y={midY - 20} width="10" height="40" fill="#006874" />
              <text x={padding - 20} y={midY + 5} fontSize="12" textAnchor="end" fill="#006874" fontWeight="bold">A</text>
              {/* Right Support (Roller) */}
              <polygon points={`${svgWidth - padding},${midY} ${svgWidth - padding - 10},${midY + 15} ${svgWidth - padding + 10},${midY + 15}`} fill="none" stroke="#006874" strokeWidth="2" />
              <line x1={svgWidth - padding - 15} y1={midY + 15} x2={svgWidth - padding + 15} y2={midY + 15} stroke="#006874" strokeWidth="2" />
              <circle cx={svgWidth - padding - 5} cy={midY + 18} r="3" fill="#006874" />
              <circle cx={svgWidth - padding + 5} cy={midY + 18} r="3" fill="#006874" />
              <text x={svgWidth - padding} y={midY + 30} fontSize="12" textAnchor="middle" fill="#006874" fontWeight="bold">B</text>
            </>
          ) : (
            // Consola (Cantilever)
            <>
              <rect x={padding - 10} y={midY - 20} width="10" height="40" fill="#006874" />
              <text x={padding - 20} y={midY + 5} fontSize="12" textAnchor="end" fill="#006874" fontWeight="bold">A</text>
            </>
          )}

          {/* Dimension Lines */}
          {metrics.spans && metrics.spans.length > 1 ? (
            <>
              {metrics.spans.map((span, index) => {
                const spanMeters = span / 1000;
                const prevCumulative = index === 0 ? 0 : metrics.spans!.slice(0, index).reduce((a, b) => a + b, 0) / 1000;
                const startX = padding + (prevCumulative / totalLength) * drawWidth;
                const endX = padding + ((prevCumulative + spanMeters) / totalLength) * drawWidth;
                const midX = (startX + endX) / 2;
                
                return (
                  <g key={`dim-${index}`}>
                    <line x1={startX} y1={svgHeight - 15} x2={endX} y2={svgHeight - 15} stroke="#006874" strokeWidth="1" />
                    <line x1={startX} y1={svgHeight - 20} x2={startX} y2={svgHeight - 10} stroke="#006874" strokeWidth="1" />
                    <line x1={endX} y1={svgHeight - 20} x2={endX} y2={svgHeight - 10} stroke="#006874" strokeWidth="1" />
                    <text x={midX} y={svgHeight - 20} fontSize="10" textAnchor="middle" fill="#006874">{fmt(spanMeters)} m</text>
                  </g>
                );
              })}
              {/* Total Length Dimension */}
              <line x1={padding} y1={svgHeight - 35} x2={svgWidth - padding} y2={svgHeight - 35} stroke="#006874" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={svgHeight - 40} x2={padding} y2={svgHeight - 30} stroke="#006874" strokeWidth="1" />
              <line x1={svgWidth - padding} y1={svgHeight - 40} x2={svgWidth - padding} y2={svgHeight - 30} stroke="#006874" strokeWidth="1" />
              <text x={svgWidth / 2} y={svgHeight - 40} fontSize="10" textAnchor="middle" fill="#006874" fontWeight="bold">L total = {fmt(totalLength)} m</text>
            </>
          ) : (
            <>
              <line x1={padding} y1={svgHeight - 15} x2={svgWidth - padding} y2={svgHeight - 15} stroke="#006874" strokeWidth="1" />
              <line x1={padding} y1={svgHeight - 20} x2={padding} y2={svgHeight - 10} stroke="#006874" strokeWidth="1" />
              <line x1={svgWidth - padding} y1={svgHeight - 20} x2={svgWidth - padding} y2={svgHeight - 10} stroke="#006874" strokeWidth="1" />
              <text x={svgWidth / 2} y={svgHeight - 20} fontSize="12" textAnchor="middle" fill="#006874" fontWeight="bold">L = {fmt(effectiveSpan)} m</text>
            </>
          )}
        </svg>
      </div>
    );
  };

  // 2. Diagrama de Carregamento
  const renderDiagramaCarregamento = () => {
    const arrowCount = 15;
    const arrowSpacing = drawWidth / (arrowCount - 1);
    
    return (
      <div className="border border-[#006874] bg-white p-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[#006874]/10 pb-1">
          2. Carregamento ({windMethod})
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Beam line */}
          <line x1={padding} y1={midY + 20} x2={svgWidth - padding} y2={midY + 20} stroke="#006874" strokeWidth="4" />
          
          {/* Load Arrows */}
          <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#086775" strokeWidth="2" />
          {Array.from({ length: arrowCount }).map((_, i) => {
            const x = padding + i * arrowSpacing;
            return (
              <g key={i}>
                <line x1={x} y1={padding} x2={x} y2={midY + 15} stroke="#086775" strokeWidth="1.5" />
                <polygon points={`${x},${midY + 20} ${x - 4},${midY + 12} ${x + 4},${midY + 12}`} fill="#086775" />
              </g>
            );
          })}
          
          <text x={svgWidth / 2} y={padding - 10} fontSize="14" textAnchor="middle" fill="#086775" fontWeight="bold">
            q = {fmt(totalLoad)} kN/m
          </text>
        </svg>
      </div>
    );
  };

  // 3. Esforço Cortante
  const renderEsforcoCortante = () => {
    const vMax = elu.shearSoliciting;
    const vRes = elu.shearResistant;
    let path = "";
    let resPath = "";
    
    if (structuralSystem === "Consola") {
      path = `M ${padding} ${midY} L ${padding} ${midY - 40} L ${svgWidth - padding} ${midY} Z`;
      resPath = `M ${padding} ${midY} L ${padding} ${midY - 60} L ${svgWidth - padding} ${midY - 60} L ${svgWidth - padding} ${midY} Z`;
    } else {
      // Biapoiado, Engastado
      path = `M ${padding} ${midY} L ${padding} ${midY - 40} L ${svgWidth - padding} ${midY + 40} L ${svgWidth - padding} ${midY} Z`;
      resPath = `M ${padding} ${midY} L ${padding} ${midY - 60} L ${svgWidth - padding} ${midY - 60} L ${svgWidth - padding} ${midY + 60} L ${padding} ${midY + 60} Z`;
    }

    return (
      <div className="border border-[#006874] bg-white p-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[#006874]/10 pb-1">
          3. Esforço Cortante (V)
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Zero line */}
          <line x1={padding} y1={midY} x2={svgWidth - padding} y2={midY} stroke="#006874" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Resistant Diagram (Background) */}
          <path d={resPath} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Soliciting Diagram (Foreground) */}
          <path d={path} fill="rgba(8, 103, 117, 0.2)" stroke="#086775" strokeWidth="2" />
          
          {/* Values */}
          {structuralSystem === "Consola" ? (
            <>
              <text x={padding + 5} y={midY - 45} fontSize="12" textAnchor="start" fill="#086775" fontWeight="bold">Vd = {fmt(vMax)} kN</text>
              <text x={padding + 5} y={midY - 65} fontSize="10" textAnchor="start" fill="#10b981">Vr = {fmt(vRes)} kN</text>
            </>
          ) : (
            <>
              <text x={padding + 5} y={midY - 45} fontSize="12" textAnchor="start" fill="#086775" fontWeight="bold">{fmt(vMax)} kN</text>
              <text x={padding + 5} y={midY - 65} fontSize="10" textAnchor="start" fill="#10b981">Vr = {fmt(vRes)} kN</text>
              
              <text x={svgWidth - padding - 5} y={midY + 55} fontSize="12" textAnchor="end" fill="#086775" fontWeight="bold">-{fmt(vMax)} kN</text>
              <text x={svgWidth - padding - 5} y={midY + 75} fontSize="10" textAnchor="end" fill="#10b981">Vr = -{fmt(vRes)} kN</text>
              
              <text x={svgWidth / 2} y={midY - 10} fontSize="10" textAnchor="middle" fill="#006874">V = 0 em L/2 ({fmt(effectiveSpan / 2)}m)</text>
            </>
          )}
        </svg>
      </div>
    );
  };

  // 4. Momento Fletor
  const renderMomentoFletor = () => {
    const mMax = elu.momentSoliciting;
    const mRes = elu.momentResistant;
    const isCritical = elu.verification.classificacao === "CRITICO";
    const isReprovado = elu.verification.classificacao === "REPROVADO";
    const color = isReprovado ? "#dc2626" : isCritical ? "#f97316" : "#086775";
    const fill = isReprovado ? "rgba(220, 38, 38, 0.2)" : isCritical ? "rgba(249, 115, 22, 0.2)" : "rgba(8, 103, 117, 0.2)";

    let path = "";
    let resPath = "";
    if (structuralSystem === "Consola") {
      path = `M ${padding} ${midY} Q ${padding + drawWidth / 2} ${midY} ${svgWidth - padding} ${midY - 50} L ${svgWidth - padding} ${midY} Z`;
      resPath = `M ${padding} ${midY} L ${padding} ${midY - 70} L ${svgWidth - padding} ${midY - 70} L ${svgWidth - padding} ${midY} Z`;
    } else if (structuralSystem === "Engastado") {
      path = `M ${padding} ${midY - 30} Q ${svgWidth / 2} ${midY + 60} ${svgWidth - padding} ${midY - 30} L ${svgWidth - padding} ${midY} L ${padding} ${midY} Z`;
      resPath = `M ${padding} ${midY - 70} L ${svgWidth - padding} ${midY - 70} L ${svgWidth - padding} ${midY + 70} L ${padding} ${midY + 70} Z`;
    } else {
      // Biapoiado
      path = `M ${padding} ${midY} Q ${svgWidth / 2} ${midY + 80} ${svgWidth - padding} ${midY} Z`;
      resPath = `M ${padding} ${midY} L ${padding} ${midY + 90} L ${svgWidth - padding} ${midY + 90} L ${svgWidth - padding} ${midY} Z`;
    }

    return (
      <div className="border border-[#006874] bg-white p-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[#006874]/10 pb-1">
          4. Momento Fletor (M)
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          <line x1={padding} y1={midY} x2={svgWidth - padding} y2={midY} stroke="#006874" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Resistant Diagram (Background) */}
          <path d={resPath} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Soliciting Diagram (Foreground) */}
          <path d={path} fill={fill} stroke={color} strokeWidth="2" />
          
          {structuralSystem === "Consola" ? (
            <>
              <text x={svgWidth - padding - 5} y={midY - 55} fontSize="12" textAnchor="end" fill={color} fontWeight="bold">Md = {fmt(mMax)} kNm</text>
              <text x={svgWidth - padding - 5} y={midY - 75} fontSize="10" textAnchor="end" fill="#10b981">Mr = {fmt(mRes)} kNm</text>
            </>
          ) : structuralSystem === "Engastado" ? (
            <>
              <text x={padding + 5} y={midY - 35} fontSize="10" textAnchor="start" fill={color}>-{fmt(mMax * 2/3)}</text>
              <text x={svgWidth - padding - 5} y={midY - 35} fontSize="10" textAnchor="end" fill={color}>-{fmt(mMax * 2/3)}</text>
              <text x={svgWidth / 2} y={midY + 55} fontSize="12" textAnchor="middle" fill={color} fontWeight="bold">Md = {fmt(mMax)} kNm</text>
              <text x={svgWidth / 2} y={midY + 75} fontSize="10" textAnchor="middle" fill="#10b981">Mr = {fmt(mRes)} kNm</text>
            </>
          ) : (
            <>
              <text x={svgWidth / 2} y={midY + 55} fontSize="12" textAnchor="middle" fill={color} fontWeight="bold">Md = {fmt(mMax)} kNm</text>
              <text x={svgWidth / 2} y={midY + 75} fontSize="10" textAnchor="middle" fill="#10b981">Mr = {fmt(mRes)} kNm</text>
            </>
          )}
        </svg>
      </div>
    );
  };

  // 5. Deslocamento
  const renderDeslocamento = () => {
    const dMax = els.deflection;
    const dLimit = els.deflectionLimit;
    const isCritical = els.verification.classificacao === "CRITICO";
    const isReprovado = els.verification.classificacao === "REPROVADO";
    const color = isReprovado ? "#dc2626" : isCritical ? "#f97316" : "#086775";

    let path = "";
    if (structuralSystem === "Consola") {
      path = `M ${padding} ${midY} Q ${padding + drawWidth / 2} ${midY} ${svgWidth - padding} ${midY + 40}`;
    } else {
      path = `M ${padding} ${midY} Q ${svgWidth / 2} ${midY + 60} ${svgWidth - padding} ${midY}`;
    }

    return (
      <div className="border border-[#006874] bg-white p-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 border-b border-[#006874]/10 pb-1">
          5. Deslocamento (Deformada)
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          <line x1={padding} y1={midY} x2={svgWidth - padding} y2={midY} stroke="#006874" strokeWidth="2" />
          <path d={path} fill="none" stroke={color} strokeWidth="3" strokeDasharray="6 4" />
          
          {structuralSystem === "Consola" ? (
            <>
              <line x1={svgWidth - padding} y1={midY} x2={svgWidth - padding} y2={midY + 40} stroke={color} strokeWidth="1" markerEnd="url(#arrow)" />
              <text x={svgWidth - padding - 10} y={midY + 25} fontSize="12" textAnchor="end" fill={color} fontWeight="bold">δmax = {fmt(dMax)} mm</text>
            </>
          ) : (
            <>
              <line x1={svgWidth / 2} y1={midY} x2={svgWidth / 2} y2={midY + 30} stroke={color} strokeWidth="1" />
              <text x={svgWidth / 2} y={midY + 45} fontSize="12" textAnchor="middle" fill={color} fontWeight="bold">δmax = {fmt(dMax)} mm</text>
            </>
          )}
          
          <text x={svgWidth - padding} y={padding} fontSize="10" textAnchor="end" fill="#006874">
            Limite (δadm) = {fmt(dLimit)} mm
          </text>
          <text x={svgWidth - padding} y={padding + 15} fontSize="10" textAnchor="end" fill={color} fontWeight="bold">
            Utilização = {fmt(els.ratio)}%
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderEsquemaEstrutural()}
        {renderDiagramaCarregamento()}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderEsforcoCortante()}
        {renderMomentoFletor()}
        {renderDeslocamento()}
      </div>
    </div>
  );
};
