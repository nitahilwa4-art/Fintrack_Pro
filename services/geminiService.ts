import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const parseNaturalLanguageTransaction = async (input: string): Promise<Omit<Transaction, 'id' | 'userId'>[]> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Analisis teks berikut dan ekstrak data transaksi keuangan.
    Teks: "${input}"
    
    Kembalikan array objek JSON dengan properti:
    - description (string): Deskripsi singkat transaksi
    - amount (number): Jumlah uang (dalam Rupiah/Angka murni tanpa simbol)
    - type (string): 'INCOME' atau 'EXPENSE'
    - category (string): Kategori yang paling relevan (Contoh: Makanan, Transportasi, Gaji, dll)
    - date (string): Tanggal dalam format ISO (YYYY-MM-DD). Jika tidak disebutkan, gunakan tanggal hari ini: ${new Date().toISOString().split('T')[0]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ['description', 'amount', 'type', 'category', 'date']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Omit<Transaction, 'id' | 'userId'>[];
  } catch (error) {
    console.error("Error parsing transaction:", error);
    throw error;
  }
};

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate advice.";

  // Simplify data to save tokens
  const summary = transactions.slice(0, 50).map(t => 
    `${t.date}: ${t.type} - ${t.category} - Rp${t.amount} (${t.description})`
  ).join('\n');

  const prompt = `
    Bertindaklah sebagai penasihat keuangan pribadi yang cerdas.
    Berikut adalah riwayat transaksi terakhir saya:
    
    ${summary}
    
    Berikan analisis singkat, padat, dan actionable tentang kebiasaan pengeluaran saya.
    Berikan 3 saran konkret untuk menghemat uang atau meningkatkan kesehatan finansial.
    Gunakan format Markdown yang rapi. Gunakan Bahasa Indonesia yang ramah dan profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Maaf, saya tidak dapat menganalisis data saat ini.";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "Terjadi kesalahan saat menghubungkan ke AI.";
  }
};