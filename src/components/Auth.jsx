import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { ShieldCheck, Loader2, Lock, Mail, User, LogIn, UserPlus, ArrowLeft, MailWarning, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'pending'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [remember, setRemember] = useState(true);
  
  // State lưu lỗi chi tiết cho từng trường
  const [errors, setErrors] = useState({});

  // --- HÀM VALIDATE CHI TIẾT ---
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Validate Email
    if (!formData.email) {
        newErrors.email = "Vui lòng nhập Email.";
    } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không đúng định dạng.";
    }

    // 2. Validate Password (trừ khi đang quên mật khẩu)
    if (view !== 'forgot') {
        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }
    }

    // 3. Validate Username (chỉ khi đăng ký)
    if (view === 'register') {
        if (!formData.username.trim()) {
            newErrors.username = "Tên nhân vật không được để trống.";
        } else if (formData.username.length < 3) {
            newErrors.username = "Tên nhân vật phải trên 3 ký tự.";
        }
    }

    setErrors(newErrors);
    // Trả về true nếu không có lỗi nào
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLE AUTH (ĐÃ TỐI ƯU) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Dừng nếu validate fail

    setLoading(true);
    setErrors({});

    try {
      // 1. ĐĂNG NHẬP
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Đăng nhập thành công! Đang vào game...");
      } 
      
      // 2. ĐĂNG KÝ
      else if (view === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.username },
            emailRedirectTo: window.location.origin
          }
        });

        if (error) throw error;

        // LOGIC CHUẨN:
        // Nếu user tồn tại và đã confirm -> identities rỗng -> Trùng email
        // Nếu user tồn tại nhưng chưa confirm -> user trả về bình thường nhưng không gửi mail lại (Rate limit)
        
        // Cách an toàn nhất: Luôn thông báo thành công để bảo mật, 
        // nhưng nếu user rỗng hoặc identities rỗng thì cảnh báo nhẹ.
        
        if (data?.user && data?.user?.identities?.length === 0) {
             toast.warning("Email này đã được đăng ký!", {
                 description: "Vui lòng đăng nhập hoặc kiểm tra hộp thư để kích hoạt."
             });
        } else {
             toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
             setView('pending'); 
        }
      }
      
      // 3. QUÊN MẬT KHẨU
      else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        toast.success("Email khôi phục đã được gửi!");
        setView('login');
      }
      
    } catch (error) {
      console.error("Auth Error:", error);
      let msg = error.message;
      
      if (msg.includes("Invalid login")) msg = "Sai email hoặc mật khẩu.";
      if (msg.includes("Email not confirmed")) msg = "Tài khoản chưa kích hoạt. Vui lòng check mail.";
      if (msg.includes("User already registered")) msg = "Email này đã tồn tại.";
      if (msg.includes("weak password")) msg = "Mật khẩu quá yếu."; // Bắt thêm lỗi này của Supabase
      
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- UI: MÀN HÌNH CHỜ ---
  if (view === 'pending') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative p-4">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md text-center border-2 border-emerald-500/30 shadow-2xl">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 animate-pulse">
                    <MailWarning size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Kiểm Tra Email</h2>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 mb-6 text-sm text-slate-300">
                    Chúng tôi đã gửi liên kết kích hoạt đến: <br/>
                    <strong className="text-emerald-400 text-base">{formData.email}</strong>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                    *Nếu không thấy, hãy kiểm tra thư mục Spam hoặc Quảng cáo.
                </p>
                <button onClick={() => setView('login')} className="btn-glass w-full flex items-center justify-center gap-2">
                    <ArrowLeft size={16}/> Quay về Đăng Nhập
                </button>
            </div>
        </div>
    )
  }

  // --- UI: FORM CHÍNH ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans text-slate-200 p-4">
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-2xl">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-lg">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-400 tracking-tight">
            LIFE RPG OS
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            System Login v3.0
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* --- INPUT: USERNAME --- */}
          {view === 'register' && (
            <div>
                <div className={`relative group flex items-center ${errors.username ? 'text-red-400' : 'text-slate-500'}`}>
                    <User size={20} className="absolute left-4 pointer-events-none transition-colors" />
                    <input 
                        type="text" placeholder="Tên nhân vật (VD: Slayer)" 
                        className={`w-full bg-slate-900/60 border rounded-xl py-3.5 pl-12 pr-4 text-white outline-none transition-all
                        ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'}`}
                        value={formData.username}
                        onChange={e => {
                            setFormData({...formData, username: e.target.value});
                            if(errors.username) setErrors({...errors, username: null}); // Xóa lỗi khi gõ
                        }}
                    />
                </div>
                {errors.username && <p className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.username}</p>}
            </div>
          )}

          {/* --- INPUT: EMAIL --- */}
          <div>
            <div className={`relative group flex items-center ${errors.email ? 'text-red-400' : 'text-slate-500'}`}>
                <Mail size={20} className="absolute left-4 pointer-events-none transition-colors" />
                <input 
                    type="email" placeholder="Email đăng nhập" 
                    className={`w-full bg-slate-900/60 border rounded-xl py-3.5 pl-12 pr-4 text-white outline-none transition-all
                    ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'}`}
                    value={formData.email}
                    onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        if(errors.email) setErrors({...errors, email: null});
                    }}
                />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.email}</p>}
          </div>

          {/* --- INPUT: PASSWORD --- */}
          {view !== 'forgot' && (
            <div>
                <div className={`relative group flex items-center ${errors.password ? 'text-red-400' : 'text-slate-500'}`}>
                    <Lock size={20} className="absolute left-4 pointer-events-none transition-colors" />
                    <input 
                        type="password" placeholder="Mật khẩu" 
                        className={`w-full bg-slate-900/60 border rounded-xl py-3.5 pl-12 pr-4 text-white outline-none transition-all
                        ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'}`}
                        value={formData.password}
                        onChange={e => {
                            setFormData({...formData, password: e.target.value});
                            if(errors.password) setErrors({...errors, password: null});
                        }}
                    />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.password}</p>}
            </div>
          )}
          
          {/* --- REMEMBER & FORGOT --- */}
          {view === 'login' && (
            <div className="flex justify-between items-center text-xs px-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                    <div onClick={() => setRemember(!remember)}>
                        {remember ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                    </div>
                    Ghi nhớ tôi
                </label>
                <button type="button" onClick={() => { setView('forgot'); setErrors({}); }} className="text-slate-400 hover:text-emerald-400 transition-colors font-bold">
                    Quên mật khẩu?
                </button>
            </div>
          )}

          {/* --- SUBMIT BUTTON --- */}
          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
                view === 'login' ? <><LogIn size={18}/> ĐĂNG NHẬP</> : 
                view === 'register' ? <><UserPlus size={18}/> TẠO TÀI KHOẢN</> : "GỬI YÊU CẦU"
            )}
          </button>
        </form>

        {/* --- FOOTER --- */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            {view === 'login' ? (
                <p className="text-sm text-slate-500">
                    Người mới? 
                    <button onClick={() => { setView('register'); setErrors({}); }} className="ml-2 text-emerald-400 hover:text-white font-bold transition-colors">
                        Đăng ký ngay
                    </button>
                </p>
            ) : (
                <p className="text-sm text-slate-500">
                    Đã có tài khoản? 
                    <button onClick={() => { setView('login'); setErrors({}); }} className="ml-2 text-emerald-400 hover:text-white font-bold transition-colors">
                        Đăng nhập
                    </button>
                </p>
            )}
        </div>

      </div>
    </div>
  );
};

export default Auth;