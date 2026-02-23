import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CalcInputs, CalcResults } from "./types";
import { TYPOLOGIES } from "./constants";

export const generatePDF = (inputs: CalcInputs, results: CalcResults) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const typology = TYPOLOGIES.find(t => t.id === inputs.typologyId) || TYPOLOGIES[0];

  // Cabeçalho Profissional
  doc.setFillColor(8, 103, 117); // #086775
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ESQUADRIASCALC PRO", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("MEMORIAL DE CÁLCULO ESTRUTURAL - DIMENSIONAMENTO EXECUTIVO", 20, 28);
  doc.text(`DATA: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - 20, 28, { align: "right" });

  // 1. Dados de Entrada
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. PARÂMETROS DE PROJETO", 20, 55);
  
  const inputData = [
    ["Categoria", inputs.category.toUpperCase(), "Projeto"],
    ["Tipologia", typology.name, "Projeto"],
    ["Região", inputs.region, "NBR 6123"],
    ["Velocidade Básica (V0)", `${inputs.windSpeed} m/s`, "NBR 6123"],
    ["Altura Total", `${inputs.height.toFixed(0)} mm`, "Geometria"],
    ["Largura de Influência", `${inputs.width.toFixed(0)} mm`, "Geometria"],
    ["Apoio Base / Topo", `${inputs.supportBottom.toUpperCase()} / ${inputs.supportTop.toUpperCase()}`, "Cálculo"],
    ["Tipo de Vidro", inputs.glassType.toUpperCase(), "NBR 7199"],
    ["Espessura do Vidro", `${inputs.glassThickness} mm`, "NBR 7199"],
  ];

  autoTable(doc, {
    startY: 60,
    head: [["Parâmetro", "Valor", "Referência"]],
    body: inputData,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20] },
    styles: { fontSize: 8 },
  });

  // 2. Resultados do Vento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. ANÁLISE DE VENTO (NBR 6123)", 20, (doc as any).lastAutoTable.finalY + 15);

  const windResults = [
    ["Velocidade Característica (Vk)", `${results.vk.toFixed(2)} m/s`],
    ["Pressão Dinâmica (q)", `${results.q.toFixed(3)} kN/m²`],
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

  // 3. Melhor Solução Encontrada
  if (results.bestSolution) {
    const sol = results.bestSolution;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. SOLUÇÃO RECOMENDADA", 20, (doc as any).lastAutoTable.finalY + 15);

    const solData = [
      ["Perfil Selecionado", sol.profile.code],
      ["Série", sol.profile.series],
      ["Inércia (Ix)", `${sol.profile.ix.toFixed(2)} cm4`],
      ["Flecha Calculada", `${sol.deflection.toFixed(2)} mm`],
      ["Limite de Flecha", `${sol.deflectionLimit.toFixed(2)} mm`],
      ["Índice de Uso", `${sol.usageIndex.toFixed(1)}%`],
      ["Status", sol.isApproved ? "APROVADO" : "REPROVADO"],
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Item", "Especificação"]],
      body: solData,
      theme: "grid",
      headStyles: { fillColor: [8, 103, 117] },
      styles: { fontSize: 9 },
    });
  }

  // Rodapé
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Este documento é um memorial de cálculo gerado automaticamente e deve ser validado por um engenheiro responsável (ART).", pageWidth / 2, finalY, { align: "center" });
  doc.text("EsquadriasCalc Pro - Tecnologia para Engenharia de Esquadrias", pageWidth / 2, finalY + 5, { align: "center" });

  doc.save(`Memorial_Calculo_${inputs.region.split(" ")[0]}.pdf`);
};
