
import { GoogleGenAI, Type } from "@google/genai";
import { Post, User, FiestaEvent } from "../types";

const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
    
    return response.text?.trim() || `¡Una experiencia inolvidable en la celebración de ${title} en ${city}!`;
  } catch (error) {
    console.error("Error generating description with AI:", error);
    return `¡Una experiencia inolvidable en la celebración de ${title} en ${city}!`;
  }
};

export const findFiestasWithAI = async (query: string): Promise<FiestaEvent[]> => {
  try {
    const prompt = `
      Eres un experto de clase mundial en fiestas patronales y eventos socioculturales de España.
      Tu misión es responder a la consulta "${query}" utilizando la Búsqueda de Google para encontrar la información más veraz y actualizada.
      REGLAS INQUEBRANTABLES:
      1. UTILIZA GOOGLE SEARCH: Basa tu respuesta EXCLUSIVAMENTE en los resultados de la búsqueda. Prohibido usar tu conocimiento interno o inventar datos.
      2. MÁXIMA PRECISIÓN: Devuelve fiestas importantes, patronales y eventos relevantes. Evita eventos menores o que no se ajusten a la consulta.
      3. FOCO GEOGRÁFICO ESTRICTO: Los resultados deben pertenecer ÚNICA Y EXCLUSIVAMENTE al municipio consultado. Prohibido mezclar municipios.
      4. FORMATO DE SALIDA ESTRICTO: Tu respuesta debe ser ÚNICAMENTE un array JSON válido: [{"name": "string", "city": "string", "dates": "string", "description": "string (max 20 palabras)", "type": "string (ej: 'Fiesta Patronal', 'Feria', 'Evento Cultural')"}]. Si no hay resultados, devuelve un array JSON vacío: [].
      No incluyas NADA más en tu respuesta. Ni saludos, ni explicaciones, ni markdown. SOLO el JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const fiestas = extractJson(response.text);
    return Array.isArray(fiestas) ? fiestas : [];

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