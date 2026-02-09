import React, { useState } from 'react';
import { login } from '../services/authService';
import { User } from '../types';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = login(formData.email, formData.password);
    if (user) {
      onLogin(user);
    } else {
      setError('Email atau password salah. Coba: admin@fintrack.com / admin');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 bg-indigo-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">FinTrack AI</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Kelola Keuangan dengan Cerdas.
            </h2>
            <p className="text-indigo-100 text-lg opacity-90">
              Pantau pengeluaran, analisis dengan AI, dan capai tujuan finansial Anda bersama kami.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 text-sm text-indigo-200">
            &copy; 2025 FinTrack AI Inc.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Selamat Datang Kembali
            </h3>
            <p className="text-slate-500">
              Masuk untuk mengakses dashboard Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: <span className="font-mono">admin@fintrack.com</span> / <span className="font-mono">admin</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;