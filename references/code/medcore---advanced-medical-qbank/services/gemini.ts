
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askMedicalTutor = async (questionStem: string, query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a medical board exam tutor. 
      Context Question: ${questionStem}
      User query: ${query}
      Provide a high-yield, concise clinical explanation focusing on board-relevant concepts.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return "I'm sorry, I'm having trouble connecting to the knowledge base right now. Please try again later.";
  }
};
