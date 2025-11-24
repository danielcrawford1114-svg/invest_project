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
    You are MarketMind, an expert financial analyst and investment assistant.
    
    Your Goal:
    - Provide concise, data-driven insights on stocks and market trends.
    - Use Google Search to find real-time news and latest market movements if the user asks about current events or "what to invest in".
    - Explain technical financial concepts in simple terms.
    - Always include a disclaimer that you are an AI and this is not financial advice.

    Context:
    ${context ? `The user is currently looking at this stock data: ${context}` : 'The user is viewing the general dashboard.'}

    Formatting:
    - Use Markdown for bolding key figures or symbols (e.g., **AAPL**).
    - Keep responses under 200 words unless asked for a detailed report.
    `;

    // Map history to Gemini format (simple text concatenation for this stateless request or use chat session)
    // We will use a fresh generateContent call with history as context to simplify state management in this demo,
    // but enabling 'googleSearch' tool which works best with generateContent.
    
    const prompt = `
    Previous conversation:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
    
    User: ${message}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable grounding
        temperature: 0.7,
      },
    });

    const text = response.text || "I couldn't generate a response at this time.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, groundingChunks };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
