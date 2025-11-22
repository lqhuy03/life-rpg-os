import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { ShieldCheck, Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // SỬA ĐOẠN NÀY
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        // window.location.origin sẽ tự động lấy:
        // - Là "http://localhost:5173" nếu bạn đang chạy Local
        // - Là "https://life-rpg-os.vercel.app" nếu bạn đang chạy trên Vercel
        emailRedirectTo: window.location.origin 
      }
    });

    if (error) alert(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Life RPG OS</h1>
        
        {!sent ? (
          <>
            <p className="text-slate-400 mb-6">Nhập email để nhận Link đăng nhập (Magic Link)</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email" required placeholder="your@email.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center">
                {loading ? <Loader2 className="animate-spin" /> : "Gửi Link Đăng Nhập"}
              </button>
            </form>
          </>
        ) : (
          <div className="bg-emerald-900/20 text-emerald-400 p-4 rounded-lg border border-emerald-500/30">
            🚀 Đã gửi link! Hãy kiểm tra email của bạn ngay bây giờ.
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;