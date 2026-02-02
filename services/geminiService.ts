import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateScaryText = async (bookNumber: number): Promise<string> => {
  if (!ai) {
    return `Page ${bookNumber}... The ink is smeared with blood. I can't read it, but I feel watched.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a very short, disturbing, cryptic diary entry (max 20 words) found in a dark cellar. It should hint at a pale woman with white eyes who watches you. This is Book #${bookNumber}.`,
    });
    return response.text || "She is watching...";
  } catch (error) {
    console.error("Failed to generate text", error);
    return `Page ${bookNumber}... RUN.`;
  }
};