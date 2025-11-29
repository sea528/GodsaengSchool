import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePraise = async (studentName: string, reason: string, points: number): Promise<string> => {
  const client = getClient();
  if (!client) return "Good job!";

  try {
    const prompt = `
      You are an encouraging classroom assistant. 
      Write a very short, enthusiastic, one-sentence praise message (under 15 words) for a student named "${studentName}".
      They just received ${points} points for "${reason}".
      Do not include quotes.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || `Great work, ${studentName}!`;
  } catch (error) {
    console.error("Error generating praise:", error);
    return `Well done, ${studentName}!`;
  }
};

export const generateClassThumbnail = async (topic: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  try {
    const prompt = `Create a flat vector art style illustration for an educational class thumbnail about: "${topic}". 
    Use bright, friendly colors suitable for students. Minimalist, high quality, no text inside the image.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
};