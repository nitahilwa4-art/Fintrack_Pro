import React, { useState } from 'react';
import { parseNaturalLanguageTransaction } from '../services/geminiService';
import { Transaction } from '../types';
import { Sparkles, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SmartEntryProps {
  onAddTransactions: (transactions: Omit<Transaction, 'userId'>[]) => void;
  onDone: () => void;
}

const SmartEntry: React.FC<SmartEntryProps> = ({ onAddTransactions, onDone }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<Omit<Transaction, 'id' | 'userId'>[] | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    setParsedData(null);

    try {
      const result = await parseNaturalLanguageTransaction(input);
      if (result.length === 0) {
        setError("Tidak dapat mengenali transaksi. Coba gunakan format: 'Makan siang 50rb'");
      } else {
        setParsedData(result);
      }
    } catch (err) {
      setError("Gagal menghubungi AI. Pastikan API Key valid atau coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    const newTransactions: Omit<Transaction, 'userId'>[] = parsedData.map(t => ({
      ...t,
      id: uuidv4()
    }));
    onAddTransactions(newTransactions);
    onDone();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Input Cerdas AI</h2>
            <p className="text-slate-500 text-sm">Tulis transaksi Anda dengan bahasa sehari-hari.</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Terima gaji 10 juta, bayar kost 1.5 juta, makan siang 25rb kemarin..."
            className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-slate-900 bg-slate-50 text-lg placeholder:text-slate-400"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400">
            Powered by Gemini
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analisis Transaksi</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {parsedData && parsedData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Hasil Analisis
          </h3>
          
          <div className="space-y-3 mb-6">
            {parsedData.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-12 rounded-full ${t.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-slate-800">{t.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                      <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-xs">
                        {t.category}
                      </span>
                      <span>•</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setParsedData(null)}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleConfirm}
              className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <span>Simpan Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartEntry;