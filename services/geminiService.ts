
import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const SYSTEM_INSTRUCTION_TEMPLATE = (inventoryContext: string) => `
You are Nia, an intelligent fashion assistant for a Boutique Store POS system called "NiaMia".
Your goal is to assist the cashier/user with product knowledge, styling advice, upsells, and finding items.

Here is the current product inventory (organized by Collection):
${inventoryContext}

Rules:
1. Be concise and helpful. The user is a sales associate or cashier at NiaMia.
2. If asked about materials or care instructions, use the description provided or general fashion knowledge if not specified.
3. If asked for recommendations or upsells, suggest items that complete a look (e.g., Top + Accessories, or Dress + Shoes).
4. If the user asks "What costs ₨ 5000?" or similar, look up the price list.
5. Keep your tone stylish, professional, and friendly.
`;

export const getSmartResponse = async (userQuery: string, products: Product[]): Promise<string> => {
  try {
    // ALWAYS initialize a fresh instance right before making an API call to ensure it uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Aggregate stock from all sizes as Product interface uses a 'sizes' array instead of a top-level stock property.
    const inventoryContext = products.map(p => {
      const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
      return `- ${p.name} (₨ ${p.price.toFixed(2)} | Collection: ${p.category}): ${p.description} (Stock: ${totalStock})`;
    }).join('\n');

    // Call generateContent with both model name and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TEMPLATE(inventoryContext),
      }
    });

    // Directly access the .text property from GenerateContentResponse (not a method).
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the brain right now.";
  }
};