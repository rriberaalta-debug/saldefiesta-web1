import { GoogleGenAI, Type } from "@google/genai";
import { Post, User, FiestaEvent } from "../types";
import * as constants from "../constants";

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  // This throws a clearer error if the environment variable is missing in Netlify.
  throw new Error("VITE_API_KEY is not set. Please check your Netlify environment variables.");
}

const ai = new GoogleGenAI({ apiKey });


// Helper function to robustly parse a JSON array from the AI's response text.
const parseJsonArray = (text: string): any[] => {
  // Try to find a JSON code block first. This is the most reliable method.
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse extracted JSON from code block:", e);
      // Fallback to other methods if parsing fails
    }
  }

  // If no code block, try to find a raw JSON array in the text.
  const arrayMatch = text.match(/(\[[\s\S]*\])/);
  if (arrayMatch && arrayMatch[1]) {
    try {
      const parsed = JSON.parse(arrayMatch[1]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse extracted raw JSON array:", e);
    }
  }
  
  // If all parsing attempts fail, return an empty array.
  console.error("No valid JSON array found in the AI response text:", text);
  return [];
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
      Eres un asistente experto en fiestas patronales y eventos de España.
      Tu misión es responder a la consulta del usuario con la información MÁS PRECISA y ACTUALIZADA posible, utilizando la búsqueda en la web.
      Consulta de usuario: "${query}"

      INSTRUCCIONES ESTRICTAS:
      1. **USA LA BÚSQUEDA WEB OBLIGATORIAMENTE**: Realiza una búsqueda en Google para verificar fechas exactas, ubicaciones (incluyendo barrios si es relevante) y detalles de las fiestas. No confíes únicamente en tu conocimiento interno. La precisión es crítica.
      2. **FORMATO DE SALIDA**: Tu respuesta debe ser ÚNICAMENTE un bloque de código JSON que contenga un array de objetos. No incluyas texto introductorio, explicaciones, saludos ni nada fuera del bloque de código.
      3. **ESTRUCTURA DEL JSON**: Cada objeto en el array debe tener el siguiente formato: {"name": "string", "city": "string", "dates": "string", "description": "string", "type": "string"}.
      4. **SIN RESULTADOS**: Si después de buscar en la web no encuentras ninguna fiesta relevante, devuelve un array JSON vacío: [].
      5. **EJEMPLO DE RESPUESTA VÁLIDA**:
      \`\`\`json
      [
        {
          "name": "Aste Nagusia / Semana Grande",
          "city": "Bilbao (Barrios: Casco Viejo, Abando)",
          "dates": "Del 17 al 25 de agosto de 2024",
          "description": "Nueve días de fiesta con Marijaia como símbolo, conciertos, fuegos artificiales y actividades en toda la ciudad.",
          "type": "Fiesta Patronal"
        }
      ]
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const foundFiestas = parseJsonArray(response.text);
    if (!Array.isArray(foundFiestas)) {
        // The helper function ensures it's always an array, but this is good practice
        throw new Error("La IA no devolvió un array válido.");
    }
    return foundFiestas;

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