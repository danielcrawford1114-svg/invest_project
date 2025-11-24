import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  context?: string
): Promise<{ text: string; groundingChunks?: any[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
    You are MarketMind, an expert financial analyst and AI investment assistant.
    
    Your Mission:
    - Help the user identify investment opportunities and understand market trends.
    - Provide deep analysis of the stock currently being viewed (context provided).
    - Use Google Search to find the absolute latest news, earnings reports, and analyst ratings when asked "what to invest in" or about specific companies.
    - Synthesize data to offer pros and cons for potential investments.

    Context Data:
    ${context ? `Real-time Stock Data: ${context}` : 'User is on the main dashboard.'}

    Response Guidelines:
    - Be concise but insightful.
    - Use Markdown for clear formatting (bold **Symbols**, bullet points for lists).
    - If suggesting investments, explain the *reasoning* (e.g., "Tech sector is rallying due to AI demand").
    - ALWAYS include a brief disclaimer that you are an AI and this is not professional financial advice.
    `;

    const prompt = `
    Conversation History:
    ${history.filter(h => !h.isError).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')}
    
    Current Question: ${message}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "I currently cannot provide an analysis. Please try again.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, groundingChunks };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};