import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Loader2,
  ShieldCheck,
  RefreshCw,
  Share2,
  Plus,
  Search,
  Eye,
  Trash2,
  RotateCcw,
  Unlock,
  Gift,
  Star
} from 'lucide-react';
import { TICKET_PRICE, PRIZE_TIERS } from './constants';
import { Ticket, User } from './types';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

function AuthForm({ onSuccess, addNotification, initialMode = 'login' }: { onSuccess: () => void, addNotification: (t: string, type?: 'success' | 'error') => void, initialMode?: 'login' | 'signup' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [naseebCash, setNaseebCash] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      const storedCode = localStorage.getItem('referral_code');
      if (storedCode) setReferralCode(storedCode);
    }
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addNotification('تم تسجيل الدخول بنجاح');
      } else {
        // Find referrer ID from code if provided
        let referredBy = null;
        if (referralCode && referralCode.trim()) {
          console.log('Searching for referral code:', referralCode.trim());
          const { data: referrer, error: refError } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode.trim())
            .maybeSingle();
          
          if (refError) {
            console.error('Referral lookup error:', refError);
          }
          
          if (referrer) {
            referredBy = referrer.id;
            console.log('Referrer found! ID:', referredBy);
          } else {
            console.warn('No user found with this referral code.');
          }
        }

        const ageValue = age !== '' ? parseInt(age) : null;
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              age: !isNaN(Number(ageValue)) ? ageValue : null,
              sham_cash_address: naseebCash,
              email: email,
              referred_by: referredBy
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
      } else if (errorMessage === 'User already registered') {
        errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.';
      } else if (errorMessage.includes('Database error saving new user')) {
        errorMessage = 'خطأ في قاعدة البيانات: يرجى التأكد من تشغيل ملف الإعداد SQL في Supabase.';
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
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">عنوان نصيب كاش</label>
              <input 
                type="text" 
                required
                value={naseebCash}
                onChange={(e) => setNaseebCash(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="NASEEB-XXXX-XXXX"
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

        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-1">كود الإحالة (اختياري)</label>
            <div className="relative group">
              <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                placeholder="123456"
              />
            </div>
          </div>
        )}

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

function AdminPanel({ 
  onClose, 
  requests, 
  withdrawals,
  onRefresh, 
  addNotification,
  setRequests,
  setWithdrawals
}: { 
  onClose: () => void, 
  requests: any[], 
  withdrawals: any[],
  onRefresh: () => void,
  addNotification: (t: string, type?: 'success' | 'error') => void,
  setRequests: React.Dispatch<React.SetStateAction<any[]>>,
  setWithdrawals: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [activeTab, setActiveTab] = useState<'requests' | 'withdrawals' | 'tickets' | 'users' | 'settings'>('requests');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<string>('');
  const [isInitializingStorage, setIsInitializingStorage] = useState(false);
  
  const initializeStorage = async () => {
    setIsInitializingStorage(true);
    try {
      // Attempt to create the bucket
      const { error } = await supabase.storage.createBucket('receipts', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          addNotification('مخزن الصور موجود بالفعل');
        } else {
          throw error;
        }
      } else {
        addNotification('تم إنشاء مخزن الصور "receipts" بنجاح');
      }
    } catch (err: any) {
      console.error('Storage Init Error:', err);
      addNotification('فشل الإنشاء التلقائي. يرجى إنشاء مخزن باسم receipts يدوياً في Supabase', 'error');
    } finally {
      setIsInitializingStorage(false);
    }
  };
  
  // Ticket management state
  const [ticketStart, setTicketStart] = useState('');
  const [ticketEnd, setTicketEnd] = useState('');
  const [ticketLevel, setTicketLevel] = useState('0');
  const [isAddingTickets, setIsAddingTickets] = useState(false);
  const [isDeletingTickets, setIsDeletingTickets] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // User management state
  const [userSearchEmail, setUserSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isLoadingUserTickets, setIsLoadingUserTickets] = useState(false);

  const fetchUserTickets = async (userId: string) => {
    setIsLoadingUserTickets(true);
    try {
      const { data, error } = await supabase
        .from('shop_tickets')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_sold', true);
      
      if (error) throw error;
      console.log('Fetched tickets for user:', data);
      setUserTickets(data || []);
    } catch (err) {
      console.error('Fetch User Tickets Error:', err);
    } finally {
      setIsLoadingUserTickets(false);
    }
  };

  useEffect(() => {
    if (foundUser) {
      fetchUserTickets(foundUser.id);
    } else {
      setUserTickets([]);
    }
  }, [foundUser]);

  useEffect(() => {
    if (activeTab === 'users' && recentUsers.length === 0) {
      fetchRecentUsers();
    }
  }, [activeTab]);

  const fetchRecentUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);
      
      if (error) throw error;
      setRecentUsers(data || []);
    } catch (err: any) {
      console.error('Fetch Users Error:', err);
      addNotification('فشل تحميل قائمة المستخدمين: ' + (err.message || ''), 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApprove = async (requestId: string, userId: string) => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount))) {
      addNotification('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }
    setProcessingId(requestId);
    try {
      const amount = Number(rechargeAmount);
      
      // Use a single RPC call for atomicity if available, or sequential updates
      // Here we stick to sequential for simplicity unless we are sure RPC exists, 
      // but I will provide the RPC SQL to the user.
      
      // 1. Update user balance (using increment logic if possible, but here we fetch latest)
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      const newBalance = (profileData?.balance || 0) + amount;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);
      
      if (balanceError) throw balanceError;

      // 2. Update request status
      const { error: requestError } = await supabase
        .from('recharge_requests')
        .update({ status: 'approved', processed_amount: amount })
        .eq('id', requestId);
      
      if (requestError) throw requestError;

      // 3. Add notification for user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'تم قبول طلب الشحن',
        message: `تمت الموافقة على طلب الشحن الخاص بك بمبلغ ${amount} ل.س. تم تحديث رصيدك الآن.`,
        type: 'success'
      });

      addNotification(`تم شحن ${amount} ل.س بنجاح`);
      setRechargeAmount('');
      
      // Remove from local state immediately
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      console.error('Approve Error:', err);
      addNotification('حدث خطأ أثناء المعالجة: ' + (err.message || ''), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('recharge_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) throw error;

      // Add notification for user
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.user_id,
          title: 'تم رفض طلب الشحن',
          message: 'نعتذر، لقد تم رفض طلب الشحن الخاص بك. يرجى التأكد من صحة الإيصال والمحاولة مرة أخرى.',
          type: 'error'
        });
      }

      addNotification('تم رفض الطلب بنجاح');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      console.error('Reject Error:', err);
      addNotification('حدث خطأ أثناء الرفض', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdrawal = async (requestId: string, userId: string, amount: number) => {
    setProcessingId(requestId);
    try {
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if ((profileData?.balance || 0) < amount) {
        addNotification('رصيد المستخدم غير كافٍ لإتمام عملية السحب', 'error');
        return;
      }

      const newBalance = (profileData?.balance || 0) - amount;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);
      
      if (balanceError) throw balanceError;

      const { error: requestError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
      
      if (requestError) throw requestError;

      // 3. Add notification for user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'تم قبول طلب السحب',
        message: `تمت الموافقة على طلب السحب الخاص بك بمبلغ ${amount} ل.س. سيتم تحويل المبلغ إلى عنوان نصيب كاش الخاص بك قريباً.`,
        type: 'success'
      });

      addNotification(`تمت الموافقة على سحب ${amount} ل.س بنجاح`);
      setWithdrawals(prev => prev.filter(w => w.id !== requestId));
    } catch (err: any) {
      console.error('Withdraw Approval Error:', err);
      addNotification('حدث خطأ أثناء المعالجة: ' + (err.message || ''), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) throw error;

      // Add notification for user
      const withdrawal = withdrawals.find(w => w.id === requestId);
      if (withdrawal) {
        await supabase.from('notifications').insert({
          user_id: withdrawal.user_id,
          title: 'تم رفض طلب السحب',
          message: 'نعتذر، لقد تم رفض طلب السحب الخاص بك. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.',
          type: 'error'
        });
      }

      addNotification('تم رفض طلب السحب');
      
      // Remove from local state only after successful DB update
      setWithdrawals(prev => prev.filter(w => w.id !== requestId));
    } catch (err: any) {
      addNotification('خطأ في الرفض: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddTickets = async () => {
    const start = parseInt(ticketStart);
    const end = parseInt(ticketEnd);
    const level = parseInt(ticketLevel);
    if (isNaN(start) || isNaN(end) || start > end) {
      addNotification('يرجى إدخال نطاق أرقام صحيح', 'error');
      return;
    }
    
    addNotification('جاري تحديث الكروت...');
    setIsAddingTickets(true);
    try {
      // 1. Mark all currently sold tickets for this level as inactive (expired)
      await supabase
        .from('shop_tickets')
        .update({ is_active: false })
        .eq('level_index', level)
        .eq('is_sold', true);
      
      // 2. Delete all unsold tickets for this level
      const { error: deleteError } = await supabase
        .from('shop_tickets')
        .delete()
        .eq('level_index', level)
        .eq('is_sold', false);
      
      if (deleteError) throw deleteError;

      // 3. Prepare new tickets
      const tickets = [];
      for (let i = start; i <= end; i++) {
        const num = i.toString().padStart(6, '0');
        tickets.push({
          number: num,
          level_index: level,
          is_sold: false,
          is_active: true
        });
      }
      
      // 4. الإضافة على دفعات
      if (tickets.length > 0) {
        const batchSize = 500;
        for (let i = 0; i < tickets.length; i += batchSize) {
          const batch = tickets.slice(i, i + batchSize);
          const { error } = await supabase.from('shop_tickets').insert(batch);
          if (error) {
            console.error('Insert Error:', error);
            throw error;
          }
        }
      }
      
      addNotification(`تم تحديث الكروت بنجاح (تم إضافة ${tickets.length} كرت جديد)`);
      setTicketStart('');
      setTicketEnd('');
    } catch (err: any) {
      console.error('Add Tickets Error:', err);
      addNotification('حدث خطأ أثناء تحديث الكروت', 'error');
    } finally {
      setIsAddingTickets(false);
    }
  };

  const handleDeleteUnsoldTickets = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    setShowDeleteConfirm(false);
    addNotification('جاري حذف الكروت غير المباعة وأرشفة المباعة...');
    setIsDeletingTickets(true);
    try {
      // 1. Mark all sold tickets as inactive
      await supabase
        .from('shop_tickets')
        .update({ is_active: false })
        .eq('is_sold', true);

      // 2. Delete all unsold tickets
      const { error } = await supabase
        .from('shop_tickets')
        .delete()
        .eq('is_sold', false);
      
      if (error) throw error;
      
      addNotification('تم حذف جميع الكروت غير المباعة بنجاح');
    } catch (err: any) {
      console.error('Delete Tickets Error:', err);
      addNotification('حدث خطأ أثناء حذف الكروت: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsDeletingTickets(false);
    }
  };

  const handleSearchUser = async () => {
    if (!userSearchEmail) return;
    setIsSearchingUser(true);
    setFoundUser(null);
    try {
      // Try searching by email first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userSearchEmail)
        .maybeSingle();
      
      if (error) throw error;

      if (data) {
        setFoundUser(data);
      } else {
        // Fallback: search by name
        const { data: nameData, error: nameError } = await supabase
          .from('profiles')
          .select('*')
          .or(`first_name.ilike.%${userSearchEmail}%,last_name.ilike.%${userSearchEmail}%`)
          .limit(1)
          .maybeSingle();
        
        if (nameError) throw nameError;
        
        if (nameData) {
          setFoundUser(nameData);
        } else {
          addNotification('المستخدم غير موجود', 'error');
        }
      }
    } catch (err: any) {
      console.error('Search User Error:', err);
      addNotification('خطأ في البحث: ' + (err.message || ''), 'error');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleAdjustBalance = async (type: 'add' | 'subtract') => {
    if (!foundUser || !adjustAmount || isNaN(Number(adjustAmount))) return;
    const amount = Number(adjustAmount);
    const newBalance = type === 'add' ? foundUser.balance + amount : foundUser.balance - amount;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', foundUser.id);
      
      if (error) throw error;
      setFoundUser({ ...foundUser, balance: newBalance });
      addNotification('تم تعديل الرصيد بنجاح');
      setAdjustAmount('');
      fetchRecentUsers();
    } catch (err) {
      addNotification('حدث خطأ أثناء تعديل الرصيد', 'error');
    }
  };

  const handleToggleFreeze = async () => {
    if (!foundUser) return;
    const newStatus = !foundUser.is_frozen;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_frozen: newStatus })
        .eq('id', foundUser.id);
      
      if (error) throw error;
      setFoundUser({ ...foundUser, is_frozen: newStatus });
      addNotification(newStatus ? 'تم تجميد الحساب' : 'تم إلغاء التجميد');
      fetchRecentUsers();
    } catch (err) {
      addNotification('فشل تغيير حالة الحساب', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!foundUser) return;
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم ${foundUser.first_name} نهائياً؟ سيتم حذف جميع بياناته من قاعدة البيانات ونظام المصادقة.`)) return;
    
    try {
      // محاولة حذف المستخدم عبر RPC (الذي يحذف من auth.users و profiles)
      const { error } = await supabase.rpc('delete_user_completely', { user_id: foundUser.id });
      
      if (error) {
        console.error('RPC Delete Error:', error);
        // محاولة الحذف اليدوي من الجداول العامة كبديل
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', foundUser.id);
        if (profileError) throw profileError;
      }
      
      addNotification('تم حذف المستخدم وجميع بياناته بنجاح');
      setFoundUser(null);
      setUserSearchEmail('');
      fetchRecentUsers();
    } catch (err: any) {
      console.error('Delete User Error:', err);
      addNotification('فشل حذف المستخدم: ' + (err.message || ''), 'error');
    }
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-black">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">لوحة التحكم</h2>
            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Admin Control Center</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              onRefresh();
              if (activeTab === 'users') fetchRecentUsers();
              addNotification('تم تحديث البيانات');
            }} 
            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-cyan-500"
            title="تحديث البيانات"
          >
            <RotateCcw size={20} />
          </button>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/10 mb-6">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500'}`}
        >
          الشحن ({requests.length})
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'withdrawals' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500'}`}
        >
          السحب ({withdrawals.length})
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500'}`}
        >
          الكروت
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500'}`}
        >
          المستخدمين
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500'}`}
        >
          الإعدادات
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-xs font-bold">لا توجد طلبات معلقة حالياً</div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{req.profiles?.first_name} {req.profiles?.last_name || 'مستخدم'}</p>
                      <p className="text-[10px] text-gray-500">{req.user_email}</p>
                      <p className="text-[10px] text-cyan-500 font-bold mt-1">الرصيد: {req.profiles?.balance || 0} ل.س</p>
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      {new Date(req.created_at).toLocaleTimeString('ar-SY')}
                    </div>
                  </div>

                  {req.receipt_url && (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <img src={req.receipt_url} alt="Receipt" className="w-full h-40 object-contain" />
                      <a 
                        href={req.receipt_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      >
                        <Eye className="text-white" size={24} />
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="المبلغ المراد شحنه"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-cyan-500 transition-all"
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                    <button 
                      onClick={() => handleApprove(req.id, req.user_id)}
                      disabled={processingId === req.id}
                      className="bg-cyan-500 text-black font-black px-4 py-2 rounded-xl text-[10px] hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                      {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'موافقة'}
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 font-black px-4 py-2 rounded-xl text-[10px] hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-xs font-bold">لا توجد طلبات سحب معلقة حالياً</div>
            ) : (
              withdrawals.map((req) => (
                <div key={req.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{req.profiles?.first_name} {req.profiles?.last_name || 'مستخدم'}</p>
                      <p className="text-[10px] text-gray-500">{req.profiles?.email}</p>
                      <p className="text-[10px] text-gray-500">{new Date(req.created_at).toLocaleString('ar-SA')}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-red-500">{req.amount} ل.س</p>
                      <p className="text-[9px] text-gray-500">الرصيد: {req.profiles?.balance} ل.س</p>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-right">عنوان نصيب كاش</p>
                    <p className="text-xs font-mono text-white break-all text-right">{req.sham_cash_address}</p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveWithdrawal(req.id, req.user_id, req.amount)}
                      disabled={processingId === req.id}
                      className="flex-1 bg-cyan-500 text-black font-black py-2.5 rounded-xl text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                      {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'موافقة على السحب'}
                    </button>
                    <button 
                      onClick={() => handleRejectWithdrawal(req.id)}
                      disabled={processingId === req.id}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 font-black px-4 py-2.5 rounded-xl text-xs hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">توليد كروت جديدة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mr-1">من رقم</label>
                  <input 
                    type="number" 
                    value={ticketStart}
                    onChange={(e) => setTicketStart(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-cyan-500 transition-all"
                    placeholder="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mr-1">إلى رقم</label>
                  <input 
                    type="number" 
                    value={ticketEnd}
                    onChange={(e) => setTicketEnd(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-cyan-500 transition-all"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mr-1">المستوى</label>
                <select 
                  value={ticketLevel}
                  onChange={(e) => setTicketLevel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-cyan-500 transition-all appearance-none"
                >
                  <option value="0">برونز 1 (1000 كرت)</option>
                  <option value="1">برونز 2 (2000 كرت)</option>
                  <option value="2">برونز 3 (3000 كرت)</option>
                  <option value="3">سيلفر 1 (5000 كرت)</option>
                  <option value="4">سيلفر 2 (10000 كرت)</option>
                  <option value="5">جولد 1 (20000 كرت)</option>
                </select>
              </div>
              <button 
                onClick={handleAddTickets}
                disabled={isAddingTickets}
                className="w-full bg-cyan-500 text-black font-black py-3.5 rounded-xl text-xs shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
              >
                {isAddingTickets ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <Plus size={16} />
                    <span>إضافة الكروت إلى المتجر</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleDeleteUnsoldTickets}
                disabled={isDeletingTickets}
                className={`w-full font-black py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
                  showDeleteConfirm 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {isDeletingTickets ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <Trash2 size={16} />
                    <span>{showDeleteConfirm ? 'تأكيد الحذف النهائي؟' : 'حذف جميع الكروت غير المباعة'}</span>
                  </>
                )}
              </button>
              {showDeleteConfirm && (
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full text-[10px] text-gray-500 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">البحث عن مستخدم</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userSearchEmail}
                  onChange={(e) => setUserSearchEmail(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-cyan-500 transition-all"
                  placeholder="البريد الإلكتروني أو الاسم"
                />
                <button 
                  onClick={handleSearchUser}
                  disabled={isSearchingUser}
                  className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                >
                  {isSearchingUser ? <Loader2 className="animate-spin w-5 h-5" /> : <Search size={18} />}
                </button>
              </div>

              {foundUser && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-white/10 space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-black text-white">
                          {foundUser.first_name || foundUser.last_name 
                            ? `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim() 
                            : 'مستخدم بدون اسم'}
                        </p>
                        {foundUser.is_frozen && (
                          <span className="bg-red-500/20 text-red-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">مجمد</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mb-1">{foundUser.email}</p>
                      <p className="text-[10px] text-cyan-500 font-bold">الرصيد: {foundUser.balance} ل.س</p>
                    </div>
                    <button 
                      onClick={() => setFoundUser(null)}
                      className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-gray-400"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">العمر</p>
                      <p className="text-xs font-bold text-white">{foundUser.age || 'غير محدد'}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">تاريخ الانضمام</p>
                      <p className="text-xs font-bold text-white">
                        {foundUser.created_at ? new Date(foundUser.created_at).toLocaleDateString('ar-SY') : 'غير معروف'}
                      </p>
                    </div>
                    <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">عنوان نصيب كاش</p>
                      <p className="text-xs font-bold text-cyan-500 break-all">{foundUser.sham_cash_address || 'لم يتم إدخاله'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">الكروت المشتراة ({userTickets.length})</h4>
                      <button 
                        onClick={() => fetchUserTickets(foundUser.id)}
                        className="p-1 bg-white/5 rounded hover:bg-white/10 transition-all text-cyan-500"
                        title="تحديث قائمة الكروت"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    {isLoadingUserTickets ? (
                      <div className="flex justify-center py-4"><Loader2 className="animate-spin w-4 h-4 text-cyan-500" /></div>
                    ) : userTickets.length === 0 ? (
                      <p className="text-[10px] text-gray-600 text-center py-2 italic">لم يقم بشراء أي كروت بعد</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {userTickets.map(t => (
                          <div key={t.id} className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-1 text-center">
                            <p className="text-[9px] font-black text-cyan-500">{t.number}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3">
                    <p className="text-[8px] text-yellow-500 font-black uppercase tracking-widest mb-1">ملاحظة أمنية</p>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      كلمات المرور مشفرة ولا يمكن عرضها لأسباب أمنية. إذا نسي المستخدم كلمة المرور، يمكنه استخدام خيار "نسيت كلمة المرور" عند تسجيل الدخول.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mr-1">تعديل الرصيد</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-cyan-500 transition-all"
                        placeholder="المبلغ"
                      />
                      <button 
                        onClick={() => handleAdjustBalance('add')}
                        className="bg-green-500/10 text-green-500 border border-green-500/20 font-black px-4 py-2 rounded-xl text-[10px] hover:bg-green-500/20 transition-all"
                      >
                        إضافة
                      </button>
                      <button 
                        onClick={() => handleAdjustBalance('subtract')}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 font-black px-4 py-2 rounded-xl text-[10px] hover:bg-red-500/20 transition-all"
                      >
                        خصم
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      onClick={handleToggleFreeze}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${foundUser.is_frozen ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}
                    >
                      {foundUser.is_frozen ? <Unlock size={14} /> : <Lock size={14} />}
                      <span>{foundUser.is_frozen ? 'إلغاء التجميد' : 'تجميد الحساب'}</span>
                    </button>
                    <button 
                      onClick={handleDeleteUser}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl text-[10px] font-black hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                      <span>حذف الحساب</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-1">آخر المستخدمين المسجلين</h3>
              {loadingUsers ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-500" /></div>
              ) : recentUsers.length === 0 ? (
                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-10 text-center">
                  <p className="text-xs text-gray-500 font-bold">لا يوجد مستخدمين مسجلين حالياً</p>
                </div>
              ) : (
                recentUsers.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => {
                      setFoundUser(u);
                      setUserSearchEmail(u.email || '');
                    }}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/[0.05] transition-all"
                  >
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">
                        {u.first_name || u.last_name 
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
                          : 'مستخدم بدون اسم'}
                      </p>
                      <p className="text-[9px] text-gray-500">{u.email || 'لا يوجد بريد'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-cyan-500 font-bold">{u.balance} ل.س</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">إعدادات النظام</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                إذا كنت تواجه مشاكل في رفع الصور، يمكنك محاولة تهيئة مخزن الصور تلقائياً من هنا.
              </p>
              <button 
                onClick={initializeStorage}
                disabled={isInitializingStorage}
                className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {isInitializingStorage ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={14} />}
                تهيئة مخزن الصور (Receipts Bucket)
              </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">ملاحظة هامة</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                في حال فشل الزر أعلاه، يجب عليك الدخول إلى لوحة تحكم Supabase وإنشاء Bucket باسم <span className="text-white font-mono">receipts</span> وجعله <span className="text-white">Public</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DailyRewardWheel({ user, lastRewardAt, onRewardClaimed, onClose, addNotification }: { 
  user: User, 
  lastRewardAt: string | null,
  onRewardClaimed: (amount: number) => void, 
  onClose: () => void,
  addNotification: (t: string, type?: 'success' | 'error') => void 
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [timeOffset, setTimeOffset] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const prizes = [1, 2, 3, 4, 5, 6, 7, 8, 10, 20, 50, 100]; // 12 segments

  useEffect(() => {
    const syncTime = async () => {
      try {
        const { data, error } = await supabase.rpc('get_server_time');
        if (data) {
          const serverTime = new Date(data).getTime();
          const localTime = Date.now();
          setTimeOffset(serverTime - localTime);
        }
      } catch (e) {
        console.error('Time sync error:', e);
      }
    };
    syncTime();
  }, []);

  const playTick = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  const playWin = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  useEffect(() => {
    if (lastRewardAt) {
      const updateTimer = () => {
        const lastDate = new Date(lastRewardAt).getTime();
        const nextDate = lastDate + (24 * 60 * 60 * 1000); // Exactly 24 hours later
        
        const now = Date.now() + timeOffset;
        const diff = nextDate - now;
        
        if (diff <= 0) {
          setTimeLeft(null);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [lastRewardAt, timeOffset]);

  const spin = async () => {
    if (isSpinning || timeLeft) return;
    
    // Probability logic
    const rand = Math.random();
    let wonAmount;
    if (rand < 0.001) { // 1 in 1000 for big prizes (4+)
      const bigPrizes = [4, 5, 6, 7, 8, 10, 20, 50, 100];
      wonAmount = bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
    } else {
      // Majority is 1, 2, or 3
      const commonPrizes = [1, 2, 3];
      wonAmount = commonPrizes[Math.floor(Math.random() * commonPrizes.length)];
    }

    const prizeIndex = prizes.indexOf(wonAmount);
    const segmentSize = 360 / prizes.length;
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const targetPrizeRotation = (360 - (prizeIndex * segmentSize) - (segmentSize / 2));
    const currentRotationBase = Math.ceil(rotation / 360) * 360;
    const finalRotation = currentRotationBase + (360 * extraSpins) + targetPrizeRotation;
    
    setIsSpinning(true);
    setPrize(null);
    setRotation(finalRotation);

    // Sound effect during spin
    let lastTickRotation = 0;
    const startTime = Date.now();
    const duration = 4000;
    
    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(tickInterval);
        return;
      }
      
      // Ease out cubic approximation for rotation progress
      const t = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - t, 3);
      const currentRotation = rotation + (finalRotation - rotation) * easeOut;
      
      if (Math.floor(currentRotation / segmentSize) > Math.floor(lastTickRotation / segmentSize)) {
        playTick();
        lastTickRotation = currentRotation;
      }
    }, 16);

    setTimeout(async () => {
      setIsSpinning(false);
      setPrize(wonAmount);
      playWin();
      
      try {
        const { data, error } = await supabase.rpc('claim_daily_reward', {
          user_id: user.id,
          reward_amount: wonAmount
        });

        if (error) throw error;
        
        const result = data as any;
        if (!result.success) {
          addNotification(result.message, 'error');
          onClose();
          return;
        }
        
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'مكافأة يومية',
          message: `مبروك! لقد ربحت ${wonAmount} ليرة سورية من عجلة الحظ اليومية`,
          type: 'success'
        });

        addNotification(`مبروك! ربحت ${wonAmount} ليرة سورية`);
        onRewardClaimed(wonAmount);
      } catch (err) {
        console.error('Daily Reward Error:', err);
        addNotification('حدث خطأ أثناء استلام المكافأة', 'error');
      }
    }, duration);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-[60] p-2 hover:bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-10 relative z-10">
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
          >
            <Gift className="text-cyan-500 w-8 h-8" />
          </motion.div>
          <h2 className="text-2xl font-black text-white tracking-tight">عجلة الحظ الملكية</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Naseeb Daily Rewards</p>
        </div>

        <div className="relative flex justify-center mb-10">
          {/* The Needle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30">
            <div className="w-6 h-8 bg-gradient-to-b from-white to-cyan-500 shadow-xl" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          </div>

          {/* Outer Glow */}
          <div className="absolute inset-0 m-auto w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl" />

          {/* Outer Lights */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-20 transition-all duration-300 ${isSpinning ? 'animate-pulse' : ''}`}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-155px)`
              }}
            />
          ))}

          {/* The Wheel */}
          <motion.div 
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }}
            className="w-72 h-72 rounded-full border-[12px] border-[#1a1c20] relative overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] z-10"
            style={{ 
              background: 'conic-gradient(#06b6d4 0deg 30deg, #0891b2 30deg 60deg, #06b6d4 60deg 90deg, #0891b2 90deg 120deg, #06b6d4 120deg 150deg, #0891b2 150deg 180deg, #06b6d4 180deg 210deg, #0891b2 210deg 240deg, #06b6d4 240deg 270deg, #0891b2 270deg 300deg, #06b6d4 300deg 330deg, #0891b2 330deg 360deg)'
            }}
          >
            {prizes.map((p, i) => (
              <div 
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex flex-col items-center pt-6"
                style={{ transform: `translateX(-50%) rotate(${i * 30 + 15}deg)` }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white font-black text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{p}</span>
                  <span className="text-[6px] text-white/60 font-bold uppercase tracking-tighter">ل.س</span>
                </div>
                {/* Decorative Dot */}
                <div className="w-1 h-1 bg-white/40 rounded-full mt-2" />
              </div>
            ))}
            {/* Inner Ring */}
            <div className="absolute inset-0 m-auto w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
            
            {/* Center Cap */}
            <div className="absolute inset-0 m-auto w-16 h-16 bg-[#0a0a0a] rounded-full border-4 border-[#1a1c20] flex items-center justify-center shadow-2xl z-20">
              <div className="w-6 h-6 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
            </div>
          </motion.div>
        </div>

        <div className="space-y-4 relative z-10">
          {prize !== null ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl"
            >
              <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mb-1">مبروك! لقد ربحت</p>
              <p className="text-4xl font-black text-white tracking-tighter">{prize} <span className="text-sm font-bold text-cyan-500">ل.س</span></p>
            </motion.div>
          ) : timeLeft ? (
            <div className="text-center p-5 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">المكافأة القادمة خلال</p>
              <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{timeLeft}</p>
            </div>
          ) : (
            <button 
              onClick={spin}
              disabled={isSpinning}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black py-5 rounded-3xl shadow-2xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 group"
            >
              <div className="flex items-center justify-center gap-3">
                {isSpinning ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>جاري الدوران...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    <span>ابدأ الدوران الآن</span>
                  </>
                )}
              </div>
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2">
            <Info size={12} className="text-gray-600" />
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">
              تعتمد المكافأة على توقيت السيرفر العالمي
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReferralDashboard({ user, addNotification }: { user: User, addNotification: (t: string, type?: 'success' | 'error') => void }) {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalInvited: 0, totalRewards: 0 });
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const fetchReferrals = async () => {
    if (!user.id || user.id === 'guest') return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
      setStats({
        totalInvited: data?.length || 0,
        totalRewards: data?.length || 0 // 1 Point per referral
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [user.id]);

  const handleRedeem = async () => {
    const amount = parseInt(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      addNotification('يرجى إدخال عدد نقاط صحيح', 'error');
      return;
    }
    if (amount > user.points) {
      addNotification('عذراً، ليس لديك نقاط كافية', 'error');
      return;
    }

    setIsRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('exchange_points_for_balance', {
        user_id: user.id,
        amount_to_exchange: amount
      });

      if (error) throw error;

      if (data?.success) {
        addNotification(`تم استبدال ${amount} نقطة بـ ${amount} ليرة سورية بنجاح`, 'success');
        setShowRedeemModal(false);
        setRedeemAmount('');
      } else {
        addNotification(data?.message || 'فشل استبدال النقاط', 'error');
      }
    } catch (error) {
      console.error('Redeem error:', error);
      addNotification('حدث خطأ أثناء استبدال النقاط', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };

  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;

  const copyLink = () => {
    if (!user.referralCode) return;
    navigator.clipboard.writeText(referralLink);
    addNotification('تم نسخ رابط الإحالة بنجاح');
  };

  const shareWhatsApp = () => {
    if (!user.referralCode) return;
    const text = `🔥 فرصة العمر بين يديك! انضم الآن إلى تطبيق 'نصيب كاش' وافتح أبواب الحظ! 💸

🎡 عجلة الحظ تمنحك مكافآت يومية مجانية بدون توقف!
💰 نظام إحالة جبار: اكسب رصيداً كاش فورياً عن كل شخص ينضم من طرفك!
🏆 سحوبات كبرى وجوائز قيمة بانتظار المحظوظين!

سجل الآن من رابطي وابدأ بجني الأرباح فوراً:
${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl rounded-full -mr-8 -mt-8" />
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 relative z-10">إجمالي المدعوين</p>
          <p className="text-2xl font-black text-white relative z-10">{stats.totalInvited}</p>
        </div>
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 blur-2xl rounded-full -mr-8 -mt-8" />
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 relative z-10">إجمالي المكافآت</p>
          <div className="flex items-center justify-between relative z-10">
            <p className="text-2xl font-black text-green-500">{user.points} <span className="text-xs">نقطة</span></p>
            <button 
              onClick={() => setShowRedeemModal(true)}
              className="px-3 py-1.5 bg-green-500 text-black text-[10px] font-black rounded-lg shadow-lg shadow-green-500/20 active:scale-95 transition-all"
            >
              استبدال
            </button>
          </div>
        </div>
      </div>

      {/* Redeem Points Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#1a1c20] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="text-green-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">استبدال النقاط</h3>
                <p className="text-sm text-gray-400">كل 1 نقطة = 1 ليرة سورية</p>
                <p className="text-[10px] text-cyan-500 font-bold">نقاطك الحالية: {user.points} نقطة</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">عدد النقاط للاستبدال</label>
                  <input 
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="أدخل عدد النقاط..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500/50 transition-all font-mono"
                  />
                </div>

                <button 
                  onClick={handleRedeem}
                  disabled={isRedeeming || !redeemAmount}
                  className="w-full py-4 bg-green-500 text-black font-black rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                  تأكيد الاستبدال
                </button>

                <button 
                  onClick={() => setShowRedeemModal(false)}
                  className="w-full py-2 text-gray-500 text-xs font-bold hover:text-white transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Referral Code & Link */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="text-center space-y-1 relative z-10">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">كود الإحالة الخاص بك</p>
          <h3 className="text-3xl font-black text-white tracking-[0.3em]">{user.referralCode || '------'}</h3>
        </div>

        <div className="space-y-2 relative z-10">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">رابط الإحالة</p>
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
            <input 
              readOnly 
              value={referralLink}
              className="flex-1 bg-transparent text-[10px] text-gray-400 font-mono outline-none px-2"
            />
            <button onClick={copyLink} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <Copy size={14} className="text-cyan-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button 
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-xl font-black text-xs border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all"
          >
            <Plus size={16} />
            واتساب
          </button>
          <button 
            onClick={copyLink}
            className="flex items-center justify-center gap-2 py-3 bg-cyan-500/10 text-cyan-500 rounded-xl font-black text-xs border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
          >
            <Copy size={16} />
            نسخ الرابط
          </button>
        </div>
      </div>

      {/* Invited Users List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-white uppercase tracking-widest px-2">قائمة المدعوين</h3>
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500 text-xs">لم تقم بدعوة أي مستخدم بعد. ابدأ الآن!</p>
            </div>
          ) : (
            referrals.map((ref) => (
              <div key={ref.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{ref.first_name} {ref.last_name}</p>
                    <p className="text-[9px] text-gray-500">انضم في: {new Date(ref.created_at).toLocaleDateString('ar-SY')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-green-500">+1 نقطة</p>
                  <p className="text-[8px] text-gray-500 uppercase font-bold">مكافأة إحالة</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PurchaseModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  ticketNumber, 
  balance, 
  price 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  ticketNumber: string, 
  balance: number, 
  price: number 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-[#1a1c20] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-cyan-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">تأكيد شراء الكرت</h3>
          <p className="text-sm text-gray-400">أنت على وشك شراء الكرت رقم <span className="text-cyan-500 font-mono font-bold">{ticketNumber}</span></p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => onConfirm()}
            disabled={balance < price}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
              balance >= price 
                ? 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10' 
                : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Wallet className="text-blue-500 w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">شراء بالرصيد</p>
                <p className="text-[10px] text-gray-500">رصيدك: {balance} ل.س</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{price}</p>
              <p className="text-[10px] text-cyan-500 font-bold">ل.س</p>
            </div>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 text-gray-500 text-xs font-bold hover:text-white transition-colors"
        >
          إلغاء العملية
        </button>
      </motion.div>
    </div>
  );
}

function WithdrawModal({ 
  user, 
  onClose, 
  addNotification 
}: { 
  user: User, 
  onClose: () => void, 
  addNotification: (t: string, type?: 'success' | 'error') => void 
}) {
  const [amount, setAmount] = useState('');
  const [naseebCash, setNaseebCash] = useState(user.shamCashAddress || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      addNotification('الحد الأدنى للسحب هو 100 ليرة سورية', 'error');
      return;
    }

    if (withdrawAmount > user.balance) {
      addNotification('عذراً، رصيدك غير كافٍ لهذا المبلغ', 'error');
      return;
    }

    if (!naseebCash.trim()) {
      addNotification('يرجى إدخال عنوان نصيب كاش صحيح', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          sham_cash_address: naseebCash,
          status: 'pending'
        });

      if (error) throw error;

      // إرسال إشعار للمستخدم في قاعدة البيانات
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'طلب سحب قيد المراجعة',
        message: `لقد تم استلام طلب السحب الخاص بك بمبلغ ${withdrawAmount} ل.س بنجاح. سيتم مراجعته من قبل الإدارة قريباً.`,
        type: 'info'
      });

      addNotification('تم إرسال طلب السحب بنجاح. سيتم مراجعته من قبل الإدارة.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Withdraw Error:', err);
      addNotification('حدث خطأ أثناء إرسال الطلب: ' + (err.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-1">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowUpRight className="text-cyan-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">سحب الرصيد</h2>
          <p className="text-gray-400 text-xs">أدخل المبلغ وعنوان نصيب كاش الخاص بك</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">الرصيد المتاح</p>
            <p className="text-xl font-black text-white">{user.balance} <span className="text-xs text-cyan-500">ل.س</span></p>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">الحد الأدنى</p>
            <p className="text-sm font-black text-gray-300">100 ل.س</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-right">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-1">عنوان نصيب كاش</label>
            <input 
              type="text" 
              required
              value={naseebCash}
              onChange={(e) => setNaseebCash(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none focus:border-cyan-500 transition-all text-center font-mono"
              placeholder="أدخل عنوان محفظتك هنا"
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-1">المبلغ المراد سحبه</label>
            <input 
              type="number" 
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-xl outline-none focus:border-cyan-500 transition-all text-center font-black"
              placeholder="0.00"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !amount || Number(amount) < 100 || Number(amount) > user.balance}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-2xl text-lg shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                <ArrowUpRight size={20} />
                <span>تأكيد طلب السحب</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[9px] text-gray-600 font-bold leading-relaxed">
          تتم معالجة طلبات السحب يدوياً من قبل الإدارة خلال 24 ساعة. يرجى التأكد من صحة عنوان نصيب كاش لتجنب ضياع الرصيد.
        </p>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [user, setUser] = useState<User>({
    id: 'guest',
    name: 'زائر',
    balance: 0,
    points: 0,
    tickets: []
  });

  const [winners, setWinners] = useState<{name: string, amount: number, ticket: string, rank: number}[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'tickets' | 'winners' | 'profile' | 'referral'>('home');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'active' | 'winner' | 'expired'>('all');
  const [selectedTicketForPurchase, setSelectedTicketForPurchase] = useState<{id: string, number: string} | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [ticketSort, setTicketSort] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [showDevGuide, setShowDevGuide] = useState(false);
  const [showMachine, setShowMachine] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnWinners, setDrawnWinners] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rechargeReceipt, setRechargeReceipt] = useState<File | null>(null);
  const [rechargeStatus, setRechargeStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'success' | 'error'}[]>([]);
  const [realNotifications, setRealNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAboutApp, setShowAboutApp] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [shopTickets, setShopTickets] = useState<{id: string, number: string, sold: boolean}[]>([]);
  const [totalLevelTickets, setTotalLevelTickets] = useState(0);
  const [soldLevelTickets, setSoldLevelTickets] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDailyWheel, setShowDailyWheel] = useState(false);
  const [lastRewardAt, setLastRewardAt] = useState<string | null>(null);

  const ADMIN_EMAILS = ['azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com'];
  const isAdmin = supabaseUser?.email && ADMIN_EMAILS.includes(supabaseUser.email);

  const canClaimReward = !lastRewardAt || (Date.now() - new Date(lastRewardAt).getTime() >= 24 * 60 * 60 * 1000);

  const handleRewardClaimed = (amount: number) => {
    setUser(prev => ({ ...prev, balance: prev.balance + amount }));
    setLastRewardAt(new Date().toISOString());
  };

  useEffect(() => {
    // Detect referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referral_code', ref);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setAuthLoading(false);
      // If there's a referral code and no session, show the registration modal
      if (!session && ref) {
        setAuthInitialMode('signup');
        setShowAuthModal(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseUser) return;

    // 4. Real-time Profile Subscription
    const profileSubscription = supabase
      .channel(`profile-changes-${supabaseUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabaseUser.id}`
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          setUser(prev => ({
            ...prev,
            balance: Number(updatedProfile.balance) || 0,
            points: Number(updatedProfile.points) || 0
          }));
          setLastRewardAt(updatedProfile.last_daily_reward_at);
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [supabaseUser]);

  const fetchProfileData = useCallback(async () => {
    if (!supabaseUser) return;
    
    // 1. Fetch Profile & Balance
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, referral_code, referred_by, points')
      .eq('id', supabaseUser.id)
      .single();
      
    // 2. Fetch User Tickets (Limited to 50 for summary)
    const { data: ticketsData } = await supabase
      .from('shop_tickets')
      .select('id, number, created_at, is_sold, is_active')
      .eq('owner_id', supabaseUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // 3. Fetch Notifications
    const { data: notifsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notifsData) {
      setRealNotifications(notifsData);
      setUnreadCount(notifsData.filter(n => !n.is_read).length);
    }

    if (profileData) {
      setLastRewardAt(profileData.last_daily_reward_at);
      const metadata = supabaseUser.user_metadata;
      // Prioritize profile table data over auth metadata for consistency
      const fullName = profileData.first_name && profileData.last_name 
        ? `${profileData.first_name} ${profileData.last_name}`
        : (metadata?.first_name && metadata?.last_name 
            ? `${metadata.first_name} ${metadata.last_name}`
            : (supabaseUser.email?.split('@')[0] || 'مستخدم'));

      setUser({
        id: supabaseUser.id,
        name: fullName,
        balance: Number(profileData.balance) || 0,
        points: Number(profileData.points) || 0,
        isFrozen: profileData.is_frozen || false,
        referralCode: profileData.referral_code,
        referredBy: profileData.referred_by,
        shamCashAddress: profileData.sham_cash_address,
        tickets: (ticketsData || []).map(t => ({
          id: t.id,
          number: t.number,
          purchaseDate: new Date(t.created_at).toISOString().split('T')[0],
          status: t.is_sold ? (t.is_active ? 'active' : 'expired') : 'expired'
        }))
      });
    }
  }, [supabaseUser]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfileData();
    // Also refresh winners and shop tickets
    const { data: winnersData } = await supabase
      .from('winners')
      .select('*')
      .order('rank', { ascending: true });
    
    if (winnersData) {
      setWinners(winnersData.map(w => ({
        name: w.user_name,
        amount: w.amount,
        ticket: w.ticket_number,
        rank: w.rank
      })));
    }
    
    setIsRefreshing(false);
  }, [fetchProfileData]);

  useEffect(() => {
    fetchProfileData();

    // 4. Real-time notifications subscription
    let channel: any = null;
    if (supabaseUser) {
      channel = supabase
        .channel(`user-notifs-${supabaseUser.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${supabaseUser.id}`
        }, (payload) => {
          setRealNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          playSound('recharge');
        })
        .subscribe();
    }

    // Pull to refresh listener
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) startY = e.touches[0].pageY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].pageY;
      if (window.scrollY === 0 && y > startY + 50) {
        // Simple visual feedback could be added here
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const y = e.changedTouches[0].pageY;
      if (window.scrollY === 0 && y > startY + 100) {
        handleRefresh();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabaseUser, fetchProfileData, handleRefresh]);

  // Fetch Winners
  useEffect(() => {
    const fetchWinners = async () => {
      const { data } = await supabase
        .from('winners')
        .select('*')
        .order('rank', { ascending: true });
      
      if (data) {
        setWinners(data.map(w => ({
          name: w.user_name,
          amount: w.amount,
          ticket: w.ticket_number,
          rank: w.rank
        })));
      }
    };
    fetchWinners();
  }, []);

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

  // Seeding logic (one-time)
  useEffect(() => {
    const seedTickets = async () => {
      try {
        const { count } = await supabase
          .from('shop_tickets')
          .select('*', { count: 'exact', head: true });
        
        if (count === 0) {
          const tickets = [];
          for (let i = 1; i <= 1000; i++) {
            tickets.push({
              number: i.toString().padStart(6, '0'),
              level_index: 0,
              is_sold: false
            });
          }
          await supabase.from('shop_tickets').insert(tickets);
          // Refresh the list after seeding
          setDisplayLimit(prev => prev + 1);
          setTimeout(() => setDisplayLimit(prev => prev - 1), 100);
        }
      } catch (e) {
        console.error('Seeding error:', e);
      }
    };
    seedTickets();
  }, []);

  // Fetch tickets from Supabase and subscribe to real-time updates
  useEffect(() => {
    const fetchTickets = async () => {
      setIsSearching(true);
      
      // 1. Fetch counts for progress bar (only if not searching)
      if (!searchQuery) {
        const { count: totalCount } = await supabase
          .from('shop_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('level_index', currentLevelIndex)
          .eq('is_active', true);
        
        const { count: soldCount } = await supabase
          .from('shop_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('level_index', currentLevelIndex)
          .eq('is_sold', true)
          .eq('is_active', true);

        setTotalLevelTickets(totalCount || LEVELS[currentLevelIndex].tickets);
        setSoldLevelTickets(soldCount || 0);
      }

      // 2. Fetch limited tickets for display
      let query = supabase
        .from('shop_tickets')
        .select('id, number, is_sold')
        .eq('level_index', currentLevelIndex)
        .eq('is_active', true)
        .order('number', { ascending: true })
        .limit(displayLimit);
      
      if (searchQuery) {
        query = query.ilike('number', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tickets:', error);
        setIsSearching(false);
        return;
      }

      if (data) {
        setShopTickets(data.map(t => ({
          id: t.id,
          number: t.number,
          sold: t.is_sold
        })));
      }
      setIsSearching(false);
    };

    const timer = setTimeout(() => {
      fetchTickets();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timer);
  }, [currentLevelIndex, displayLimit, searchQuery]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('shop_tickets_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shop_tickets',
        filter: `level_index=eq.${currentLevelIndex}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          // Handle archiving (is_active: false)
          if (payload.new.is_active === false && payload.old.is_active === true) {
            setShopTickets(prev => prev.filter(t => t.id !== payload.new.id));
            setTotalLevelTickets(prev => Math.max(0, prev - 1));
            if (payload.old.is_sold) setSoldLevelTickets(prev => Math.max(0, prev - 1));
            return;
          }
          
          // Handle activation (is_active: true) - though rare in this app
          if (payload.new.is_active === true && payload.old.is_active === false) {
            setTotalLevelTickets(prev => prev + 1);
            if (payload.new.is_sold) setSoldLevelTickets(prev => prev + 1);
            setShopTickets(prev => {
              if (prev.length >= displayLimit) return prev;
              const newTicket = { id: payload.new.id, number: payload.new.number, sold: payload.new.is_sold };
              return [...prev, newTicket].sort((a, b) => a.number.localeCompare(b.number));
            });
            return;
          }

          // Handle normal sold status update
          setShopTickets(prev => prev.map(t => 
            t.id === payload.new.id ? { ...t, sold: payload.new.is_sold } : t
          ));
          
          if (payload.new.is_sold && !payload.old.is_sold) {
            setSoldLevelTickets(prev => prev + 1);
          } else if (!payload.new.is_sold && payload.old.is_sold) {
            setSoldLevelTickets(prev => Math.max(0, prev - 1));
          }
        } else if (payload.eventType === 'INSERT') {
          if (payload.new.is_active === false) return;

          setTotalLevelTickets(prev => prev + 1);
          if (payload.new.is_sold) setSoldLevelTickets(prev => prev + 1);
          
          setShopTickets(prev => {
            if (prev.length >= displayLimit) return prev;
            if (searchQuery && !payload.new.number.includes(searchQuery)) return prev;
            if (prev.some(t => t.id === payload.new.id)) return prev;
            
            return [...prev, {
              id: payload.new.id,
              number: payload.new.number,
              sold: payload.new.is_sold
            }].sort((a, b) => a.number.localeCompare(b.number));
          });
        } else if (payload.eventType === 'DELETE') {
          // Only update counts if the deleted ticket was active
          // Note: payload.old only contains the ID usually unless full replication is on
          setTotalLevelTickets(prev => Math.max(0, prev - 1));
          setShopTickets(prev => prev.filter(t => t.id !== payload.old.id));
          // We can't easily know if it was sold without full replication, 
          // but usually we delete unsold ones.
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentLevelIndex, displayLimit, searchQuery]);

  const RECHARGE_ADDRESS = "bc31c5af70694dc0825ed2dce3167888";

  const playSound = (type: 'success' | 'error' | 'buy' | 'recharge') => {
    const sounds = {
      success: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      buy: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      recharge: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const addNotification = (text: string, type: 'success' | 'error' = 'success') => {
    playSound(type);
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

  const buyTicket = async (forcedNumber?: string) => {
    if (isPurchasing) return false;
    
    if (!supabaseUser) {
      addNotification('يرجى تسجيل الدخول لشراء الكروت', 'error');
      setShowAuthModal(true);
      return false;
    }

    setIsPurchasing(true);

    try {
      // 1. Fetch latest profile data to ensure we have the correct balance
      const { data: currentProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('is_frozen, balance')
        .eq('id', supabaseUser.id)
        .single();

      if (profileFetchError || !currentProfile) {
        throw new Error('فشل في جلب بيانات الحساب');
      }

      if (currentProfile.is_frozen) {
        addNotification('عذراً، حسابك مجمد حالياً ولا يمكنك شراء الكروت. يرجى التواصل مع الإدارة.', 'error');
        return false;
      }

      const currentBalance = Number(currentProfile.balance) || 0;
      if (currentBalance < TICKET_PRICE) {
        addNotification('عذراً، رصيدك غير كافٍ لشراء الكرت', 'error');
        return false;
      }

      const ticketNumber = forcedNumber || (shopTickets.find(t => !t.sold)?.number);
      
      if (!ticketNumber) {
        addNotification('عذراً، لا توجد كروت متاحة حالياً', 'error');
        return false;
      }

      // 2. تحديث الكرت في قاعدة البيانات مع التحقق من أنه لم يتم بيعه وأنه نشط
      const { count, error: ticketError } = await supabase
        .from('shop_tickets')
        .update({ 
          is_sold: true, 
          owner_id: supabaseUser.id 
        }, { count: 'exact' })
        .eq('number', ticketNumber)
        .eq('is_sold', false)
        .eq('is_active', true);

      if (ticketError) {
        console.error('Ticket Update Error:', ticketError);
        throw ticketError;
      }
      
      if (count === 0) {
        addNotification('عذراً، هذا الكرت لم يعد متاحاً أو تم شراؤه بالفعل', 'error');
        return false;
      }

      // 3. خصم الرصيد من قاعدة البيانات
      const { data: updatedProfile, error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: currentBalance - TICKET_PRICE })
        .eq('id', supabaseUser.id)
        .select();

      if (balanceError) throw balanceError;

      const actualNewBalance = updatedProfile?.[0]?.balance ?? (currentBalance - TICKET_PRICE);

      // 4. Update local state
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        number: ticketNumber,
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      setUser(prev => ({
        ...prev,
        balance: actualNewBalance,
        tickets: [newTicket, ...prev.tickets]
      }));

      // 4. Add real notification to panel
      await supabase.from('notifications').insert({
        user_id: supabaseUser.id,
        title: 'تم شراء كرت بنجاح',
        message: `لقد قمت بشراء الكرت رقم ${ticketNumber} بنجاح. حظاً موفقاً!`,
        type: 'success'
      });
      
      playSound('buy');
      addNotification('تم شراء الكرت بنجاح! حظاً موفقاً');
      return true;
    } catch (error: any) {
      console.error('Purchase error:', error);
      addNotification('حدث خطأ أثناء عملية الشراء، يرجى المحاولة مرة أخرى', 'error');
      return false;
    } finally {
      setTimeout(() => setIsPurchasing(false), 800);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RECHARGE_ADDRESS);
    addNotification('تم نسخ عنوان المحفظة بنجاح');
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminRequests();
    }
  }, [isAdmin]);

  const fetchAdminRequests = async () => {
    setAdminLoading(true);
    try {
      const [rechargeRes, withdrawalRes] = await Promise.all([
        supabase
          .from('recharge_requests')
          .select('*, profiles(first_name, last_name, balance, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('withdrawal_requests')
          .select('*, profiles(first_name, last_name, balance, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);
      
      if (rechargeRes.error) throw rechargeRes.error;
      if (withdrawalRes.error) throw withdrawalRes.error;

      console.log('Admin Data Fetched:', { 
        recharge: rechargeRes.data?.length, 
        withdrawals: withdrawalRes.data?.length 
      });

      setAdminRequests(rechargeRes.data || []);
      setAdminWithdrawals(withdrawalRes.data || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      addNotification('فشل في جلب بيانات الإدارة: ' + (err.message || ''), 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUser) {
      addNotification('يرجى تسجيل الدخول أولاً', 'error');
      setShowAuthModal(true);
      return;
    }
    if (!rechargeReceipt) {
      addNotification('يرجى إرفاق صورة الإيصال', 'error');
      return;
    }
    setRechargeStatus('submitting');
    
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = rechargeReceipt.name.split('.').pop();
      const fileName = `${supabaseUser.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, rechargeReceipt);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('خطأ: مخزن الصور "receipts" غير موجود في Supabase. يرجى إنشاؤه.');
        }
        throw new Error('فشل رفع الصورة. يرجى المحاولة لاحقاً');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // 2. Insert into recharge_requests
      const { error } = await supabase
        .from('recharge_requests')
        .insert({ 
          user_id: supabaseUser.id,
          receipt_url: publicUrl,
          status: 'pending',
          user_email: supabaseUser.email
        });

      if (error) throw error;

      // 3. Add real notification to panel
      await supabase.from('notifications').insert({
        user_id: supabaseUser.id,
        title: 'طلب شحن قيد المراجعة',
        message: 'لقد تم استلام طلب الشحن الخاص بك بنجاح. سيتم التحقق من الإيصال وتحديث رصيدك قريباً.',
        type: 'info'
      });

      playSound('recharge');
      setRechargeStatus('success');
      setTimeout(() => {
        setShowRecharge(false);
        setRechargeStatus('idle');
        setRechargeReceipt(null);
        addNotification('تم إرسال طلب الشحن بنجاح! سيتم التحقق من الوصل قريباً');
      }, 2000);
    } catch (err: any) {
      console.error('Recharge error:', err);
      addNotification(err.message || 'حدث خطأ أثناء إرسال الطلب', 'error');
      setRechargeStatus('idle');
    }
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
      <div className="fixed top-24 left-6 right-6 z-[999] pointer-events-none space-y-3">
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
            <h1 className="text-lg font-black tracking-tight text-white font-serif italic">نصيب كاش</h1>
            <p className="text-[8px] text-cyan-500 uppercase tracking-[0.2em] font-bold">Naseeb Cash</p>
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-black">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => setShowDevGuide(!showDevGuide)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none"
          >
            <div className="bg-cyan-500 text-black px-4 py-2 rounded-full shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Loader2 size={14} className="animate-spin" />
              جاري التحديث...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">الرصيد المتوفر</p>
                        <button 
                          onClick={handleRefresh}
                          className="p-1 hover:bg-white/5 rounded-full transition-colors"
                          title="تحديث الرصيد"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tighter text-white drop-shadow-sm">{user.balance.toLocaleString()}</span>
                        <span className="text-[10px] text-cyan-500 font-bold">ل.س</span>
                      </div>
                    </div>
                    {canClaimReward && supabaseUser && (
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileActive={{ scale: 0.95 }}
                        onClick={() => setShowDailyWheel(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-black rounded-lg shadow-lg shadow-cyan-500/20 hidden"
                      >
                        <Gift size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">مكافأة يومية</span>
                      </motion.button>
                    )}
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
                          setShowWithdraw(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-2.5 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all active:scale-90 shadow-lg shadow-black/20"
                    >
                      <ArrowUpRight size={20} className="font-black" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">سحب</span>
                    </button>
                  </div>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => {
                      setShowAdminPanel(true);
                      fetchAdminRequests();
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black py-3 rounded-xl shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all mb-4 border border-white/10"
                  >
                    <ShieldCheck size={18} />
                    <span className="text-xs uppercase tracking-widest">لوحة تحكم المسؤول</span>
                  </button>
                )}

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
                    {(totalLevelTickets - soldLevelTickets).toLocaleString()} / {totalLevelTickets.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalLevelTickets > 0 ? ((totalLevelTickets - soldLevelTickets) / totalLevelTickets) * 100 : 0}%` }}
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
                disabled={isPurchasing}
                onClick={async () => {
                  const available = shopTickets.filter(t => !t.sold);
                  if (available.length > 0) {
                    const random = available[Math.floor(Math.random() * available.length)];
                    setSelectedTicketForPurchase({ id: random.id, number: random.number });
                    setShowPurchaseModal(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 ${
                  isPurchasing 
                    ? 'bg-gray-700 text-gray-400 cursor-wait' 
                    : 'bg-cyan-500 text-black shadow-cyan-500/20'
                }`}
              >
                {isPurchasing ? 'جاري الشراء...' : 'شراء عشوائي'}
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {/* Search Bar */}
              <div className="relative group">
                <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="ابحث عن رقم كرت معين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pr-11 pl-4 text-sm focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
                />
                {isSearching && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                  </div>
                )}
              </div>

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
                    <span className="text-[9px] text-gray-400 font-bold">المتبقي: {(totalLevelTickets - soldLevelTickets).toLocaleString()} كرت</span>
                    <span className="text-[9px] text-cyan-500 font-black">
                      {totalLevelTickets > 0 ? Math.round(((totalLevelTickets - soldLevelTickets) / totalLevelTickets) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalLevelTickets > 0 ? ((totalLevelTickets - soldLevelTickets) / totalLevelTickets) * 100 : 0}%` }}
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
              {isSearching && shopTickets.length === 0 && (
                <div className="col-span-5 py-20 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-xs">جاري البحث عن الكروت...</p>
                </div>
              )}
              {!isSearching && shopTickets.length === 0 && (
                <div className="col-span-5 py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-gray-500 text-xs">
                    {searchQuery ? "لا توجد كروت متاحة بهذا الرقم" : "لا توجد كروت متاحة في هذا المستوى حالياً"}
                  </p>
                  {!searchQuery && (
                    <p className="text-[10px] text-gray-600 mt-2">يرجى التواصل مع الإدارة أو المحاولة لاحقاً</p>
                  )}
                </div>
              )}
              {shopTickets.map((ticket) => (
                <button 
                  key={ticket.id}
                  disabled={ticket.sold || isPurchasing}
                  onClick={() => {
                    setSelectedTicketForPurchase({ id: ticket.id, number: ticket.number });
                    setShowPurchaseModal(true);
                  }}
                  className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all active:scale-90 ${
                    ticket.sold 
                      ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed' 
                      : isPurchasing 
                        ? 'bg-white/5 border-white/5 opacity-40 cursor-wait'
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

            {shopTickets.length >= displayLimit && !searchQuery && (
              <button 
                onClick={() => setDisplayLimit(prev => prev + 100)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                تحميل المزيد من الكروت
                <ArrowDownLeft size={14} className="-rotate-45" />
              </button>
            )}

            {soldLevelTickets >= totalLevelTickets && totalLevelTickets > 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-center">
                <p className="text-cyan-500 text-sm font-black">لقد تم بيع جميع الكروت في هذا المستوى!</p>
                <p className="text-gray-500 text-[10px] mt-1">سيتم فتح المستوى التالي قريباً</p>
              </div>
            )}
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
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTicketSort(prev => prev === 'date-desc' ? 'date-asc' : 'date-desc')}
                      className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"
                      title="ترتيب حسب التاريخ"
                    >
                      <Clock size={16} className={ticketSort === 'date-asc' ? 'rotate-180' : ''} />
                    </button>
                    <button onClick={() => setActiveTab('shop')} className="p-2 bg-cyan-500 rounded-xl text-black shadow-lg shadow-cyan-500/20">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'active', label: 'نشطة' },
                    { id: 'winner', label: 'رابحة' },
                    { id: 'expired', label: 'منتهية' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setTicketFilter(filter.id as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        ticketFilter === filter.id 
                          ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' 
                          : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {user.tickets
                    .filter(t => ticketFilter === 'all' || t.status === ticketFilter)
                    .sort((a, b) => {
                      const dateA = new Date(a.purchaseDate).getTime();
                      const dateB = new Date(b.purchaseDate).getTime();
                      return ticketSort === 'date-desc' ? dateB - dateA : dateA - dateB;
                    })
                    .length > 0 ? (
                    user.tickets
                      .filter(t => ticketFilter === 'all' || t.status === ticketFilter)
                      .sort((a, b) => {
                        const dateA = new Date(a.purchaseDate).getTime();
                        const dateB = new Date(b.purchaseDate).getTime();
                        return ticketSort === 'date-desc' ? dateB - dateA : dateA - dateB;
                      })
                      .map((ticket) => (
                        <div key={ticket.id} className="relative overflow-hidden bg-[#1a1c20] border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                          <div className={`absolute top-0 left-0 w-1 h-full ${
                            ticket.status === 'active' ? 'bg-cyan-500' :
                            ticket.status === 'winner' ? 'bg-yellow-500' : 'bg-gray-700'
                          }`} />
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                              ticket.status === 'active' ? 'bg-cyan-500/10 text-cyan-500' :
                              ticket.status === 'winner' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'
                            }`}>
                              {ticket.status === 'winner' ? <Trophy size={22} /> : <TicketIcon size={22} />}
                            </div>
                            <div>
                              <p className="text-xl font-mono font-bold tracking-[0.2em] text-white">{ticket.number}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-gray-500">{ticket.purchaseDate}</span>
                                <span className="w-0.5 h-0.5 bg-gray-700 rounded-full" />
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                  ticket.status === 'active' ? 'text-cyan-500' :
                                  ticket.status === 'winner' ? 'text-yellow-500' : 'text-gray-500'
                                }`}>
                                  {ticket.status === 'active' ? 'نشط' : ticket.status === 'winner' ? 'رابح' : 'منتهي'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                            <Cpu size={14} className="text-gray-500 group-hover:text-cyan-500/50 transition-colors" />
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <TicketIcon size={40} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-500 font-bold text-sm">لا توجد كروت تطابق هذا الفلتر</p>
                      <button onClick={() => { setTicketFilter('all'); setActiveTab('shop'); }} className="mt-3 text-cyan-500 font-bold text-xs">اذهب للمتجر الآن</button>
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
              {winners.length > 0 ? (
                winners.map((winner, i) => (
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
                ))
              ) : (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-gray-500 text-sm">لا يوجد فائزين مسجلين بعد</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-20"
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
                  onClick={() => {
                    setAuthInitialMode('login');
                    setShowAuthModal(true);
                  }}
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
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">كود الإحالة</p>
                    <p className="text-xl font-bold text-cyan-500">{user.referralCode || '---'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-gray-400 px-2">الإعدادات العامة</h3>
                  <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    {[
                      { 
                        icon: <Bell size={16} />, 
                        label: 'الإشعارات', 
                        value: 'مفعل',
                        onClick: () => setShowActivityPanel(true)
                      },
                      { 
                        icon: <Settings size={16} />, 
                        label: 'اللغة', 
                        value: 'العربية',
                        onClick: () => addNotification('اللغة الحالية هي العربية', 'success')
                      },
                      { 
                        icon: <Info size={16} />, 
                        label: 'عن التطبيق', 
                        value: 'v1.0.4',
                        onClick: () => setShowAboutApp(true)
                      },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={item.onClick}
                        className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
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

        {activeTab === 'referral' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-20"
          >
            {!supabaseUser ? (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Plus size={40} className="text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white">لم تقم بتسجيل الدخول</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">سجل دخولك للوصول إلى نظام الإحالة</p>
                </div>
                <button 
                  onClick={() => {
                    setAuthInitialMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-8 py-4 bg-cyan-500 text-black font-black rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all text-sm"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            ) : (
              <ReferralDashboard user={user} addNotification={addNotification} />
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
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black">الإشعارات</h2>
                </div>
                <button 
                  onClick={() => setShowActivityPanel(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {realNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                    <Bell size={40} className="opacity-20" />
                    <p className="text-xs font-bold">لا توجد إشعارات حالياً</p>
                  </div>
                ) : (
                  realNotifications.map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={async () => {
                        if (!notif.is_read) {
                          await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
                          setRealNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                          setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.is_read ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-cyan-500/5 border-cyan-500/20 shadow-lg shadow-cyan-500/5'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-[11px] font-black ${notif.type === 'error' ? 'text-red-500' : notif.type === 'success' ? 'text-green-500' : 'text-cyan-500'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[8px] text-gray-500 font-mono">
                          {new Date(notif.created_at).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                        {notif.message}
                      </p>
                      {!notif.is_read && (
                        <div className="mt-2 flex justify-end">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
                {realNotifications.length > 0 && (
                  <button 
                    onClick={async () => {
                      await supabase.from('notifications').update({ is_read: true }).eq('user_id', supabaseUser?.id);
                      setRealNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      setUnreadCount(0);
                    }}
                    className="w-full py-3.5 rounded-xl bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-sm"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
                <button 
                  onClick={() => setShowActivityPanel(false)}
                  className="w-full py-3.5 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all text-sm"
                >
                  إغلاق
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

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#1a1c20] border border-white/10 rounded-[2.5rem] w-full max-w-lg h-[80vh] p-6 relative overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              <AdminPanel 
                onClose={() => setShowAdminPanel(false)} 
                requests={adminRequests} 
                withdrawals={adminWithdrawals}
                onRefresh={fetchAdminRequests}
                addNotification={addNotification}
                setRequests={setAdminRequests}
                setWithdrawals={setAdminWithdrawals}
              />
            </motion.div>
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
                <p className="text-gray-400 text-xs">قم بتحويل المبلغ إلى عنوان نصيب كاش التالي وأرفق صورة الإشعار</p>
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

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <WithdrawModal 
            user={user}
            onClose={() => setShowWithdraw(false)} 
            addNotification={addNotification}
          />
        )}
      </AnimatePresence>
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

              <AuthForm 
                onSuccess={() => setShowAuthModal(false)} 
                addNotification={addNotification} 
                initialMode={authInitialMode}
              />
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
          { id: 'referral', icon: <Plus />, label: 'فريقي' },
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

      {/* About App Modal */}
      <AnimatePresence>
        {showAboutApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShowAboutApp(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto border border-cyan-500/20">
                <Trophy size={40} className="text-cyan-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">نصيب كاش</h2>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">الإصدار v1.0.4</p>
              </div>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                <p>تطبيق نصيب كاش هو منصة ترفيهية تتيح للمستخدمين شراء الكروت والمشاركة في سحوبات أسبوعية وجوائز قيمة.</p>
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">المطور</p>
                  <p className="text-cyan-500 font-black">Naseeb Dev Team</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAboutApp(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-bold transition-all border border-white/5"
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Guide Modal */}
      <AnimatePresence>
        {showDailyWheel && (
          <DailyRewardWheel 
            user={user} 
            lastRewardAt={lastRewardAt}
            onRewardClaimed={handleRewardClaimed} 
            onClose={() => setShowDailyWheel(false)} 
            addNotification={addNotification}
          />
        )}
      </AnimatePresence>

      {/* Floating Daily Reward Button */}
      {supabaseUser && (
        <motion.button
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          whileHover={{ x: -10 }}
          onClick={() => setShowDailyWheel(true)}
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-[90] flex items-center gap-3 pl-4 pr-3 py-3 rounded-l-3xl border-y border-l transition-all shadow-2xl ${
            canClaimReward 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-white/20 text-black shadow-cyan-500/20' 
              : 'bg-[#1a1c20] border-white/5 text-gray-500 opacity-60 grayscale'
          }`}
        >
          <div className="relative">
            <motion.div
              animate={canClaimReward ? { rotate: 360 } : {}}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <RotateCcw size={24} className={canClaimReward ? 'text-black' : 'text-gray-600'} />
            </motion.div>
            {canClaimReward && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-cyan-500 animate-bounce" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">مكافأة</span>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-70 leading-none">يومية</span>
          </div>
          {canClaimReward && (
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-l-3xl bg-white/20 pointer-events-none"
            />
          )}
        </motion.button>
      )}

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

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        ticketNumber={selectedTicketForPurchase?.number || ''}
        balance={user.balance}
        price={TICKET_PRICE}
        onConfirm={async () => {
          if (selectedTicketForPurchase) {
            const success = await buyTicket(selectedTicketForPurchase.number);
            if (success) {
              setShopTickets(prev => prev.map(t => t.id === selectedTicketForPurchase.id ? { ...t, sold: true } : t));
              setShowPurchaseModal(false);
            }
          }
        }}
      />
    </div>
  );
}
