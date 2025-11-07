import { GoogleGenAI, Type } from "@google/genai";
import { Post, User, FiestaEvent } from "../types";
import * as constants from "../constants";

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  // This throws a clearer error if the environment variable is missing in Netlify.
  throw new Error("VITE_API_KEY is not set. Please check your Netlify environment variables.");
}

const ai = new GoogleGenAI({ apiKey });


const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
  if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[2]);
    } catch (e) {
      console.error("Failed to parse extracted JSON from code block:", e);
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
     console.error("Failed to parse raw text as JSON:", text);
     if(text.trim().startsWith('[')) return [];
     throw new Error("La IA ha devuelto una respuesta con un formato incorrecto.");
  }
};


export const generateDescription = async (title: string, city: string): Promise<string> => {
  try {
    const prompt = `Genera una descripción corta, festiva y alegre para una publicación de red social, de menos de 25 palabras, para una foto/vídeo de la fiesta "${title}" en ${city}. Evoca una sensación de diversión y emoción. No uses hashtags.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // FIX: The .text property is a getter that returns a string or throws, so optional chaining is incorrect.
    return response.text.trim() || `¡Una experiencia inolvidable en la celebración de ${title} en ${city}!`;
  } catch (error) {
    console.error("Error generating description with AI:", error);
    return `¡Una experiencia inolvidable en la celebración de ${title} en ${city}!`;
  }
};

export const findFiestasWithAI = async (query: string): Promise<FiestaEvent[]> => {
  try {
    const prompt = `
      Eres un experto de clase mundial en fiestas patronales y eventos socioculturales de España.
      Tu misión es responder a la consulta del usuario con información precisa y actualizada sobre fiestas en España.
      Consulta de usuario: "${query}"

      REGLAS:
      1. Busca en tu conocimiento sobre fiestas españolas para encontrar los eventos más relevantes para la consulta.
      2. Si la consulta es un nombre de ciudad, devuelve las fiestas más importantes de esa ciudad. Si es una fiesta, da detalles sobre ella.
      3. FORMATO DE SALIDA ESTRICTO: Tu respuesta debe ser ÚNICAMENTE un array JSON válido con las fiestas encontradas. El formato de cada objeto debe ser: {"name": "string", "city": "string", "dates": "string", "description": "string", "type": "string"}.
      4. Si no encuentras ninguna fiesta relevante, devuelve un array JSON vacío: [].
      5. No incluyas NADA más en tu respuesta. Ni saludos, ni explicaciones, ni markdown. SOLO el JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              city: { type: Type.STRING },
              dates: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
            },
            required: ['name', 'city', 'dates', 'description', 'type']
          },
        },
      },
    });

    const foundFiestas = JSON.parse(response.text);
    return Array.isArray(foundFiestas) ? foundFiestas : [];

  } catch (error) {
    console.error("Error calling findFiestasWithAI:", error);
    if (error instanceof Error) {
       throw new Error(`No se pudieron obtener los resultados: ${error.message}`);
    }
    throw new Error("No se pudieron obtener los resultados. Inténtalo de nuevo.");
  }
};


export const searchPostsWithAI = async (query: string, posts: Post[], users: User[]): Promise<string[]> => {
   try {
    const postsWithUsernames = posts.map(post => {
      const user = users.find(u => u.id === post.userId);
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        city: post.city,
        username: user ? user.username : 'Desconocido',
        timestamp: post.timestamp
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eres un motor de búsqueda semántica. Analiza la consulta "${query}" y la siguiente lista de publicaciones en formato JSON. Devuelve únicamente un array JSON con los IDs de las publicaciones más relevantes. Si no hay resultados relevantes, devuelve un array vacío []. Publicaciones: ${JSON.stringify(postsWithUsernames)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
      }
    });
    
    const postIds = JSON.parse(response.text);
    return Array.isArray(postIds) ? postIds : [];

  } catch (error) {
    console.error("Error searching posts with AI:", error);
    return [];
  }
};