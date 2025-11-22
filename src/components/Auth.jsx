import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { ShieldCheck, Loader2, Lock, Mail, User, LogIn, UserPlus, MailWarning, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'pending'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [remember, setRemember] = useState(true); // State cho Remember Me

  // --- VALIDATION ---
  const isValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email || !emailRegex.test(formData.email)) { 
        toast.error("Email không hợp lệ!"); 
        return false; 
    }
    
    if (view !== 'forgot') {
        if (!formData.password || formData.password.length < 6) { 
            toast.error("Mật khẩu phải có ít nhất 6 ký tự!"); 
            return false; 
        }
    }

    if (view === 'register') {
        if (!formData.username.trim()) { 
            toast.error("Vui lòng nhập tên nhân vật!"); 
            return false; 
        }
    }
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    
    setLoading(true);
    
    try {
      if (view === 'login') {
        // --- ĐĂNG NHẬP ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Đăng nhập thành công!");
        // App.jsx sẽ tự chuyển trang
      } 
      else if (view === 'register') {
        // --- ĐĂNG KÝ ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.username },
            emailRedirectTo: window.location.origin 
          }
        });
        if (error) throw error;
        setView('pending'); // Chuyển sang màn hình chờ
      }
      else if (view === 'forgot') {
        // --- QUÊN MẬT KHẨU ---
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        toast.success("Đã gửi link khôi phục mật khẩu vào email!");
        setView('login');
      }
    } catch (error) {
      let msg = error.message;
      if (msg === "Invalid login credentials") msg = "Sai email hoặc mật khẩu!";
      if (msg === "Email not confirmed") msg = "Email chưa được xác thực! Hãy kiểm tra hộp thư.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN CHỜ XÁC NHẬN EMAIL ---
  if (view === 'pending') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md text-center animate-fade-in border border-emerald-500/50">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <MailWarning size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Kiểm tra Email của bạn</h2>
                <p className="text-slate-300 mb-6">
                    Chúng tôi đã gửi liên kết xác nhận đến <strong>{formData.email}</strong>. <br/>
                    Vui lòng bấm vào link trong email để kích hoạt tài khoản.
                </p>
                <button onClick={() => setView('login')} className="btn-glass w-full">
                    Quay lại Đăng Nhập
                </button>
            </div>
        </div>
    )
  }

  // --- GIAO DIỆN FORM CHÍNH ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative z-10 m-4 border border-slate-700/50 shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center text-gradient mb-2">LIFE RPG</h1>
        <p className="text-slate-400 text-center mb-8 font-medium">
            {view === 'login' && "Đăng nhập để tiếp tục"}
            {view === 'register' && "Khởi tạo nhân vật mới"}
            {view === 'forgot' && "Khôi phục mật khẩu"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {view === 'register' && (
             <div className="relative group animate-fade-in">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20}/>
                <input type="text" placeholder="Tên nhân vật" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 pl-12 text-white focus:border-emerald-500 outline-none transition-colors"
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
          )}

          <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20}/>
              <input type="email" placeholder="Email" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 pl-12 text-white focus:border-emerald-500 outline-none transition-colors"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {view !== 'forgot' && (
             <div className="relative group animate-fade-in">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20}/>
                <input type="password" placeholder="Mật khẩu (min 6 ký tự)" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 pl-12 text-white focus:border-emerald-500 outline-none transition-colors"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          )}
            
          {view === 'login' && (
            <div className="flex items-center justify-between text-sm mt-2">
                <div 
                    className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors"
                    onClick={() => setRemember(!remember)}
                >
                    {remember ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                    <span>Ghi nhớ tôi</span>
                </div>
                <button type="button" onClick={() => setView('forgot')} className="text-emerald-400 hover:underline">
                    Quên mật khẩu?
                </button>
            </div>
          )}

          <button disabled={loading} className="btn-primary w-full py-3 text-lg mt-4">
            {loading ? <Loader2 className="animate-spin" /> : (
                view === 'login' ? "Đăng Nhập" : view === 'register' ? "Đăng Ký" : "Gửi Link Khôi Phục"
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-slate-800/50">
            {view === 'login' ? (
                <button onClick={() => setView('register')} className="text-slate-400 hover:text-emerald-400 text-sm font-bold transition-colors">Chưa có tài khoản? Đăng ký ngay</button>
            ) : (
                <button onClick={() => setView('login')} className="text-slate-400 hover:text-emerald-400 text-sm font-bold transition-colors">Quay lại Đăng nhập</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;