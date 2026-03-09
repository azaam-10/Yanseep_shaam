import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Wallet, 
  Ticket as TicketIcon, 
  Trophy, 
  History, 
  User as UserIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronLeft,
  Info,
  Settings,
  Bell,
  Clock,
  ShoppingCart,
  Cpu,
  X,
  Sparkles,
  Copy,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';
import { TICKET_PRICE, PRIZE_TIERS } from './constants';
import { Ticket, User } from './types';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

function AuthForm({ onSuccess, addNotification }: { onSuccess: () => void, addNotification: (t: string, type?: 'success' | 'error') => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [shamCash, setShamCash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addNotification('تم تسجيل الدخول بنجاح');
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              age: parseInt(age),
              sham_cash_address: shamCash
            }
          }
        });
        if (error) throw error;
        addNotification('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Full Auth Error Object:', error);
      let errorMessage = error.error_description || error.message || 'حدث خطأ غير متوقع';
      
      if (errorMessage === 'Invalid login credentials') {
        errorMessage = isLogin ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'حدث خطأ أثناء إنشاء الحساب';
      } else if (errorMessage === 'Email not confirmed') {
        errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً';
      } else if (errorMessage.includes('rate limit exceeded')) {
        errorMessage = 'لقد تجاوزت حد المحاولات المسموح به. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
      }
      
      addNotification(`خطأ: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 rotate-3">
          <Sparkles className="text-black w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight">{isLogin ? 'مرحباً بك مجدداً' : 'انضم إلى النخبة'}</h3>
        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.1em]">
          {isLogin ? 'أدخل بياناتك للوصول إلى محفظتك' : 'أنشئ حسابك وابدأ رحلة الربح اليوم'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-3">
        {!isLogin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">الاسم الأول</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="أحمد"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">الكنية</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="المحمد"
              />
            </div>
          </motion.div>
        )}

        {!isLogin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="space-y-1 col-span-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">العمر</label>
              <input 
                type="number" 
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="25"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">عنوان شام كاش</label>
              <input 
                type="text" 
                required
                value={shamCash}
                onChange={(e) => setShamCash(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="SHAM-XXXX-XXXX"
              />
            </div>
          </motion.div>
        )}

        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">البريد الإلكتروني</label>
          <div className="relative group">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">كلمة المرور</label>
          <div className="relative group">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-1">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black py-3 rounded-xl text-sm shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span className="relative z-10">{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب الآن'}</span>
                {!loading && <ArrowUpRight className="w-4 h-4 relative z-10" />}
              </>
            )}
          </button>
        </div>

        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-cyan-500 transition-colors py-2"
        >
          {isLogin ? 'ليس لديك حساب؟ انضم إلينا الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'أحمد المحمد',
    balance: 2500,
    tickets: [
      { id: 't1', number: '849201', purchaseDate: '2024-03-01', status: 'active' },
      { id: 't2', number: '110293', purchaseDate: '2024-03-05', status: 'active' },
    ]
  });

  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'tickets' | 'winners' | 'profile'>('home');
  const [showDevGuide, setShowDevGuide] = useState(false);
  const [showMachine, setShowMachine] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnWinners, setDrawnWinners] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rechargeReceipt, setRechargeReceipt] = useState<File | null>(null);
  const [rechargeStatus, setRechargeStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'success' | 'error'}[]>([]);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (supabaseUser) {
      setUser(prev => ({
        ...prev,
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'مستخدم جديد',
      }));
    } else {
      setUser({
        id: 'guest',
        name: 'زائر',
        balance: 0,
        tickets: []
      });
    }
  }, [supabaseUser]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [showNextLevel, setShowNextLevel] = useState(false);

  const LEVELS = [
    { name: 'برونز 1', tickets: 1000, prizePool: 9000, color: 'bg-bronze', textColor: 'text-[#cd7f32]' },
    { name: 'برونز 2', tickets: 2000, prizePool: 18000, color: 'bg-bronze', textColor: 'text-[#cd7f32]' },
    { name: 'برونز 3', tickets: 3000, prizePool: 27000, color: 'bg-bronze', textColor: 'text-[#cd7f32]' },
    { name: 'سيلفر 1', tickets: 5000, prizePool: 45000, color: 'bg-silver', textColor: 'text-gray-400' },
    { name: 'سيلفر 2', tickets: 10000, prizePool: 90000, color: 'bg-silver', textColor: 'text-gray-400' },
    { name: 'جولد 1', tickets: 20000, prizePool: 180000, color: 'bg-gold', textColor: 'text-gold' },
  ];

  const [shopTickets, setShopTickets] = useState<{id: string, number: string, sold: boolean}[]>([]);

  useEffect(() => {
    const ticketCount = LEVELS[currentLevelIndex].tickets;
    const newTickets = Array.from({ length: ticketCount }, (_, i) => ({
      id: `s${i}`,
      number: (100000 + i + 1).toString(), // Sequential numbers starting from 100001
      sold: Math.random() > 0.85
    }));
    setShopTickets(newTickets);
  }, [currentLevelIndex]);

  const RECHARGE_ADDRESS = "bc31c5af70694dc0825ed2dce3167888";

  const addNotification = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const startDraw = useCallback(() => {
    setIsDrawing(true);
    setDrawnWinners([]);
    let count = 0;
    const interval = setInterval(() => {
      const newWinner = Math.floor(100000 + Math.random() * 900000).toString();
      setDrawnWinners(prev => [newWinner, ...prev].slice(0, 14));
      count++;
      if (count >= 14) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, 1500);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target: Next Friday at 12:00 PM (Noon)
      let target = new Date();
      target.setHours(12, 0, 0, 0);
      
      // Day of week: 0 (Sun) to 6 (Sat). Friday is 5.
      const dayOfWeek = now.getDay();
      let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      
      if (daysUntilFriday === 0 && now.getHours() >= 12) {
        if (!isDrawing && drawnWinners.length === 0) {
          daysUntilFriday = 7;
        }
      }
      
      target.setDate(now.getDate() + daysUntilFriday);
      
      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Draw time!
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (showMachine && !isDrawing && drawnWinners.length === 0) {
          startDraw();
        }
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [showMachine, isDrawing, drawnWinners, startDraw]);

  const buyTicket = (forcedNumber?: string) => {
    if (!supabaseUser) {
      addNotification('يرجى تسجيل الدخول لشراء الكروت', 'error');
      setShowAuthModal(true);
      return false;
    }
    if (user.balance >= TICKET_PRICE) {
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        number: forcedNumber || Math.floor(100000 + Math.random() * 900000).toString(),
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setUser({
        ...user,
        balance: user.balance - TICKET_PRICE,
        tickets: [newTicket, ...user.tickets]
      });
      addNotification('تم شراء الكرت بنجاح! حظاً موفقاً');
      return true;
    }
    addNotification('عذراً، رصيدك غير كافٍ لشراء الكرت', 'error');
    return false;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RECHARGE_ADDRESS);
    addNotification('تم نسخ عنوان المحفظة بنجاح');
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUser) {
      addNotification('يرجى تسجيل الدخول أولاً', 'error');
      setShowAuthModal(true);
      return;
    }
    setRechargeStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setRechargeStatus('success');
      setTimeout(() => {
        setShowRecharge(false);
        setRechargeStatus('idle');
        setRechargeReceipt(null);
        addNotification('تم إرسال طلب الشحن بنجاح! سيتم التحقق من الوصل قريباً');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden" dir="rtl">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-600/10 blur-[160px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[50%] left-[20%] w-[30%] h-[30%] bg-cyan-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Notifications */}
      <div className="fixed top-24 left-6 right-6 z-[110] pointer-events-none space-y-3">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto ${
                n.type === 'success' ? 'bg-cyan-500 text-black' : 'bg-red-500 text-white'
              }`}
            >
              {n.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
              <span className="text-sm font-bold">{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 rotate-3">
            <Trophy className="text-black w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white font-serif italic">شام لوتري</h1>
            <p className="text-[8px] text-cyan-500 uppercase tracking-[0.2em] font-bold">The Royal Draw</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {supabaseUser ? (
            <button 
              onClick={() => supabase.auth.signOut()}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all text-cyan-500 text-[10px] font-black uppercase tracking-wider border border-cyan-500/20 flex items-center gap-2"
            >
              <LogIn className="w-3 h-3" />
              دخول
            </button>
          )}
          <button 
            onClick={() => setShowActivityPanel(true)}
            className="relative p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full border-2 border-black" />
          </button>
          <button onClick={() => setShowDevGuide(!showDevGuide)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-4 pb-28 space-y-6">
        
        {activeTab === 'home' && (
          <>
            {/* Hero Section: Wallet + Quick Buy */}
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1c20] to-[#0a0a0a] border border-white/10 p-4 shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl rounded-full -mr-12 -mt-12" />
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[9px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">الرصيد المتوفر</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tighter text-white drop-shadow-sm">{user.balance.toLocaleString()}</span>
                      <span className="text-[10px] text-cyan-500 font-bold">ل.س</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (!supabaseUser) {
                          addNotification('يرجى تسجيل الدخول لشحن الرصيد', 'error');
                          setShowAuthModal(true);
                        } else {
                          setShowRecharge(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2.5 bg-gradient-to-br from-cyan-400 to-cyan-600 text-black rounded-xl hover:from-cyan-300 hover:to-cyan-500 transition-all active:scale-90 shadow-lg shadow-cyan-500/30"
                    >
                      <ArrowDownLeft size={20} className="font-black" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">إيداع</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!supabaseUser) {
                          addNotification('يرجى تسجيل الدخول لصرف الجوائز', 'error');
                          setShowAuthModal(true);
                        } else {
                          setShowRedeem(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2.5 bg-gradient-to-br from-cyan-400 to-cyan-600 text-black rounded-xl hover:from-cyan-300 hover:to-cyan-500 transition-all active:scale-90 shadow-lg shadow-cyan-500/20"
                    >
                      <Sparkles size={20} className="text-black" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">صرف</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (!supabaseUser) {
                          addNotification('يرجى تسجيل الدخول لسحب الرصيد', 'error');
                          setShowAuthModal(true);
                        } else {
                          addNotification('خاصية السحب ستتوفر قريباً', 'error');
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2.5 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all active:scale-90 shadow-lg shadow-black/20"
                    >
                      <ArrowUpRight size={20} className="font-black" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">سحب</span>
                    </button>
                  </div>
                </div>

                {/* Prominent Buy Now Banner inside Hero */}
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 p-3 rounded-xl flex items-center justify-between group relative overflow-hidden active:scale-[0.98] transition-all"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="bg-black/20 p-1.5 rounded-lg">
                      <TicketIcon className="text-white w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-white/80 font-bold uppercase tracking-wider">سعر الكرت الموحد</p>
                      <p className="text-sm font-black text-white">10 ليرة سورية فقط</p>
                    </div>
                  </div>
                  <div className="bg-white text-black px-3 py-1.5 rounded-lg font-black text-xs shadow-xl relative z-10">
                    اشترِ الآن
                  </div>
                </button>
              </motion.div>

              {/* Countdown Timer - Urgency */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowMachine(true)}
                className="bg-white/5 border border-white/5 rounded-2xl p-3 relative overflow-hidden cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="text-cyan-500 w-3.5 h-3.5" />
                    <h2 className="text-[9px] font-bold uppercase tracking-wider text-gray-400">السحب القادم خلال:</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest">مباشر</span>
                  </div>
                </div>
                <div className="flex justify-around items-center">
                  {[
                    { label: 'يوم', value: timeLeft.days },
                    { label: 'ساعة', value: timeLeft.hours },
                    { label: 'دقيقة', value: timeLeft.minutes },
                    { label: 'ثانية', value: timeLeft.seconds },
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xl font-black tracking-tighter tabular-nums text-white leading-none">
                        {unit.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{unit.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-cyan-500/10 py-2 rounded-xl flex items-center justify-center gap-2 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                  <span className="text-[9px] font-black uppercase tracking-widest">دخول غرفة السحب</span>
                  <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.section>
            </div>

            {/* Level Badge Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${LEVELS[currentLevelIndex].color} flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                    <Trophy size={24} className="text-black/80" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">المستوى الحالي</p>
                    <h3 className={`text-lg font-black tracking-tight ${LEVELS[currentLevelIndex].textColor}`}>
                      {LEVELS[currentLevelIndex].name}
                    </h3>
                  </div>
                </div>
                <div className="text-left relative z-10">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">إجمالي الكروت</p>
                  <p className="text-lg font-black text-cyan-500 tracking-tighter">
                    {LEVELS[currentLevelIndex].tickets.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => setShowNextLevel(!showNextLevel)}
                  className="absolute left-0 top-0 bottom-0 w-10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border-l border-white/5"
                >
                  <ChevronLeft size={20} className={`transition-transform duration-300 ${showNextLevel ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Home Page Ticket Progress Bar */}
              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-bold">المتبقي في المتجر</span>
                  </div>
                  <span className="text-[10px] text-cyan-500 font-black">
                    {shopTickets.filter(t => !t.sold).length.toLocaleString()} / {shopTickets.length.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(shopTickets.filter(t => !t.sold).length / shopTickets.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showNextLevel && currentLevelIndex < LEVELS.length - 1 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${LEVELS[currentLevelIndex + 1]?.color || 'bg-gray-500'} opacity-50 flex items-center justify-center`}>
                        <Clock size={16} className="text-black" />
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">الأسبوع القادم</p>
                        <h3 className="text-xs font-bold text-gray-300">{LEVELS[currentLevelIndex + 1]?.name || 'قريباً'}</h3>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">الكروت المتوقعة</p>
                      <p className="text-xs font-bold text-gray-300">{LEVELS[currentLevelIndex + 1]?.tickets?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Tickets Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">كروتي النشطة</h2>
                <button 
                  onClick={() => setActiveTab('tickets')}
                  className="text-[11px] text-cyan-500 font-bold flex items-center gap-1"
                >
                  رؤية الكل <ChevronLeft size={12} />
                </button>
              </div>
              
              <div className="space-y-2">
                {user.tickets.length > 0 ? (
                  user.tickets.slice(0, 3).map((ticket) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={ticket.id}
                      className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between group hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                          <TicketIcon size={20} />
                        </div>
                        <div>
                          <p className="text-base font-mono font-bold tracking-[0.2em]">{ticket.number}</p>
                          <p className="text-[9px] text-gray-500 font-medium">تاريخ الشراء: {ticket.purchaseDate}</p>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                        <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">نشط</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 text-xs">لا يوجد كروت حالياً. ابدأ بالمشاركة الآن!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Prize Tiers Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">توزيع الجوائز</h2>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">أسبوعياً</div>
              </div>
              <div className="bg-[#1a1c20] rounded-2xl border border-white/10 overflow-hidden">
                {PRIZE_TIERS.map((tier, i) => (
                  <div 
                    key={tier.level} 
                    className={`p-3 flex items-center justify-between ${i !== PRIZE_TIERS.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                        tier.level === 1 ? 'bg-cyan-500/20 text-cyan-500' : 
                        tier.level === 2 ? 'bg-slate-300/20 text-slate-300' : 
                        'bg-white/5 text-gray-400'
                      }`}>
                        {tier.level}
                      </span>
                      <span className="text-xs font-medium text-gray-300">{tier.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">
                        {((LEVELS[currentLevelIndex]?.prizePool || 0) * tier.percentage / 100).toLocaleString()} ل.س
                      </p>
                      <p className="text-[9px] text-gray-500">{tier.percentage}% من الصندوق</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'shop' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('home')} className="p-1.5 bg-white/5 rounded-lg">
                  <ChevronLeft className="rotate-180 w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold">متجر الكروت</h2>
                  <p className="text-[10px] text-gray-500 font-bold">اختر كرتك المفضل أو اشترِ عشوائياً</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const available = shopTickets.filter(t => !t.sold);
                  if (available.length > 0) {
                    const random = available[Math.floor(Math.random() * available.length)];
                    if (buyTicket(random.number)) {
                      setShopTickets(prev => prev.map(t => t.id === random.id ? { ...t, sold: true } : t));
                    }
                  }
                }}
                className="bg-cyan-500 text-black px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                شراء عشوائي
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <TicketIcon className="text-cyan-500 w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">المستوى الحالي: {LEVELS[currentLevelIndex].name}</h3>
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">نظام السحب الأسبوعي</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">عدد الكروت</p>
                    <p className="text-lg font-black text-cyan-500 tracking-tighter tabular-nums">{LEVELS[currentLevelIndex].tickets.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-gray-400 font-bold">المتبقي: {shopTickets.filter(t => !t.sold).length.toLocaleString()} كرت</span>
                    <span className="text-[9px] text-cyan-500 font-black">
                      {Math.round((shopTickets.filter(t => !t.sold).length / shopTickets.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(shopTickets.filter(t => !t.sold).length / shopTickets.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                {/* 1st Prize */}
                <div className="col-span-12 prize-card-main p-3 rounded-2xl relative overflow-hidden group gold-glow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-cyan-500/20 transition-colors duration-700" />
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-inner">
                        <Trophy className="text-cyan-500 w-5 h-5 animate-float" />
                      </div>
                      <div>
                        <p className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-0.5">المركز الأول</p>
                        <p className="text-xl font-black text-white tracking-tighter tabular-nums">{(LEVELS[currentLevelIndex].prizePool * 0.4).toLocaleString()} <span className="text-[10px] font-bold text-cyan-500/60">ل.س</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg shadow-cyan-500/20">فائز واحد</div>
                    </div>
                  </div>
                </div>

                {/* 2nd Prize */}
                <div className="col-span-6 prize-card-secondary p-2.5 rounded-2xl relative overflow-hidden group">
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-7 h-7 rounded-lg bg-gray-400/10 flex items-center justify-center border border-gray-400/20">
                        <Trophy className="text-gray-400 w-3.5 h-3.5" />
                      </div>
                      <div className="bg-gray-400/10 text-gray-400 text-[8px] font-black px-1.5 py-0.5 rounded-md">فائز واحد</div>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider mb-0.5">المركز الثاني</p>
                      <p className="text-base font-black text-white tracking-tighter tabular-nums">{(LEVELS[currentLevelIndex].prizePool * 0.2).toLocaleString()} <span className="text-[9px] text-gray-500">ل.س</span></p>
                    </div>
                  </div>
                </div>

                {/* 3rd Prize */}
                <div className="col-span-6 prize-card-secondary p-2.5 rounded-2xl relative overflow-hidden group">
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-7 h-7 rounded-lg bg-[#cd7f32]/10 flex items-center justify-center border border-[#cd7f32]/20">
                        <Trophy className="text-[#cd7f32] w-3.5 h-3.5" />
                      </div>
                      <div className="bg-[#cd7f32]/10 text-[#cd7f32] text-[8px] font-black px-1.5 py-0.5 rounded-md">فائزان</div>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider mb-0.5">المركز الثالث</p>
                      <p className="text-base font-black text-white tracking-tighter tabular-nums">{(LEVELS[currentLevelIndex].prizePool * 0.1).toLocaleString()} <span className="text-[9px] text-gray-500">ل.س</span></p>
                    </div>
                  </div>
                </div>

                {/* Consolation Prizes */}
                <div className="col-span-12 prize-card-secondary p-2.5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Sparkles className="text-cyan-500 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-wider mb-0.5">جوائز الترضية (10 فائزين)</p>
                        <p className="text-sm font-black text-white tracking-tighter tabular-nums">{(LEVELS[currentLevelIndex].prizePool * 0.02).toLocaleString()} <span className="text-[9px] text-cyan-500/60 font-bold">ل.س لكل فائز</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar relative">
              {shopTickets.length === 0 && (
                <div className="col-span-5 py-20 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-xs">جاري تحميل الكروت...</p>
                </div>
              )}
              {shopTickets.length > 0 && shopTickets.every(t => t.sold) && (
                <div className="col-span-5 py-10 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 text-sm font-black">عذراً، جميع الكروت مباعة!</p>
                  <p className="text-gray-500 text-[10px] mt-1">انتظر السحب القادم أو المستوى التالي</p>
                </div>
              )}
              {shopTickets.map((ticket) => (
                <button 
                  key={ticket.id}
                  disabled={ticket.sold}
                  onClick={() => {
                    if (buyTicket(ticket.number)) {
                      setShopTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, sold: true } : t));
                    }
                  }}
                  className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all active:scale-90 ${
                    ticket.sold 
                      ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed' 
                      : 'bg-[#1a1c20] border-white/10 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold">{ticket.number}</span>
                  {ticket.sold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg backdrop-blur-[1px]">
                      <span className="text-[7px] font-black text-red-500 rotate-[-15deg] border-2 border-red-500 px-1 py-0.5 rounded-sm uppercase shadow-lg bg-black/20">مباع</span>
                    </div>
                  )}
                  {!ticket.sold && (
                    <TicketIcon size={10} className="text-cyan-500 mt-0.5 opacity-30" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-center">
              <p className="text-cyan-500 text-sm font-black">لقد اشتريت جميع الكروت المتاحة!</p>
              <p className="text-gray-500 text-[10px] mt-1">سيتم فتح المستوى التالي قريباً</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {!supabaseUser ? (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <TicketIcon size={40} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white">لم تقم بتسجيل الدخول</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">سجل دخولك لعرض كروتك المشتراة</p>
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all text-sm"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">كروتي ({user.tickets.length})</h2>
                  <button onClick={() => setActiveTab('shop')} className="p-1.5 bg-cyan-500 rounded-lg text-black">
                    <ShoppingCart size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  {user.tickets.length > 0 ? (
                    user.tickets.map((ticket) => (
                      <div key={ticket.id} className="relative overflow-hidden bg-[#1a1c20] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <TicketIcon size={22} />
                          </div>
                          <div>
                            <p className="text-xl font-mono font-bold tracking-[0.2em] text-white">{ticket.number}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-gray-500">{ticket.purchaseDate}</span>
                              <span className="w-0.5 h-0.5 bg-gray-700 rounded-full" />
                              <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest">نشط</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                          <Cpu size={14} className="text-gray-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <TicketIcon size={40} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-500 font-bold text-sm">لا تملك أي كروت حالياً</p>
                      <button onClick={() => setActiveTab('shop')} className="mt-3 text-cyan-500 font-bold text-xs">اذهب للمتجر الآن</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'winners' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">الفائزين السابقين</h2>
              <div className="bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">سحب الجمعة الماضي</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'محمد العلي', amount: 2000, ticket: '100492', rank: 1 },
                { name: 'سارة الأحمد', amount: 1000, ticket: '100110', rank: 2 },
                { name: 'خالد الحسين', amount: 500, ticket: '100552', rank: 3 },
                { name: 'ليلى المحمد', amount: 500, ticket: '100992', rank: 4 },
                { name: 'عمر الفاروق', amount: 100, ticket: '100330', rank: 5 },
              ].map((winner, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                  {winner.rank === 1 && <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />}
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg ${
                      winner.rank === 1 ? 'bg-cyan-500 text-black' : 
                      winner.rank === 2 ? 'bg-gray-400 text-black' : 
                      winner.rank === 3 ? 'bg-[#cd7f32] text-black' : 'bg-white/5 text-gray-500'
                    }`}>
                      {winner.rank}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white tracking-tight">{winner.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono tracking-wider">TICKET #{winner.ticket}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className={`text-lg font-black tracking-tighter tabular-nums ${winner.rank === 1 ? 'text-cyan-500' : 'text-white'}`}>
                      {winner.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">SYP</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {!supabaseUser ? (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <UserIcon size={40} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white">لم تقم بتسجيل الدخول</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">سجل دخولك لعرض ملفك الشخصي وإدارة كروتك</p>
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all text-sm"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                        <UserIcon size={40} className="text-gray-700" />
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-cyan-500 rounded-full text-black border-2 border-black">
                      <Settings size={14} />
                    </button>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500 text-xs">معرف المستخدم: #{user.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">إجمالي الكروت</p>
                    <p className="text-xl font-bold">{user.tickets.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">إجمالي الأرباح</p>
                    <p className="text-xl font-bold text-cyan-500">0</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-gray-400 px-2">الإعدادات العامة</h3>
                  <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    {[
                      { icon: <Bell size={16} />, label: 'الإشعارات', value: 'مفعل' },
                      { icon: <Settings size={16} />, label: 'اللغة', value: 'العربية' },
                      { icon: <Info size={16} />, label: 'عن التطبيق', value: 'v1.0.4' },
                    ].map((item, i) => (
                      <button key={i} className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2.5 text-gray-300">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{item.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
                >
                  تسجيل الخروج
                </button>
              </>
            )}
          </motion.div>
        )}

      </main>

      {/* Activity Panel Modal */}
      <AnimatePresence>
        {showActivityPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex justify-end"
            onClick={() => setShowActivityPanel(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-[320px] bg-[#0a0a0a] border-l border-white/10 h-full p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                    <Bell size={20} />
                  </div>
                  <h2 className="text-xl font-black">النشاطات الأخيرة</h2>
                </div>
                <button 
                  onClick={() => setShowActivityPanel(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {[
                  { type: 'buy', text: 'شراء كرت يانصيب', time: 'منذ دقيقتين', amount: '-10' },
                  { type: 'recharge', text: 'شحن رصيد محفظة', time: 'منذ ساعة', amount: '+5000' },
                  { type: 'buy', text: 'شراء حزمة كروت (5)', time: 'منذ 3 ساعات', amount: '-50' },
                  { type: 'win', text: 'فوز بجائزة المركز الثالث', time: 'منذ يوم', amount: '+500' },
                  { type: 'recharge', text: 'شحن رصيد محفظة', time: 'منذ يومين', amount: '+2000' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'recharge' ? 'bg-cyan-500/10 text-cyan-500' : 
                        activity.type === 'win' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {activity.type === 'recharge' ? <ArrowDownLeft size={18} /> : 
                         activity.type === 'win' ? <Trophy size={18} /> :
                         <ShoppingCart size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{activity.text}</p>
                        <p className="text-[10px] text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black tabular-nums ${
                      activity.amount.startsWith('+') ? 'text-cyan-500' : 'text-gray-400'
                    }`}>
                      {activity.amount}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-white/5">
                <button 
                  onClick={() => setShowActivityPanel(false)}
                  className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-bold text-xs hover:bg-white/10 transition-all"
                >
                  إغلاق الإشعارات
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lottery Machine Modal */}
      <AnimatePresence>
        {showMachine && (
          <motion.div 
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[130] bg-black/98 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto custom-scrollbar"
          >
            {/* Header with Close */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Cpu size={24} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter text-white uppercase">غرفة السحب الذكي</h2>
                  <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Smart Draw System</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMachine(false)}
                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-w-md mx-auto w-full space-y-10">
              {/* 1. Top Section: Countdown Timer */}
              <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 rounded-[2.5rem] text-center space-y-4 shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">الوقت المتبقي للسحب</p>
                </div>
                <div className="flex justify-center gap-6">
                  {[
                    { label: 'يوم', value: timeLeft.days },
                    { label: 'ساعة', value: timeLeft.hours },
                    { label: 'دقيقة', value: timeLeft.minutes },
                    { label: 'ثانية', value: timeLeft.seconds },
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-4xl font-black tracking-tighter tabular-nums text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {unit.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{unit.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Middle Section: The Machine (Spinning Wheels) */}
              <div className="relative py-4">
                <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] rounded-full" />
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  {/* Decorative Rings */}
                  <div className={`absolute inset-0 rounded-full border border-dashed border-cyan-500/20 ${isDrawing ? 'animate-spin-slow' : ''}`} />
                  <div className={`absolute inset-3 rounded-full border border-white/5 ${isDrawing ? 'animate-spin-reverse-slow' : ''}`} />
                  
                  {/* Machine Core */}
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#1a1c20] to-[#050505] flex items-center justify-center border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.1)] overflow-hidden">
                    {isDrawing ? (
                      <div className="flex flex-col items-center gap-2">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 0.3 }}
                          className="text-4xl font-mono font-black tracking-tighter text-white"
                        >
                          {Math.floor(100000 + Math.random() * 900000)}
                        </motion.div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
                          <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em]">جاري السحب...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20">
                        <Trophy size={32} className="text-cyan-500" />
                        <span className="text-[7px] font-black uppercase tracking-widest">جاهز</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Bottom Section: Winner Slots */}
              <div className="space-y-6 pb-10">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">قائمة الفائزين (14)</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold">{drawnWinners.length} / 14</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const rank = i + 1; // Rank 1 at top
                    const winner = drawnWinners[14 - rank];
                    
                    // Prize Calculation
                    let prizePercentage = 0;
                    let rankLabel = "";
                    let rankColor = "text-gray-400";
                    let cardStyle = "bg-white/[0.02] border-white/5 border-dashed";
                    let iconColor = "text-gray-600";
                    
                    if (rank === 1) {
                      prizePercentage = 40;
                      rankLabel = "الفائز الأول";
                      rankColor = "text-yellow-500";
                      cardStyle = winner 
                        ? "bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)] scale-105 z-10"
                        : "bg-yellow-500/5 border-yellow-500/10 border-dashed";
                      iconColor = "text-yellow-500";
                    } else if (rank === 2) {
                      prizePercentage = 20;
                      rankLabel = "الفائز الثاني";
                      rankColor = "text-slate-300";
                      cardStyle = winner
                        ? "bg-gradient-to-br from-slate-300/20 to-transparent border-slate-300/40 shadow-[0_0_20px_rgba(203,213,225,0.15)]"
                        : "bg-slate-300/5 border-slate-300/10 border-dashed";
                      iconColor = "text-slate-300";
                    } else if (rank <= 4) {
                      prizePercentage = 10;
                      rankLabel = `الفائز ${rank === 3 ? 'الثالث' : 'الرابع'}`;
                      rankColor = "text-orange-400";
                      cardStyle = winner
                        ? "bg-gradient-to-br from-orange-400/10 to-transparent border-orange-400/30"
                        : "bg-orange-400/5 border-orange-400/10 border-dashed";
                      iconColor = "text-orange-400";
                    } else {
                      prizePercentage = 2;
                      rankLabel = `الفائز ${rank}`;
                      rankColor = "text-cyan-500/70";
                      cardStyle = winner ? "bg-cyan-500/5 border-cyan-500/20" : "bg-white/[0.02] border-white/5 border-dashed";
                      iconColor = "text-cyan-500/40";
                    }

                    const prizeAmount = ((LEVELS[currentLevelIndex]?.prizePool || 0) * prizePercentage / 100).toLocaleString();

                    return (
                      <motion.div 
                        key={i}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`h-24 rounded-3xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${cardStyle}`}
                      >
                        {winner ? (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center w-full px-2"
                          >
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Trophy size={10} className={iconColor} />
                              <p className={`text-[8px] font-black uppercase tracking-widest ${rankColor}`}>{rankLabel}</p>
                            </div>
                            <p className="text-lg font-mono font-black text-white tracking-widest mb-1">{winner}</p>
                            <div className="bg-black/40 py-0.5 px-2 rounded-full inline-block">
                              <p className="text-[9px] font-black text-green-400">{prizeAmount} ل.س</p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-20">
                              <Trophy size={8} className={iconColor} />
                              <p className={`text-[7px] font-black uppercase tracking-widest ${rankColor}`}>{rankLabel}</p>
                            </div>
                            <div className="w-8 h-0.5 bg-white/10 rounded-full mb-1" />
                            <p className="text-[9px] font-black text-white/10">{prizeAmount} ل.س</p>
                            <p className="text-[6px] font-bold text-white/5 uppercase tracking-widest">قيد السحب</p>
                          </div>
                        )}
                        
                        {/* Rank Badge */}
                        <div className="absolute top-2 right-3 text-[10px] font-black text-white/5">
                          #{rank}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {!isDrawing && drawnWinners.length === 14 && (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setDrawnWinners([]);
                      setShowMachine(false);
                      setActiveTab('winners');
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-black py-5 rounded-[2rem] text-sm shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all"
                  >
                    اعتماد النتائج وحفظ السجل
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recharge Modal */}
      <AnimatePresence>
        {showRecharge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <button 
              onClick={() => setShowRecharge(false)}
              className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>

            <div className="w-full max-w-md space-y-5 text-center py-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-cyan-500">شحن الرصيد</h2>
                <p className="text-gray-400 text-xs">قم بتحويل المبلغ إلى العنوان التالي وأرفق صورة الإشعار</p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white rounded-2xl p-4 shadow-2xl shadow-cyan-500/10 max-w-[220px] mx-auto">
                <div className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center overflow-hidden p-1">
                  <QRCodeCanvas 
                    value={RECHARGE_ADDRESS} 
                    size={200}
                    level="H"
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-3 text-black">
                  <p className="text-xs font-black">صدام عزيز الدحو</p>
                  <p className="text-[9px] font-bold opacity-60 mt-0.5 break-all">{RECHARGE_ADDRESS}</p>
                </div>
              </div>

              {/* Address Copy Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="text-right overflow-hidden">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">عنوان التحويل</p>
                  <p className="text-[11px] font-mono text-white truncate">{RECHARGE_ADDRESS}</p>
                </div>
                <button 
                  onClick={handleCopyAddress}
                  className="p-2.5 bg-cyan-500 rounded-lg text-black hover:bg-cyan-400 transition-all active:scale-90"
                >
                  <Copy size={16} />
                </button>
              </div>

              {/* Upload Receipt Section */}
              <form onSubmit={handleRechargeSubmit} className="space-y-3">
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setRechargeReceipt(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center gap-2 ${rechargeReceipt ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                    {rechargeReceipt ? (
                      <>
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-black">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="text-xs font-bold text-cyan-500 truncate max-w-full">{rechargeReceipt.name}</div>
                        <p className="text-[9px] text-gray-500">اضغط لتغيير الصورة</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
                          <Upload size={20} />
                        </div>
                        <div className="text-xs font-bold text-gray-300">إرفاق إشعار التحويل</div>
                        <p className="text-[9px] text-gray-500">اسحب الصورة هنا أو اضغط للاختيار</p>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!rechargeReceipt || rechargeStatus !== 'idle'}
                  className={`w-full font-black py-3.5 rounded-xl text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                    rechargeStatus === 'success' ? 'bg-green-500 text-white' :
                    rechargeReceipt ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {rechargeStatus === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : rechargeStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={20} />
                      <span>تم الإرسال بنجاح</span>
                    </>
                  ) : (
                    <span>إرسال الطلب</span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem Modal */}
      <AnimatePresence>
        {showRedeem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setShowRedeem(false)}
              className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>

            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-cyan-500">صرف الكرت</h2>
                <p className="text-gray-400 text-xs">أدخل رقم الكرت الرابح لتحويل الجائزة إلى محفظتك</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">رقم الكرت</label>
                  <input 
                    type="text" 
                    placeholder="000000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (!supabaseUser) {
                      addNotification('يرجى تسجيل الدخول أولاً', 'error');
                      setShowAuthModal(true);
                      return;
                    }
                    addNotification('جاري التحقق من الكرت...', 'success');
                    setTimeout(() => {
                      addNotification('عذراً، هذا الكرت لم يربح في السحب الأخير', 'error');
                    }, 2000);
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl text-base transition-all shadow-xl shadow-cyan-500/20"
                >
                  تحقق واصرف الجائزة
                </button>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-start gap-3 text-right">
                <Info size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  يتم صرف الجوائز تلقائياً بعد السحب. استخدم هذه الميزة فقط إذا كنت تملك كرت رابح ولم يتم تحديث رصيدك.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#1a1c20] border border-white/10 rounded-[2rem] w-full max-w-sm p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 left-5 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all z-20"
              >
                <X size={18} />
              </button>

              <AuthForm onSuccess={() => setShowAuthModal(false)} addNotification={addNotification} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-black/60 backdrop-blur-2xl border-t border-white/5 px-6 py-3 flex items-center justify-between pb-8">
        {[
          { id: 'home', icon: <History />, label: 'الرئيسية' },
          { id: 'shop', icon: <ShoppingCart />, label: 'المتجر' },
          { id: 'tickets', icon: <TicketIcon />, label: 'كروتي' },
          { id: 'winners', icon: <Trophy />, label: 'النتائج' },
          { id: 'profile', icon: <UserIcon />, label: 'حسابي' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-all relative ${activeTab === tab.id ? 'text-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-cyan-500/10 shadow-lg shadow-cyan-500/5' : ''}`}>
              {React.cloneElement(tab.icon as React.ReactElement, { size: activeTab === tab.id ? 22 : 20, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-500/20 blur-xl rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Developer Guide Modal */}
      <AnimatePresence>
        {showDevGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1c20] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-500">دليل المطور (Technical Guide)</h2>
                <button onClick={() => setShowDevGuide(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="space-y-5 text-right" dir="rtl">
                <section>
                  <h3 className="text-base font-bold text-white mb-1.5">1. الحسابات المالية (Calculations)</h3>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>عدد المستخدمين المستهدف: 100,000</li>
                    <li>سعر الكرت: 10 ل.س</li>
                    <li>إجمالي المبلغ: 1,000,000 ل.س</li>
                    <li>صندوق الجوائز (90%): 900,000 ل.س</li>
                    <li>الربح الصافي (10%): 100,000 ل.س</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base font-bold text-white mb-1.5">2. توزيع الجوائز (Prize Distribution)</h3>
                  <div className="bg-black/30 p-3 rounded-xl text-[11px] font-mono space-y-1">
                    <p>Level 1: 40% of Prize Pool</p>
                    <p>Level 2: 20% of Prize Pool</p>
                    <p>Level 3: 20% of Prize Pool (10% each for 2 winners)</p>
                    <p>Level 4: 20% of Prize Pool (2% each for 10 winners)</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-bold text-white mb-1.5">3. التقنيات المقترحة (Tech Stack)</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li><strong className="text-white">Frontend:</strong> React Native or Flutter</li>
                    <li><strong className="text-white">Backend:</strong> Node.js (Express) or Go</li>
                    <li><strong className="text-white">Database:</strong> PostgreSQL + Redis</li>
                    <li><strong className="text-white">Security:</strong> JWT Auth, SSL, Provably Fair Randomness</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-base font-bold text-white mb-1.5">4. منطق السحب (Draw Logic)</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    يجب استخدام خوارزمية توليد أرقام عشوائية مشفرة (CSPRNG). يتم السحب في يوم الجمعة من كل أسبوع الساعة 12:00 م.
                  </p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
