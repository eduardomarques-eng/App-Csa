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
  doc.setFillColor(0, 104, 116); // #006874
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("CSA CalcPro", 20, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "MEMORIAL DESCRITIVO E DE CÁLCULO ESTRUTURAL",
    20,
    28,
  );
  doc.text(
    `DATA: ${new Date().toLocaleDateString("pt-BR")}`,
    pageWidth - 20,
    28,
    { align: "right" },
  );

  // 1. Normas Aplicadas
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. NORMAS DE REFERÊNCIA APLICADAS", 20, 55);

  const normasData = [
    ["ABNT NBR 6123:1988", "Forças devidas ao vento em edificações"],
    ["ABNT NBR 10821:2017", "Esquadrias para edificações - Desempenho estrutural"],
    ["ABNT NBR 7199:2016", "Vidros na construção civil - Projeto, execução e aplicações"],
  ];
  if (state.category === "guarda-corpo") {
    normasData.push(["ABNT NBR 14718:2019", "Guarda-corpos para edificação"]);
  }

  autoTable(doc, {
    startY: 60,
    head: [["Norma", "Descrição"]],
    body: normasData,
    theme: "grid",
    headStyles: { fillColor: [0, 104, 116] },
    styles: { fontSize: 8 },
  });

  // 2. Dados de Entrada
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. PARÂMETROS DE PROJETO (DADOS DE ENTRADA)", 20, (doc as any).lastAutoTable.finalY + 15);

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
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Parâmetro", "Valor", "Referência"]],
    body: inputData,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20] },
    styles: { fontSize: 8 },
  });

  // 3. Resultados do Vento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    "3. ANÁLISE DE VENTO (NBR 6123)",
    20,
    (doc as any).lastAutoTable.finalY + 15,
  );

  const windResults = [
    ["Velocidade Característica (Vk)", `${data.vk.toFixed(2)} m/s`],
    ["Pressão Dinâmica (q)", `${data.q.toFixed(3)} kN/m²`],
    ["Coeficiente de Pressão (Cp)", `${state.cp.toFixed(2)}`],
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

  // 4. Melhor Solução Encontrada
  if (data.bestSolution) {
    const sol = data.bestSolution as Solution;
    
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      "4. RESULTADO DAS VERIFICAÇÕES (SOLUÇÃO ADOTADA)",
      20,
      20,
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
      ["Vidro Especificado", `${sol.glass.thickness}mm ${sol.glass.type}`],
      [
        "Tensão Vidro",
        `${sol.glassResult.stress.toFixed(2)} MPa (Admissível: ${sol.glassResult.admissibleStress.toFixed(2)})`,
      ],
      ["Status Final", sol.isApproved ? "APROVADO" : "REPROVADO"],
    ];

    autoTable(doc, {
      startY: 25,
      head: [["Item", "Especificação"]],
      body: solData,
      theme: "grid",
      headStyles: { fillColor: [0, 104, 116] },
      styles: { fontSize: 9 },
    });

    // 5. Conclusão Técnica e Recomendações
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. CONCLUSÃO TÉCNICA E RECOMENDAÇÕES", 20, (doc as any).lastAutoTable.finalY + 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const conclusionText = `A solução estrutural adotada com o perfil ${sol.profile.code} e vidro ${sol.glass.thickness}mm ${sol.glass.type} foi analisada conforme as normas vigentes. O sistema estrutural considerado foi "${data.structuralSystem}".`;
    
    const statusText = `STATUS: O conjunto encontra-se ${sol.isApproved ? "APROVADO" : "REPROVADO"} para as cargas de vento de projeto de ${data.windPressure.toFixed(2)} kN/m².`;
    
    const recText = `RECOMENDAÇÃO TÉCNICA: ${sol.elu.verification.recomendacaoTecnica}`;
    
    const splitConclusion = doc.splitTextToSize(conclusionText, pageWidth - 40);
    const splitStatus = doc.splitTextToSize(statusText, pageWidth - 40);
    const splitRec = doc.splitTextToSize(recText, pageWidth - 40);
    
    let currentY = (doc as any).lastAutoTable.finalY + 25;
    doc.text(splitConclusion, 20, currentY);
    currentY += splitConclusion.length * 5 + 5;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(sol.isApproved ? 0 : 220, sol.isApproved ? 128 : 38, sol.isApproved ? 0 : 38);
    doc.text(splitStatus, 20, currentY);
    currentY += splitStatus.length * 5 + 5;
    
    doc.setTextColor(20, 20, 20);
    doc.text(splitRec, 20, currentY);

    // 6. Memória de Cálculo Detalhada (Fórmulas)
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("6. MEMÓRIA DE CÁLCULO DETALHADA (FÓRMULAS APLICADAS)", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let y = 30;
    const addLine = (text: string) => {
      doc.text(text, 20, y);
      y += 6;
    };

    addLine("6.1. CÁLCULO DA PRESSÃO DE VENTO (NBR 6123)");
    addLine(`Fator Topográfico (S1): ${state.s1}`);
    addLine(
      `Fator de Rugosidade (S2): Categoria ${state.s2Category}, Classe ${state.s2Class}`,
    );
    addLine(`Fator Estatístico (S3): ${state.s3}`);
    addLine(`Velocidade Básica (V0): ${state.windSpeed} m/s`);
    addLine(
      `Fórmula: Vk = V0 * S1 * S2 * S3`
    );
    addLine(
      `Cálculo: Vk = ${state.windSpeed} * ${state.s1} * ${state.s2Category} * ${state.s3} = ${data.vk.toFixed(2)} m/s`,
    );
    addLine(`Fórmula: q = 0.613 * Vk²`);
    addLine(`Cálculo: q = 0.613 * (${data.vk.toFixed(2)})² = ${data.q.toFixed(3)} kN/m²`);
    addLine(`Coeficiente de Pressão (Cp): ${state.cp}`);
    addLine(`Fórmula: p = q * |Cp|`);
    addLine(
      `Cálculo: p = ${data.q.toFixed(3)} * |${state.cp}| = ${data.windPressure.toFixed(3)} kN/m²`,
    );
    y += 4;

    addLine("6.2. ESTADO LIMITE ÚLTIMO - ELU (RESISTÊNCIA)");
    addLine(`Sistema Estrutural: ${data.structuralSystem}`);
    addLine(`Vão Efetivo (L): ${(data.effectiveSpan * 1000).toFixed(0)} mm`);
    addLine(`Área de Influência (A): ${data.area.toFixed(2)} m²`);
    addLine(`Fórmula: q_lin = p * Largura`);
    addLine(
      `Cálculo: q_lin = ${data.windPressure.toFixed(3)} * ${(Number(state.width)/1000).toFixed(3)} = ${data.totalLoad.toFixed(2)} kN/m`,
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
    addLine(`Fórmula: Mr = (Wx * fy) / Gama_m`);
    addLine(
      `Cálculo: Mr = (${sol.profile.wx.toFixed(2)} * ${state.allowableStress}) / 1.1 = ${sol.elu.momentResistant.toFixed(2)} kNm`,
    );
    addLine(`Fórmula: Índice de Uso = (Md / Mr) * 100`);
    addLine(
      `Cálculo: Índice de Uso = (${sol.elu.momentSoliciting.toFixed(2)} / ${sol.elu.momentResistant.toFixed(2)}) * 100 = ${sol.elu.usageIndex.toFixed(1)}%`,
    );
    addLine(`Classificação Estrutural: ${sol.elu.verification.classificacao.replace("_", " ")}`);
    y += 4;

    addLine("6.3. ESTADO LIMITE DE SERVIÇO - ELS (DEFORMAÇÃO)");
    addLine(`Módulo de Elasticidade (E): ${state.modulusOfElasticity} GPa`);
    addLine(`Inércia do Perfil (Ix): ${sol.profile.ix.toFixed(2)} cm⁴`);
    addLine(`Flecha Calculada (f) = ${sol.els.deflection.toFixed(2)} mm`);
    addLine(`Fórmula: Flecha Limite = L / ${typology.defaultSlsRatio}`);
    addLine(
      `Cálculo: Flecha Limite = ${(data.effectiveSpan * 1000).toFixed(0)} / ${typology.defaultSlsRatio} = ${sol.els.deflectionLimit.toFixed(2)} mm`,
    );
    y += 4;

    addLine("6.4. VERIFICAÇÃO DO VIDRO (NBR 7199)");
    addLine(`Espessura: ${sol.glass.thickness} mm`);
    addLine(`Tipo: ${sol.glass.type}`);
    addLine(`Tensão Calculada = ${sol.glassResult.stress.toFixed(2)} MPa`);
    addLine(
      `Tensão Admissível = ${sol.glassResult.admissibleStress.toFixed(2)} MPa`,
    );

    // 7. Modelos Sugeridos (Alternativas Viáveis)
    if (data.solutions && data.solutions.length > 1) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 104, 116);
      doc.text("7. MODELOS SUGERIDOS (ALTERNATIVAS VIÁVEIS)", 20, 20);
      
      const altData = data.solutions
        .filter(s => s.isApproved && s.id !== sol.id)
        .slice(0, 5)
        .map((alt, idx) => [
          `Opção ${idx + 1}`,
          alt.profile.code,
          `${alt.glass.thickness}mm ${alt.glass.type}`,
          `${alt.elu.usageIndex.toFixed(1)}%`,
          `${alt.els.deflection.toFixed(2)} mm`,
          `${alt.globalEfficiency.toFixed(1)}%`
        ]);

      if (altData.length > 0) {
        autoTable(doc, {
          startY: 30,
          head: [["#", "Perfil", "Vidro", "Uso ELU", "Flecha", "Eficiência"]],
          body: altData,
          theme: "striped",
          headStyles: { fillColor: [0, 104, 116] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text("Nenhuma outra alternativa viável encontrada para os parâmetros atuais.", 20, 30);
      }
    }
  }

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Este documento é um memorial de cálculo gerado automaticamente e deve ser validado por um engenheiro responsável (ART).",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
    doc.text(
      "CSA CalcPro - Tecnologia para Engenharia de Esquadrias",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: "center" },
    );
    doc.text(
      "Desenvolvimento e concepção do sistema: Eduardo Marques",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  doc.save(`Memorial_Descritivo_${state.region.split(" ")[0]}.pdf`);
};
