import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Lightbulb, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FinancialInsightsProps {
  transactions: Transaction[];
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAdvice = async () => {
    if (transactions.length === 0) {
      setAdvice("Belum ada data transaksi untuk dianalisis. Silakan tambahkan transaksi terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const result = await getFinancialAdvice(transactions);
      setAdvice(result);
    } catch (e) {
      setAdvice("Gagal menghasilkan analisis. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-yellow-300" />
              Asisten Keuangan Cerdas
            </h2>
            <p className="text-indigo-100 opacity-90 max-w-xl">
              Dapatkan analisis mendalam dan saran penghematan yang dipersonalisasi berdasarkan riwayat transaksi Anda menggunakan AI canggih.
            </p>
          </div>
          <button
            onClick={handleGenerateAdvice}
            disabled={loading}
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Menganalisis...
              </>
            ) : (
              'Analisis Sekarang'
            )}
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="prose prose-slate max-w-none">
             <ReactMarkdown 
               components={{
                 h2: ({node, ...props}) => <h2 className="text-xl font-bold text-indigo-900 mt-6 mb-4" {...props} />,
                 h3: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-800 mt-4 mb-2" {...props} />,
                 p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
                 ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-4" {...props} />,
                 li: ({node, ...props}) => <li className="pl-1" {...props} />,
                 strong: ({node, ...props}) => <strong className="font-semibold text-indigo-700" {...props} />,
               }}
             >
               {advice}
             </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialInsights;