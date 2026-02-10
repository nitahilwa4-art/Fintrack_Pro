import React, { useState } from 'react';
import { Transaction, Wallet } from '../types';
import { FileDown, Calendar, FileSpreadsheet, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportPageProps {
  transactions: Transaction[];
  wallets: Wallet[];
}

const ExportPage: React.FC<ExportPageProps> = ({ transactions, wallets }) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = transactions.filter(t => {
    return t.date >= startDate && t.date <= endDate;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  const handleExport = async () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data pada rentang tanggal yang dipilih.');
      return;
    }

    setIsExporting(true);
    
    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (format === 'PDF') {
        downloadPDF();
      } else {
        downloadCSV();
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Laporan Keuangan FinTrack AI', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 30);

    // Summary Section
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(10);
    doc.text(`Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`, 14, 42);
    doc.text(`Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`, 14, 48);
    doc.text(`Selisih: Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')}`, 14, 54);

    // Table
    const tableColumn = ["Tanggal", "Deskripsi", "Tipe", "Kategori", "Jumlah", "Dompet"];
    const tableRows: any[] = [];

    filteredTransactions.forEach(t => {
      const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Unknown';
      const typeLabel = t.type === 'INCOME' ? 'Masuk' : t.type === 'EXPENSE' ? 'Keluar' : 'Transfer';
      
      const transactionData = [
        t.date,
        t.description,
        typeLabel,
        t.category,
        `Rp ${t.amount.toLocaleString('id-ID')}`,
        walletName
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_FinTrack_${startDate}_${endDate}.pdf`);
    toast.success('Laporan PDF berhasil diunduh!');
  };

  const downloadCSV = () => {
    const headers = ['Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Jumlah', 'Dompet Asal', 'Dompet Tujuan'];
    const rows = filteredTransactions.map(t => [
      t.date, 
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.type, 
      t.category, 
      t.amount, 
      wallets.find(w => w.id === t.walletId)?.name || 'Unknown',
      t.toWalletId ? (wallets.find(w => w.id === t.toWalletId)?.name || 'Unknown') : '-'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    // Add BOM for Excel compatibility with UTF-8
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Laporan_Keuangan_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Laporan Excel/CSV berhasil diunduh!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
          <FileDown className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Export Laporan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Unduh riwayat transaksi anda untuk keperluan pembukuan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
              Pilih Rentang Tanggal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white font-medium transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Format File</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('CSV')}
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'CSV' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'}`}
              >
                <FileSpreadsheet className="w-6 h-6 mr-2" />
                <span className="font-bold">Excel / CSV</span>
                {format === 'CSV' && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-600 dark:text-emerald-400" />}
              </button>
              <button 
                onClick={() => setFormat('PDF')}
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'PDF' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'}`}
              >
                <FileText className="w-6 h-6 mr-2" />
                <span className="font-bold">PDF Report</span>
                {format === 'PDF' && <CheckCircle2 className="w-5 h-5 ml-auto text-red-600 dark:text-red-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Ringkasan Laporan</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Total Transaksi</span>
                <span className="font-bold text-lg">{filteredTransactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 text-sm">Pemasukan</span>
                <span className="font-bold text-emerald-400">+ {new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-sm">Pengeluaran</span>
                <span className="font-bold text-red-400">- {new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(totalExpense)}</span>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5 mr-2" />
                    Download {format}
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-xl border border-blue-100 dark:border-blue-800">
            <p><strong>Catatan:</strong> Laporan Excel menggunakan format CSV yang kompatibel. Laporan PDF dibuat secara otomatis di browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;