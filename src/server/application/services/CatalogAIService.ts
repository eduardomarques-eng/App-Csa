import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class CatalogAIService {
  static async extractProfileData(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia as propriedades mecânicas dos perfis de alumínio do seguinte texto técnico:
      
      ${text}
      
      Retorne um JSON estruturado.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: "Código do perfil" },
              weight: { type: Type.NUMBER, description: "Peso linear em kg/m" },
              ix: { type: Type.NUMBER, description: "Momento de inércia Ix em cm4" },
              wx: { type: Type.NUMBER, description: "Módulo de resistência Wx em cm3" },
            },
            required: ["code", "weight", "ix", "wx"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  }
}
