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

export const analyzeComment = async (comment: string): Promise<{ isValid: boolean, score: number, reason: string }> => {
  const client = getClient();
  if (!client) return { isValid: true, score: 3, reason: "Good job!" };

  try {
    const prompt = `
      Analyze the following student comment for a class video.
      Comment: "${comment}"
      
      Rules:
      1. If it's gibberish (e.g., "asdf", "ㅋㅋㅋ" only), swear words, or completely irrelevant, mark invalid.
      2. Score 1-3 based on depth (1: simple, 2: good, 3: excellent insight or good question).
      3. Provide a very short reason in Korean.
      
      Return JSON: { "isValid": boolean, "score": number, "reason": "string" }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing comment:", error);
    // Fallback logic
    const len = comment.length;
    return { 
      isValid: len > 5, 
      score: len > 20 ? 3 : 2, 
      reason: "AI 분석 실패, 기본 점수 부여" 
    };
  }
};

export const verifyChallengeImage = async (base64Image: string, challengeTitle: string): Promise<{ isValid: boolean, reason: string }> => {
  const client = getClient();
  // Mock response if no client (for dev environment without API key)
  if (!client) return { isValid: true, reason: "API Key 없음 (개발 모드 승인)" };

  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      You are a strict teacher verifying a student's proof photo for a challenge.
      Challenge Title: "${challengeTitle}"
      
      Look at the image strictly. 
      Does the image clearly show evidence related to the challenge title?
      
      Examples of rejection:
      - Challenge is "Reading" but image is a computer game or blank screen.
      - Challenge is "Exercise" but image is a ceiling or random object.
      - Image is too dark or blurry to identify.
      
      Return JSON: { "isValid": boolean, "reason": "Short explanation in Korean" }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);

  } catch (error) {
    console.error("Error verifying image:", error);
    return { isValid: true, reason: "AI 검증 오류 (일단 승인)" };
  }
};