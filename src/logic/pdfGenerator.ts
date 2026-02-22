import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CalcInputs, CalcResults } from "./types";

export const generatePDF = (inputs: CalcInputs, results: CalcResults) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho Profissional
  doc.setFillColor(8, 103, 117); // #086775
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("CSA ESQUADRIASCALC PRO 1.0", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("MEMORIAL DE CÁLCULO ESTRUTURAL - DIMENSIONAMENTO EXECUTIVO", 20, 28);
  doc.text(`DATA: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - 20, 28, { align: "right" });

  // 1. Normas de Referência
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. NORMAS TÉCNICAS DE REFERÊNCIA", 20, 55);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const norms = [
    "- NBR 6123: Forças devidas ao vento em edificações",
    "- NBR 7199: Projeto, execução e aplicações de vidros na construção civil",
    "- NBR 10821: Esquadrias externas para edificações",
    "- NBR 15575: Edificações habitacionais - Desempenho",
  ];
  norms.forEach((norm, i) => doc.text(norm, 25, 62 + (i * 5)));

  // 2. Dados de Entrada
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. PARÂMETROS DE PROJETO", 20, 90);
  
  const inputData = [
    ["Item / Tipologia", `${inputs.item.toUpperCase()} - ${inputs.typology}`, "Projeto"],
    ["Modelo / Série", inputs.profileSeries, "Projeto"],
    ["Fornecedor Alumínio", inputs.aluminumSupplier, "Suprimentos"],
    ["Fornecedor Vidro", inputs.glassSupplier, "Suprimentos"],
    ["Região (Isopetas 2023)", inputs.region, "NBR 6123"],
    ["Velocidade Básica (V0)", `${inputs.windSpeed} m/s`, "NBR 6123"],
    ["Altura Total", `${inputs.height.toFixed(0)} mm`, "Geometria"],
    ["Largura de Influência", `${inputs.width.toFixed(0)} mm`, "Geometria"],
    ["Início / Fim Trecho", `${inputs.supports[0].toUpperCase()} / ${inputs.supports[inputs.supports.length-1].toUpperCase()}`, "Cálculo"],
    ["Nº de Apoios Totais", `${inputs.supports.length} un`, "Cálculo"],
    ["Vãos de Cálculo", inputs.spanDistances.map(d => `${d}mm`).join(" / "), "Cálculo"],
    ["Tipo de Vidro", inputs.glassType.toUpperCase(), "NBR 7199"],
    ["Espessura do Vidro", `${inputs.glassThickness} mm`, "NBR 7199"],
  ];

  autoTable(doc, {
    startY: 95,
    head: [["Parâmetro", "Valor", "Referência"]],
    body: inputData,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20] },
    styles: { fontSize: 8 },
  });

  // 3. Resultados do Vento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. ANÁLISE DE CARGAS DE VENTO (NBR 6123:2023)", 20, (doc as any).lastAutoTable.finalY + 15);

  const windResults = [
    ["Velocidade Característica (Vk)", `${results.vk.toFixed(2)} m/s`],
    ["Pressão Dinâmica (q)", `${results.q.toFixed(3)} kN/m²`],
    ["Coeficiente de Pressão (Cp)", inputs.cp.toFixed(2)],
    ["Pressão de Projeto Final", `${results.windPressure.toFixed(3)} kN/m²`],
    ["Classe de Desempenho", results.performanceClass],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Análise de Vento", "Resultado"]],
    body: windResults,
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });

  // 4. Verificações Estruturais (NBR 7199:2025)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. VERIFICAÇÕES ESTRUTURAIS", 20, (doc as any).lastAutoTable.finalY + 15);

  const structuralData = [
    ["Momento Fletor de Projeto", `${results.maxMoment.toFixed(3)} kNm`],
    ["Coef. Momento (Km)", results.momentCoefficient.toFixed(4)],
    ["Coef. Flecha (Kf)", results.deflectionCoefficient.toFixed(4)],
    ["Inércia Requerida (Ix_req)", `${results.requiredIx.toFixed(2)} cm⁴`],
    ["Módulo Requerido (Wx_req)", `${results.requiredWx.toFixed(2)} cm³`],
    ["Tensão no Vidro (Vento)", `${results.glassStress.toFixed(2)} MPa`],
    ["Coeficiente Alpha (Vidro)", results.glassAlpha.toFixed(3)],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Verificação", "Valor Calculado"]],
    body: structuralData,
    theme: "grid",
    headStyles: { fillColor: [60, 60, 60] },
    styles: { fontSize: 9 },
  });

  // 5. Especificação Técnica Recomendada
  if (results.selectedProfile || true) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. ESPECIFICAÇÃO TÉCNICA RECOMENDADA", 20, (doc as any).lastAutoTable.finalY + 15);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Nota: O projetista deve selecionar perfis e vidros que atendam aos requisitos de Ix e Wx abaixo.", 20, (doc as any).lastAutoTable.finalY + 20);

    const specData = [
      ["Componente", "Requisito / Especificação", "Status Final"],
      ["Perfil de Alumínio", `Ix min: ${results.requiredIx.toFixed(2)} cm4 / Wx min: ${results.requiredWx.toFixed(2)} cm3`, results.slsPassed && results.ulsPassed ? "APROVADO" : "VERIFICAR"],
      ["Vidro de Segurança", results.glassSpecification, results.glassPassed ? "APROVADO" : "REPROVADO"],
      ["Série Recomendada", inputs.profileSeries, "PROJETO"],
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [specData[0]],
      body: specData.slice(1),
      theme: "striped",
      headStyles: { fillColor: [20, 20, 20] },
      styles: { fontSize: 9 },
    });
  }

  // 6. DIAGRAMAS E DETALHAMENTO ESTRUTURAL
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("6. DIAGRAMAS E DETALHAMENTO ESTRUTURAL", 20, 20);

  const drawDiagram = (y: number, title: string, supports: string[], spanDistances: number[], totalLength: number) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, y);
    
    const startX = 40;
    const endX = 170;
    const beamY = y + 40;
    const beamW = endX - startX;

    // Beam
    doc.setLineWidth(1);
    doc.setDrawColor(20, 20, 20);
    doc.line(startX, beamY, endX, beamY);

    // Load Arrows (Cargas)
    doc.setDrawColor(8, 103, 117);
    doc.setLineWidth(0.2);
    for (let i = 0; i <= 10; i++) {
      const x = startX + (beamW / 10) * i;
      doc.line(x, beamY - 15, x, beamY - 2);
      doc.line(x - 1, beamY - 5, x, beamY - 2);
      doc.line(x + 1, beamY - 5, x, beamY - 2);
    }
    doc.setFontSize(7);
    doc.setTextColor(8, 103, 117);
    doc.text(`Carga Distribuída: ${results.totalLoad.toFixed(3)} kN/m`, startX, beamY - 18);

    // Supports (Apoios)
    doc.setDrawColor(20, 20, 20);
    doc.setTextColor(20, 20, 20);
    const drawSupport = (x: number, type: string) => {
      if (type === "fixed") {
        doc.rect(x - 2, beamY - 5, 4, 10, "F");
      } else if (type === "pinned") {
        doc.triangle(x, beamY, x - 3, beamY + 5, x + 3, beamY + 5, "F");
      }
    };

    supports.forEach((s, i) => {
      let currentPos = 0;
      for (let j = 0; j < i; j++) {
        currentPos += spanDistances[j];
      }
      const progress = currentPos / totalLength;
      drawSupport(startX + (beamW * progress), s);
    });

    // Moment Diagram (Symbolic Curve)
    doc.setDrawColor(8, 103, 117);
    doc.setLineDashPattern([2, 1], 0);
    doc.lines([[beamW/2, 20, beamW, 0]], startX, beamY, [1, 1], "S");
    doc.setLineDashPattern([], 0);
    doc.text(`Momento Máx: ${results.maxMoment.toFixed(3)} kNm`, startX + beamW/2, beamY + 25, { align: "center" });

    // Dimensions (Cotas)
    doc.setDrawColor(150, 150, 150);
    doc.line(startX, beamY + 10, endX, beamY + 10);
    doc.line(startX, beamY + 8, startX, beamY + 12);
    doc.line(endX, beamY + 8, endX, beamY + 12);
    doc.setFontSize(8);
    doc.text(`${totalLength.toFixed(0)} mm`, startX + beamW/2, beamY + 15, { align: "center" });

    return y + 80;
  };

  let nextY = 35;
  nextY = drawDiagram(nextY, "6.1. Diagrama de Análise Vertical (Montante)", inputs.supports, inputs.spanDistances, inputs.height);
  
  if (inputs.calculationMode !== "railing") {
    drawDiagram(nextY, "6.2. Diagrama de Análise Horizontal (Travessa)", ["pinned", "pinned"], [inputs.width], inputs.width);
  }

  // Rodapé
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Este documento é um memorial de cálculo gerado automaticamente e deve ser validado por um engenheiro responsável (ART).", pageWidth / 2, finalY, { align: "center" });
  doc.text("CSA EsquadriasCalc Pro 1.0 - Tecnologia para Engenharia de Esquadrias", pageWidth / 2, finalY + 5, { align: "center" });

  doc.save(`Memorial_CSA_Esquadria_${inputs.region.split(" ")[0]}.pdf`);
};
