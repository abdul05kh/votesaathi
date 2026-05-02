import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
} catch (e) {
  console.warn("Gemini API key is missing or invalid.");
}

const SYSTEM_INSTRUCTION = `You are VoteSaathi, India's most trusted election education assistant and SanshayNivaran (Legal Election Expert). You help every Indian citizen — regardless of education, language, age, or ability — understand the election process and their rights under the Representation of the People Act 1951.
Rules: 
1) Always respond in the user's detected language. 
2) Keep answers to 3 sentences maximum unless asked for more details. 
3) Never mention political parties or candidates by name. 
4) If you don't know, say so and suggest the ECI helpline 1950. 
5) For legal queries, always append 'For official advice, call ECI helpline 1950.' 
6) Use simple Grade 4 vocabulary.`;

export async function generateResponse(prompt: string, language: string = 'en') {
  try {
    if (!ai) throw new Error("Gemini API client not initialized.");
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: `User Language: ${language}. Question: ${prompt}` }] }
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }], // Enables SanshayNivaran grounding
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I am having trouble connecting right now. Please try again later or call the ECI helpline at 1950.";
  }
}

export async function analyzeBallot(imageBase64: string, language: string = 'en') {
  try {
    if (!ai) throw new Error("Gemini API client not initialized.");
    
    // Strip the data:image/...;base64, prefix if present
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { 
                role: 'user', 
                parts: [
                    { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
                    { text: `Analyze this image (could be an EVM ballot, Voter ID, or polling booth). Explain what it is and how to use it in very simple terms. Respond in ${language}.` }
                ] 
            }
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Sorry, I couldn't analyze that image clearly. Make sure it's well-lit and try again.";
  }
}

const LAWYER_INSTRUCTION = `You are SanshayNivaran, the official AI Election Lawyer grounded strictly in the Representation of the People Act 1951, the Constitution of India, and Election Commission of India (ECI) guidelines. 
Rules:
1. Act formally and professionally, like a lawyer.
2. Only answer questions related to Indian elections, voter rights, and election law. If the question is outside this scope, decline to answer.
3. Ground your answers using the googleSearch tool to cite the actual Representation of the People Act 1951 where applicable.
4. Keep answers concise but legally accurate.
5. Provide responses in the user's requested language.
6. Always end with a disclaimer: "Note: This is an AI interpretation. For official legal advice, please consult the ECI or a qualified advocate."`;

export async function consultLawyer(prompt: string, language: string = 'en') {
  try {
    if (!ai) throw new Error("Gemini API client not initialized.");
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: `User Language: ${language}. Legal Question: ${prompt}` }] }
        ],
        config: {
            systemInstruction: LAWYER_INSTRUCTION,
            tools: [{ googleSearch: {} }],
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Lawyer Error:", error);
    return "I am unable to access my legal database at this moment. Please try again later.";
  }
}
