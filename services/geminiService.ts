import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, User } from "../types";

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

export const getFinancialAdvice = async (transactions: Transaction[], user?: User | null): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate advice.";

  // Simplify data to save tokens
  const summary = transactions.slice(0, 50).map(t => 
    `${t.date}: ${t.type} - ${t.category} - Rp${t.amount} (${t.description})`
  ).join('\n');

  // Build Profile Context
  let profileContext = "";
  if (user && user.financialProfile) {
    const fp = user.financialProfile;
    const occupationMap: Record<string, string> = {
      'STABLE': 'PNS/BUMN (Stabil)',
      'PRIVATE': 'Karyawan Swasta',
      'FREELANCE': 'Freelancer/Pengusaha (Fluktuatif)'
    };
    
    profileContext = `
    DATA PROFIL PENGGUNA:
    - Status Pernikahan: ${fp.maritalStatus === 'MARRIED' ? 'Menikah' : 'Lajang'}
    - Jumlah Tanggungan: ${fp.dependents} orang
    - Pekerjaan: ${occupationMap[fp.occupation] || 'Tidak diketahui'}
    - Target Finansial (Financial Goals):
      ${fp.goals.length > 0 ? fp.goals.map(g => `- ${g.name}: Target Rp${g.amount.toLocaleString('id-ID')} pada ${g.deadline}`).join('\n') : 'Belum ada target spesifik.'}
    `;
  }

  const prompt = `
    Bertindaklah sebagai penasihat keuangan pribadi (Financial Planner) yang sangat cerdas, empatik, dan strategis.
    
    ${profileContext}

    RIWAYAT TRANSAKSI TERAKHIR (50 item):
    ${summary}
    
    TUGAS ANDA:
    Berikan analisis keuangan yang mendalam dalam Bahasa Indonesia yang profesional namun ramah. Gunakan format Markdown.
    
    Poin-poin analisis yang WAJIB ada:
    1. **Kesehatan Cashflow**: Analisis pemasukan vs pengeluaran berdasarkan data transaksi.
    2. **Analisis Profil Risiko & Dana Darurat**: 
       - Berdasarkan pekerjaan pengguna (${user?.financialProfile?.occupation || 'Umum'}), hitung berapa bulan Dana Darurat yang ideal (misal: Freelance butuh 12x pengeluaran).
       - Bandingkan dengan pola pengeluaran mereka saat ini.
    3. **Kewajaran Pengeluaran**:
       - Jika user punya tanggungan (${user?.financialProfile?.dependents || 0}), apakah pengeluaran untuk kebutuhan pokok terlihat wajar?
    4. **Gap Analysis Target Finansial (CRITICAL)**:
       - Untuk setiap 'Target Finansial' yang terdaftar di atas, hitung berapa yang harus ditabung per bulan mulai sekarang hingga deadline.
       - Bandingkan angka tersebut dengan sisa uang (surplus) bulanan rata-rata user saat ini.
       - Berikan peringatan keras namun sopan jika target terlihat mustahil dicapai dengan gaya hidup sekarang.
    5. **3 Rekomendasi Konkret**: Langkah nyata untuk memperbaiki keuangan atau mencapai target.
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