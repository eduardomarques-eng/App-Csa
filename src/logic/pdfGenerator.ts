import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ConfigState, CalculationMetrics, Solution } from "../core/types";
import { TYPOLOGIES } from "../core/constants";

export const generatePDF = (state: ConfigState, data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const typology =
    TYPOLOGIES.find((t) => t.id === state.typologyId) || TYPOLOGIES[0];

  // Cabeçalho Profissional
  doc.setFillColor(8, 103, 117); // #086775
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ESQUADRIASCALC PRO", 20, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "MEMORIAL DE CÁLCULO ESTRUTURAL - DIMENSIONAMENTO EXECUTIVO",
    20,
    28,
  );
  doc.text(
    `DATA: ${new Date().toLocaleDateString("pt-BR")}`,
    pageWidth - 20,
    28,
    { align: "right" },
  );

  // 1. Dados de Entrada
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. PARÂMETROS DE PROJETO", 20, 55);

  const inputData = [
    ["Categoria", state.category.toUpperCase(), "Projeto"],
    ["Tipologia", typology.name, "Projeto"],
    ["Região", state.region || "N/A", "NBR 6123"],
    ["Velocidade Básica (V0)", `${state.windSpeed || 0} m/s`, "NBR 6123"],
    ["Pressão Túnel de Vento", `${state.windTunnelPressure || 0} Pa`, "Ensaio"],
    ["Altura Total", `${Number(state.height || 0).toFixed(0)} mm`, "Geometria"],
    [
      "Largura de Influência",
      `${Number(state.width || 0).toFixed(0)} mm`,
      "Geometria",
    ],
    [
      "Apoio Base / Topo",
      `${state.supportBottom.toUpperCase()} / ${state.supportTop.toUpperCase()}`,
      "Cálculo",
    ],
    ["Tipo de Vidro", state.glassType.toUpperCase(), "NBR 7199"],
    ["Espessura do Vidro", `${data.bestSolution?.glass.thickness || 0} mm`, "NBR 7199"],
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
  doc.text(
    "2. ANÁLISE DE VENTO (NBR 6123)",
    20,
    (doc as any).lastAutoTable.finalY + 15,
  );

  const windResults = [
    ["Velocidade Característica (Vk)", `${data.vk.toFixed(2)} m/s`],
    ["Pressão Dinâmica (q)", `${data.q.toFixed(3)} kN/m²`],
    ["Pressão de Projeto Final", `${data.windPressure.toFixed(3)} kN/m²`],
    ["Carga Linear no Perfil", `${data.totalLoad.toFixed(2)} kN/m`],
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
  if (data.bestSolution) {
    const sol = data.bestSolution as Solution;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      "3. SOLUÇÃO RECOMENDADA",
      20,
      (doc as any).lastAutoTable.finalY + 15,
    );

    const solData = [
      ["Perfil Selecionado", sol.profile.code],
      ["Série", sol.profile.series],
      ["Sistema Estrutural", data.structuralSystem],
      ["Inércia (Ix)", `${sol.profile.ix.toFixed(2)} cm4`],
      ["Módulo (Wx)", `${sol.profile.wx.toFixed(2)} cm3`],
      ["Peso", `${sol.profile.weight.toFixed(2)} kg/m`],
      ["Flecha Calculada", `${sol.els.deflection.toFixed(2)} mm`],
      ["Limite de Flecha", `${sol.els.deflectionLimit.toFixed(2)} mm`],
      ["Momento Solicitante", `${sol.elu.momentSoliciting.toFixed(2)} kNm`],
      ["Momento Resistente", `${sol.elu.momentResistant.toFixed(2)} kNm`],
      ["Cortante Solicitante", `${sol.elu.shearSoliciting.toFixed(2)} kN`],
      ["Cortante Resistente", `${sol.elu.shearResistant.toFixed(2)} kN`],
      ["Índice de Uso (ELU)", `${sol.elu.usageIndex.toFixed(1)}%`],
      ["Classificação Estrutural", sol.elu.verification.classificacao.replace("_", " ")],
      ["Recomendação Técnica", sol.elu.verification.recomendacaoTecnica],
      ["Vidro Especificado", `${sol.glass.thickness}mm ${sol.glass.type}`],
      [
        "Tensão Vidro",
        `${sol.glassResult.stress.toFixed(2)} MPa (Admissível: ${sol.glassResult.admissibleStress.toFixed(2)})`,
      ],
      ["Status Final", sol.isApproved ? "APROVADO" : "REPROVADO"],
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Item", "Especificação"]],
      body: solData,
      theme: "grid",
      headStyles: { fillColor: [8, 103, 117] },
      styles: { fontSize: 9 },
    });

    // 4. Memória de Cálculo Detalhada
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. MEMÓRIA DE CÁLCULO DETALHADA", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let y = 30;
    const addLine = (text: string) => {
      doc.text(text, 20, y);
      y += 6;
    };

    addLine("4.1. CÁLCULO DA PRESSÃO DE VENTO (NBR 6123)");
    addLine(`Fator Topográfico (S1): ${state.s1}`);
    addLine(
      `Fator de Rugosidade (S2): Categoria ${state.s2Category}, Classe ${state.s2Class}`,
    );
    addLine(`Fator Estatístico (S3): ${state.s3}`);
    addLine(`Velocidade Básica (V0): ${state.windSpeed} m/s`);
    addLine(
      `Velocidade Característica (Vk) = V0 * S1 * S2 * S3 = ${data.vk.toFixed(2)} m/s`,
    );
    addLine(`Pressão Dinâmica (q) = 0.613 * Vk² = ${data.q.toFixed(3)} kN/m²`);
    addLine(`Coeficiente de Pressão (Cp): ${state.cp}`);
    addLine(
      `Pressão de Projeto (p) = q * |Cp| = ${data.windPressure.toFixed(3)} kN/m²`,
    );
    y += 4;

    addLine("4.2. ESTADO LIMITE ÚLTIMO - ELU (RESISTÊNCIA)");
    addLine(`Sistema Estrutural: ${data.structuralSystem}`);
    addLine(`Vão Efetivo (L): ${(data.effectiveSpan * 1000).toFixed(0)} mm`);
    addLine(`Área de Influência (A): ${data.area.toFixed(2)} m²`);
    addLine(
      `Carga Linear (q_lin) = p * Largura = ${data.totalLoad.toFixed(2)} kN/m`,
    );
    addLine(
      `Momento Solicitante Máximo (Md) = ${sol.elu.momentSoliciting.toFixed(2)} kNm`,
    );
    addLine(
      `Cortante Solicitante Máximo (Vd) = ${sol.elu.shearSoliciting.toFixed(2)} kN`,
    );
    addLine(
      `Cortante Resistente (Vr) = ${sol.elu.shearResistant.toFixed(2)} kN`,
    );
    addLine(`Tensão Admissível do Alumínio (fy): ${state.allowableStress} MPa`);
    addLine(
      `Momento Resistente (Mr) = (Wx * fy) / Gama_m = ${sol.elu.momentResistant.toFixed(2)} kNm`,
    );
    addLine(
      `Índice de Uso = (Md / Mr) * 100 = ${sol.elu.usageIndex.toFixed(1)}%`,
    );
    addLine(`Classificação Estrutural: ${sol.elu.verification.classificacao.replace("_", " ")}`);
    y += 4;

    addLine("4.3. ESTADO LIMITE DE SERVIÇO - ELS (DEFORMAÇÃO)");
    addLine(`Módulo de Elasticidade (E): ${state.modulusOfElasticity} GPa`);
    addLine(`Inércia do Perfil (Ix): ${sol.profile.ix.toFixed(2)} cm⁴`);
    addLine(`Flecha Calculada (f) = ${sol.els.deflection.toFixed(2)} mm`);
    addLine(
      `Flecha Limite (L/${typology.defaultSlsRatio}) = ${sol.els.deflectionLimit.toFixed(2)} mm`,
    );
    y += 4;

    addLine("4.4. VERIFICAÇÃO DO VIDRO (NBR 7199)");
    addLine(`Espessura: ${sol.glass.thickness} mm`);
    addLine(`Tipo: ${sol.glass.type}`);
    addLine(`Tensão Calculada = ${sol.glassResult.stress.toFixed(2)} MPa`);
    addLine(
      `Tensão Admissível = ${sol.glassResult.admissibleStress.toFixed(2)} MPa`,
    );
  }

  // Rodapé
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Este documento é um memorial de cálculo gerado automaticamente e deve ser validado por um engenheiro responsável (ART).",
    pageWidth / 2,
    finalY,
    { align: "center" },
  );
  doc.text(
    "EsquadriasCalc Pro - Tecnologia para Engenharia de Esquadrias",
    pageWidth / 2,
    finalY + 5,
    { align: "center" },
  );
  doc.text(
    "Desenvolvimento e concepção do sistema: Eduardo Marques",
    pageWidth / 2,
    finalY + 10,
    { align: "center" },
  );

  doc.save(`Memorial_Calculo_${state.region.split(" ")[0]}.pdf`);
};
