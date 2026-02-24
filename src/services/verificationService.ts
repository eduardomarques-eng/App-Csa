import { VerificationResult, StatusClassificacao } from "../core/types";

export const generateVerificationResult = (
  valorCalculado: number,
  limiteNormativo: number,
  tipo: "ELU" | "ELS" | "VIDRO"
): VerificationResult => {
  const percentualUtilizado = limiteNormativo > 0 ? (valorCalculado / limiteNormativo) * 100 : 0;
  const margemSeguranca = limiteNormativo > 0 ? ((limiteNormativo - valorCalculado) / limiteNormativo) * 100 : 0;
  
  let classificacao: StatusClassificacao = "REPROVADO";
  let recomendacaoTecnica = "";

  if (percentualUtilizado <= 70) {
    classificacao = "APROVADO_CONFORTO";
    recomendacaoTecnica = "Margem de segurança elevada. Possibilidade de otimização. Sugestão automática de perfil mais leve.";
  } else if (percentualUtilizado > 70 && percentualUtilizado <= 95) {
    classificacao = "APROVADO_LIMITE";
    recomendacaoTecnica = "Sistema estrutural adequado. Baixa margem residual. Atenção a tolerâncias de execução.";
  } else if (percentualUtilizado > 95 && percentualUtilizado <= 100) {
    classificacao = "CRITICO";
    recomendacaoTecnica = "Próximo do limite normativo. Risco em caso de variações construtivas. Recomendar perfil superior.";
  } else {
    classificacao = "REPROVADO";
    const excedente = (percentualUtilizado - 100).toFixed(1);
    recomendacaoTecnica = `Ultrapassa limite normativo em ${excedente}%. Recomendar próximo perfil viável.`;
  }

  return {
    valorCalculado,
    limiteNormativo,
    percentualUtilizado,
    margemSeguranca,
    classificacao,
    recomendacaoTecnica,
  };
};
