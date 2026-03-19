import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, X, RotateCcw, Eye, Loader2, Plus, Trash2, Search, 
  Lock, Unlock, Upload, LayoutDashboard, CreditCard, Ticket, 
  Users, Settings, MessageSquare, ArrowRight, ChevronLeft, Wallet, TrendingUp, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { AdminSupport } from './AdminSupport';

interface AdminPanelProps {
  onClose: () => void;
  requests: any[];
  withdrawals: any[];
  onRefresh: () => void;
  addNotification: (t: string, type?: 'success' | 'error') => void;
  setRequests: React.Dispatch<React.SetStateAction<any[]>>;
  setWithdrawals: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AdminPanel({ 
  onClose, 
  requests, 
  withdrawals,
  onRefresh, 
  addNotification,
  setRequests,
  setWithdrawals
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'withdrawals' | 'tickets' | 'users' | 'settings' | 'support'>('dashboard');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<string>('');
  const [isInitializingStorage, setIsInitializingStorage] = useState(false);
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingRecharge: 0,
    pendingWithdrawal: 0,
    totalTickets: 0,
    soldTickets: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [usersCount, rechargeCount, withdrawCount, ticketsCount, soldCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('recharge_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('shop_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('shop_tickets').select('*', { count: 'exact', head: true }).eq('is_sold', true)
      ]);

      const { data: balanceData } = await supabase.from('profiles').select('balance');
      const totalBalance = balanceData?.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0) || 0;

      setStats({
        totalUsers: usersCount.count || 0,
        totalBalance: totalBalance,
        pendingRecharge: rechargeCount.count || 0,
        pendingWithdrawal: withdrawCount.count || 0,
        totalTickets: ticketsCount.count || 0,
        soldTickets: soldCount.count || 0
      });
    } catch (err) {
      console.error('Fetch Stats Error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

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

  const initializeStorage = async () => {
    setIsInitializingStorage(true);
    try {
      // Initialize Receipts Bucket
      const { error: receiptsError } = await supabase.storage.createBucket('receipts', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (receiptsError && !receiptsError.message.includes('already exists')) {
        throw receiptsError;
      }

      // Initialize Support Bucket
      const { error: supportError } = await supabase.storage.createBucket('support', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (supportError && !supportError.message.includes('already exists')) {
        throw supportError;
      }
      
      addNotification('تم تهيئة مخازن الصور (receipts & support) بنجاح');
    } catch (err: any) {
      console.error('Storage Init Error:', err);
      addNotification('فشل التهيئة التلقائية. يرجى التأكد من وجود مخازن باسم receipts و support يدوياً', 'error');
    } finally {
      setIsInitializingStorage(false);
    }
  };

  const fetchUserTickets = async (userId: string) => {
    setIsLoadingUserTickets(true);
    try {
      const { data, error } = await supabase
        .from('shop_tickets')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_sold', true);
      
      if (error) throw error;
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

      const { error: requestError } = await supabase
        .from('recharge_requests')
        .update({ status: 'approved', processed_amount: amount })
        .eq('id', requestId);
      
      if (requestError) throw requestError;

      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'تم قبول طلب الشحن',
        message: `تمت الموافقة على طلب الشحن الخاص بك بمبلغ ${amount} ل.س. تم تحديث رصيدك الآن.`,
        type: 'success'
      });

      addNotification(`تم شحن ${amount} ل.س بنجاح`);
      setRechargeAmount('');
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

      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'تم قبول طلب السحب',
        message: `تمت الموافقة على طلب السحب الخاص بك بمبلغ ${amount} ل.س. سيتم تحويل المبلغ إلى عنوان شام كاش الخاص بك قريباً.`,
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
      await supabase
        .from('shop_tickets')
        .update({ is_active: false })
        .eq('level_index', level)
        .eq('is_sold', true);
      
      const { error: deleteError } = await supabase
        .from('shop_tickets')
        .delete()
        .eq('level_index', level)
        .eq('is_sold', false);
      
      if (deleteError) throw deleteError;

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
      
      if (tickets.length > 0) {
        const batchSize = 500;
        for (let i = 0; i < tickets.length; i += batchSize) {
          const batch = tickets.slice(i, i + batchSize);
          const { error } = await supabase.from('shop_tickets').insert(batch);
          if (error) throw error;
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
      await supabase
        .from('shop_tickets')
        .update({ is_active: false })
        .eq('is_sold', true);

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userSearchEmail)
        .maybeSingle();
      
      if (error) throw error;

      if (data) {
        setFoundUser(data);
      } else {
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
      const { error } = await supabase.rpc('delete_user_completely', { user_id: foundUser.id });
      
      if (error) {
        console.error('RPC Delete Error:', error);
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

  const menuItems = [
    { id: 'dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'requests', label: 'طلبات الشحن', icon: CreditCard, count: requests.length },
    { id: 'withdrawals', label: 'طلبات السحب', icon: Wallet, count: withdrawals.length },
    { id: 'tickets', label: 'إدارة الكروت', icon: Ticket },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'support', label: 'الدعم الفني', icon: MessageSquare },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0b0d] flex flex-col md:flex-row overflow-hidden font-sans" dir="rtl">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-[#14161a] border-l border-white/5 flex flex-col h-auto md:h-full z-10">
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
              <ShieldCheck size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white leading-none">لوحة التحكم</h2>
              <p className="text-[8px] md:text-[9px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Admin Dashboard</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 bg-white/5 rounded-lg text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-2 md:p-4 flex md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all whitespace-nowrap md:whitespace-normal group ${
                activeTab === item.id 
                  ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'text-gray-500 group-hover:text-cyan-500'} />
              <span className="text-xs md:text-sm">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`mr-auto px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-black ${
                  activeTab === item.id ? 'bg-black/20 text-black' : 'bg-cyan-500/20 text-cyan-500'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 md:p-4 border-t border-white/5 hidden md:block">
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs md:text-sm hover:bg-red-500/20 transition-all"
          >
            <ArrowRight size={16} md:size={18} />
            <span>خروج من اللوحة</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0b0d] relative">
        {/* Header */}
        <header className="h-14 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0a0b0d]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h3 className="text-base md:text-lg font-black text-white">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => {
                onRefresh();
                if (activeTab === 'users') fetchRecentUsers();
                addNotification('تم تحديث البيانات');
              }} 
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-lg md:rounded-xl hover:bg-white/10 transition-all text-cyan-500 text-[10px] md:text-xs font-bold"
            >
              <RotateCcw size={14} md:size={16} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button 
              onClick={onClose}
              className="hidden md:flex p-2 md:p-2.5 bg-white/5 rounded-lg md:rounded-xl hover:bg-white/10 transition-all text-gray-400"
            >
              <X size={18} md:size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-4 md:space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="bg-[#14161a] border border-white/5 p-3.5 md:p-6 rounded-2xl md:rounded-[2rem] relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:bg-cyan-500/10 transition-all" />
                        <div className="flex items-center gap-3 md:gap-4 mb-2.5 md:mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-cyan-500">
                            <Users size={20} md:size={24} />
                          </div>
                          <div>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">إجمالي المستخدمين</p>
                            <h4 className="text-xl md:text-2xl font-black text-white">{stats.totalUsers.toLocaleString()}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-500 font-bold">
                          <TrendingUp size={10} md:size={12} className="text-green-500" />
                          <span>نمو مستمر في قاعدة المستخدمين</span>
                        </div>
                      </div>

                      <div className="bg-[#14161a] border border-white/5 p-3.5 md:p-6 rounded-2xl md:rounded-[2rem] relative overflow-hidden group hover:border-green-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-green-500/5 blur-3xl rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:bg-green-500/10 transition-all" />
                        <div className="flex items-center gap-3 md:gap-4 mb-2.5 md:mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-green-500">
                            <Wallet size={20} md:size={24} />
                          </div>
                          <div>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">إجمالي أرصدة النظام</p>
                            <h4 className="text-xl md:text-2xl font-black text-white">{stats.totalBalance.toLocaleString()} <span className="text-[10px] md:text-xs text-green-500">ل.س</span></h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-500 font-bold">
                          <Activity size={10} md:size={12} className="text-cyan-500" />
                          <span>سيولة النظام الحالية</span>
                        </div>
                      </div>

                      <div className="bg-[#14161a] border border-white/5 p-3.5 md:p-6 rounded-2xl md:rounded-[2rem] relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:bg-yellow-500/10 transition-all" />
                        <div className="flex items-center gap-3 md:gap-4 mb-2.5 md:mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-yellow-500">
                            <Ticket size={20} md:size={24} />
                          </div>
                          <div>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">إحصائيات الكروت</p>
                            <h4 className="text-xl md:text-2xl font-black text-white">{stats.soldTickets.toLocaleString()} / {stats.totalTickets.toLocaleString()}</h4>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 h-1 md:h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-yellow-500 h-full transition-all duration-1000" 
                            style={{ width: `${(stats.soldTickets / (stats.totalTickets || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions & Pending Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                      {/* Pending Requests Summary */}
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">الطلبات المعلقة</h4>
                          <button 
                            onClick={() => setActiveTab('requests')}
                            className="text-[9px] md:text-[10px] font-black text-cyan-500 hover:text-cyan-400 transition-colors"
                          >
                            عرض الكل
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                          <div className="bg-[#14161a] border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer" onClick={() => setActiveTab('requests')}>
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-9 h-9 md:w-10 md:h-10 bg-cyan-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-cyan-500">
                                <CreditCard size={18} md:size={20} />
                              </div>
                              <div>
                                <p className="text-xs md:text-sm font-bold text-white">طلبات الشحن</p>
                                <p className="text-[9px] md:text-[10px] text-gray-500">هناك {stats.pendingRecharge} طلبات بانتظار المراجعة</p>
                              </div>
                            </div>
                            <ChevronLeft size={16} md:size={18} className="text-gray-600 group-hover:text-cyan-500 transition-all" />
                          </div>

                          <div className="bg-[#14161a] border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer" onClick={() => setActiveTab('withdrawals')}>
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-9 h-9 md:w-10 md:h-10 bg-red-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-red-500">
                                <Wallet size={18} md:size={20} />
                              </div>
                              <div>
                                <p className="text-xs md:text-sm font-bold text-white">طلبات السحب</p>
                                <p className="text-[9px] md:text-[10px] text-gray-500">هناك {stats.pendingWithdrawal} طلبات بانتظار المراجعة</p>
                              </div>
                            </div>
                            <ChevronLeft size={16} md:size={18} className="text-gray-600 group-hover:text-red-500 transition-all" />
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-3 md:space-y-4">
                        <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest px-2">إجراءات سريعة</h4>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <button 
                            onClick={() => setActiveTab('tickets')}
                            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-3 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all group"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                              <Ticket size={20} md:size={24} />
                            </div>
                            <span className="text-[10px] md:text-xs font-black text-white">إضافة كروت</span>
                          </button>

                          <button 
                            onClick={() => setActiveTab('users')}
                            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-3 hover:from-purple-500/20 hover:to-pink-500/20 transition-all group"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center text-black shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                              <Users size={20} md:size={24} />
                            </div>
                            <span className="text-[10px] md:text-xs font-black text-white">إدارة المستخدمين</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'requests' && (
                  <div className="space-y-4 md:space-y-6">
                    {requests.length === 0 ? (
                      <div className="py-20 md:py-32 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl md:rounded-[2.5rem]">
                        <CreditCard size={32} md:size={48} className="mb-3 md:mb-4 opacity-20" />
                        <p className="text-xs md:text-sm font-bold">لا توجد طلبات شحن معلقة حالياً</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {requests.map((req) => (
                          <div key={req.id} className="bg-[#14161a] border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-4 md:space-y-6 shadow-xl">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2.5 md:gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-cyan-500 font-black text-base md:text-lg">
                                  {req.profiles?.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm md:text-base font-bold text-white leading-tight">{req.profiles?.first_name} {req.profiles?.last_name || ''}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">{req.user_email}</p>
                                </div>
                              </div>
                              <div className="text-[8px] md:text-[10px] text-gray-500 font-mono bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                                {new Date(req.created_at).toLocaleTimeString('ar-SY')}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl border border-white/5">
                              <div>
                                <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5 md:mb-1">الرصيد الحالي</p>
                                <p className="text-xs md:text-sm font-black text-cyan-500">{req.profiles?.balance || 0} ل.س</p>
                              </div>
                              <div className="text-left">
                                <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5 md:mb-1">رقم الهاتف</p>
                                <p className="text-xs md:text-sm font-black text-white">{req.profiles?.phone || '---'}</p>
                              </div>
                            </div>

                            {req.receipt_url && (
                              <div className="relative group rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-video">
                                <img src={req.receipt_url} alt="Receipt" className="w-full h-full object-contain" />
                                <a 
                                  href={req.receipt_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                >
                                  <div className="bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs flex items-center gap-2">
                                    <Eye size={16} md:size={18} />
                                    عرض الإيصال
                                  </div>
                                </a>
                              </div>
                            )}

                            <div className="flex flex-col gap-2.5 md:gap-3">
                              <div className="relative">
                                <input 
                                  type="number" 
                                  placeholder="المبلغ المراد شحنه"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-center font-black"
                                  onChange={(e) => setRechargeAmount(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 md:gap-3">
                                <button 
                                  onClick={() => handleApprove(req.id, req.user_id)}
                                  disabled={processingId === req.id}
                                  className="flex-1 bg-cyan-500 text-black font-black py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex items-center justify-center"
                                >
                                  {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : 'موافقة وشحن'}
                                </button>
                                <button 
                                  onClick={() => handleReject(req.id)}
                                  disabled={processingId === req.id}
                                  className="px-6 md:px-8 bg-red-500/10 text-red-500 border border-red-500/20 font-black py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                                >
                                  رفض
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'withdrawals' && (
                  <div className="space-y-4 md:space-y-6">
                    {withdrawals.length === 0 ? (
                      <div className="py-20 md:py-32 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl md:rounded-[2.5rem]">
                        <LayoutDashboard size={32} md:size={48} className="mb-3 md:mb-4 opacity-20" />
                        <p className="text-xs md:text-sm font-bold">لا توجد طلبات سحب معلقة حالياً</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {withdrawals.map((req) => (
                          <div key={req.id} className="bg-[#14161a] border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-4 md:space-y-6 shadow-xl">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2.5 md:gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 font-black text-base md:text-lg">
                                  {req.profiles?.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm md:text-base font-bold text-white leading-tight">{req.profiles?.first_name} {req.profiles?.last_name || ''}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">{req.profiles?.email}</p>
                                </div>
                              </div>
                              <div className="text-[8px] md:text-[10px] text-gray-500 font-mono bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                                {new Date(req.created_at).toLocaleTimeString('ar-SY')}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                              <div className="p-3 md:p-4 bg-red-500/5 rounded-xl md:rounded-2xl border border-red-500/10">
                                <p className="text-[8px] md:text-[10px] text-red-500/60 font-bold uppercase tracking-widest mb-0.5 md:mb-1">المبلغ المطلوب</p>
                                <p className="text-base md:text-lg font-black text-red-500">{req.amount} ل.س</p>
                              </div>
                              <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5 md:mb-1">الرصيد المتاح</p>
                                <p className="text-base md:text-lg font-black text-white">{req.profiles?.balance} ل.س</p>
                              </div>
                            </div>

                            <div className="bg-black/40 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1.5 md:space-y-2">
                              <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">عنوان شام كاش للسحب</p>
                              <p className="text-xs md:text-sm font-mono text-cyan-500 break-all leading-relaxed">{req.sham_cash_address}</p>
                            </div>

                            <div className="flex gap-2 md:gap-3">
                              <button 
                                onClick={() => handleApproveWithdrawal(req.id, req.user_id, req.amount)}
                                disabled={processingId === req.id}
                                className="flex-1 bg-cyan-500 text-black font-black py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex items-center justify-center"
                              >
                                {processingId === req.id ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : 'موافقة على السحب'}
                              </button>
                              <button 
                                onClick={() => handleRejectWithdrawal(req.id)}
                                disabled={processingId === req.id}
                                className="px-6 md:px-8 bg-red-500/10 text-red-500 border border-red-500/20 font-black py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                رفض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tickets' && (
                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-8">
                    <div className="bg-[#14161a] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 space-y-6 md:space-y-8 shadow-xl">
                      <div className="space-y-1.5 md:space-y-2">
                        <h3 className="text-lg md:text-xl font-black text-white">توليد كروت جديدة</h3>
                        <p className="text-[10px] md:text-xs text-gray-500">قم بتوليد مجموعة جديدة من الكروت للمتجر</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                          <label className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest mr-1 md:mr-2">من رقم</label>
                          <input 
                            type="number" 
                            value={ticketStart}
                            onChange={(e) => setTicketStart(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm outline-none focus:border-cyan-500 transition-all font-mono"
                            placeholder="000001"
                          />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                          <label className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest mr-1 md:mr-2">إلى رقم</label>
                          <input 
                            type="number" 
                            value={ticketEnd}
                            onChange={(e) => setTicketEnd(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm outline-none focus:border-cyan-500 transition-all font-mono"
                            placeholder="000100"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest mr-1 md:mr-2">المستوى</label>
                        <select 
                          value={ticketLevel}
                          onChange={(e) => setTicketLevel(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="0">برونز 1 (1000 كرت)</option>
                          <option value="1">برونز 2 (2000 كرت)</option>
                          <option value="2">برونز 3 (3000 كرت)</option>
                          <option value="3">سيلفر 1 (5000 كرت)</option>
                          <option value="4">سيلفر 2 (10000 كرت)</option>
                          <option value="5">جولد 1 (20000 كرت)</option>
                        </select>
                      </div>

                      <div className="pt-2 md:pt-4 space-y-3 md:space-y-4">
                        <button 
                          onClick={handleAddTickets}
                          disabled={isAddingTickets}
                          className="w-full bg-cyan-500 text-black font-black py-3.5 md:py-5 rounded-xl md:rounded-2xl text-xs md:text-sm shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 md:gap-3"
                        >
                          {isAddingTickets ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : (
                            <>
                              <Plus size={18} md:size={20} />
                              <span>إضافة الكروت إلى المتجر</span>
                            </>
                          )}
                        </button>

                        <div className="pt-3 md:pt-4 border-t border-white/5">
                          <button 
                            onClick={handleDeleteUnsoldTickets}
                            disabled={isDeletingTickets}
                            className={`w-full font-black py-3.5 md:py-5 rounded-xl md:rounded-2xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 md:gap-3 ${
                              showDeleteConfirm 
                                ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                                : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20'
                            }`}
                          >
                            {isDeletingTickets ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : (
                              <>
                                <Trash2 size={18} md:size={20} />
                                <span>{showDeleteConfirm ? 'تأكيد الحذف النهائي؟' : 'حذف جميع الكروت غير المباعة'}</span>
                              </>
                            )}
                          </button>
                          {showDeleteConfirm && (
                            <button 
                              onClick={() => setShowDeleteConfirm(false)}
                              className="w-full mt-3 md:mt-4 text-[10px] md:text-xs text-gray-500 hover:text-white transition-colors font-bold"
                            >
                              إلغاء العملية
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-4 md:space-y-8">
                    <div className="bg-[#14161a] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 space-y-4 md:space-y-6 shadow-xl">
                      <div className="space-y-1.5 md:space-y-2">
                        <h3 className="text-lg md:text-xl font-black text-white">إدارة المستخدمين</h3>
                        <p className="text-[10px] md:text-xs text-gray-500">ابحث عن مستخدم لتعديل رصيده أو إدارة حسابه</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} md:size={20} />
                          <input 
                            type="text" 
                            value={userSearchEmail}
                            onChange={(e) => setUserSearchEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pr-12 md:pr-14 pl-4 md:pl-6 text-xs md:text-sm outline-none focus:border-cyan-500 transition-all"
                            placeholder="البريد الإلكتروني أو الاسم الكامل..."
                          />
                        </div>
                        <button 
                          onClick={handleSearchUser}
                          disabled={isSearchingUser}
                          className="bg-cyan-500 text-black px-6 md:px-8 py-3 md:py-0 rounded-xl md:rounded-2xl hover:bg-cyan-400 transition-all font-black text-xs md:text-sm"
                        >
                          {isSearchingUser ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : 'بحث'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {foundUser && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4 md:pt-8 border-t border-white/5 space-y-6 md:space-y-8"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-cyan-500 text-xl md:text-2xl font-black border border-cyan-500/20">
                                  {foundUser.first_name?.[0] || 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                                    <h4 className="text-lg md:text-2xl font-black text-white leading-tight">
                                      {`${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim() || 'مستخدم بدون اسم'}
                                    </h4>
                                    {foundUser.is_frozen && (
                                      <span className="bg-red-500 text-white text-[8px] md:text-[10px] px-2 md:px-3 py-0.5 md:py-1 rounded-full font-black uppercase tracking-widest">مجمد</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] md:text-sm text-gray-500">{foundUser.email}</p>
                                  <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-3">
                                    <div className="bg-cyan-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-cyan-500/20">
                                      <p className="text-[8px] md:text-[10px] text-cyan-500 font-black uppercase tracking-widest">الرصيد</p>
                                      <p className="text-sm md:text-lg font-black text-white">{foundUser.balance} ل.س</p>
                                    </div>
                                    <div className="bg-white/5 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/10">
                                      <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">تاريخ الانضمام</p>
                                      <p className="text-[10px] md:text-sm font-bold text-white">
                                        {foundUser.created_at ? new Date(foundUser.created_at).toLocaleDateString('ar-SY') : '---'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setFoundUser(null)}
                                className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-gray-400"
                              >
                                <X size={18} md:size={20} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                              <div className="space-y-3 md:space-y-4">
                                <h5 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <CreditCard size={12} md:size={14} className="text-cyan-500" />
                                  تعديل الرصيد
                                </h5>
                                <div className="flex gap-2 md:gap-3">
                                  <input 
                                    type="number" 
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm outline-none focus:border-cyan-500 transition-all text-center font-black"
                                    placeholder="المبلغ"
                                  />
                                  <button 
                                    onClick={() => handleAdjustBalance('add')}
                                    className="bg-green-500 text-black font-black px-4 md:px-6 rounded-xl md:rounded-2xl hover:bg-green-400 transition-all text-[10px] md:text-xs"
                                  >
                                    إضافة
                                  </button>
                                  <button 
                                    onClick={() => handleAdjustBalance('subtract')}
                                    className="bg-red-500 text-white font-black px-4 md:px-6 rounded-xl md:rounded-2xl hover:bg-red-400 transition-all text-[10px] md:text-xs"
                                  >
                                    خصم
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <ShieldCheck size={14} className="text-cyan-500" />
                                  إجراءات الحساب
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={handleToggleFreeze}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                                      foundUser.is_frozen 
                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' 
                                        : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20'
                                    }`}
                                  >
                                    {foundUser.is_frozen ? <Unlock size={16} /> : <Lock size={16} />}
                                    <span>{foundUser.is_frozen ? 'إلغاء التجميد' : 'تجميد الحساب'}</span>
                                  </button>
                                  <button 
                                    onClick={handleDeleteUser}
                                    className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl text-xs font-black hover:bg-red-500/20 transition-all"
                                  >
                                    <Trash2 size={16} />
                                    <span>حذف الحساب</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <Ticket size={14} className="text-cyan-500" />
                                  الكروت المشتراة ({userTickets.length})
                                </h5>
                                <button 
                                  onClick={() => fetchUserTickets(foundUser.id)}
                                  className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-cyan-500"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                              {isLoadingUserTickets ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-cyan-500" /></div>
                              ) : userTickets.length === 0 ? (
                                <div className="bg-black/20 border border-dashed border-white/5 rounded-2xl py-8 text-center">
                                  <p className="text-xs text-gray-600 italic font-bold">لم يقم بشراء أي كروت بعد</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {userTickets.map(t => (
                                    <div key={t.id} className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl py-2 text-center group hover:bg-cyan-500/10 transition-all">
                                      <p className="text-xs font-black text-cyan-500 font-mono">{t.number}</p>
                                      <p className="text-[7px] text-gray-600 font-bold uppercase mt-1">المستوى {t.level_index}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mr-4">آخر المستخدمين المسجلين</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loadingUsers ? (
                          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>
                        ) : recentUsers.length === 0 ? (
                          <div className="col-span-full bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
                            <p className="text-sm text-gray-500 font-bold">لا يوجد مستخدمين مسجلين حالياً</p>
                          </div>
                        ) : (
                          recentUsers.map(u => (
                            <button 
                              key={u.id}
                              onClick={() => {
                                setFoundUser(u);
                                setUserSearchEmail(u.email || '');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="bg-[#14161a] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/50 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cyan-500 font-black text-sm group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                  {u.first_name?.[0] || 'U'}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-white">
                                    {`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'مستخدم بدون اسم'}
                                  </p>
                                  <p className="text-[10px] text-gray-500">{u.email || 'لا يوجد بريد'}</p>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-black text-cyan-500">{u.balance} ل.س</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase">الرصيد</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-[#14161a] border border-white/10 rounded-3xl p-5 space-y-5 shadow-xl">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white">إعدادات النظام</h3>
                        <p className="text-[10px] text-gray-500">إدارة الجوانب التقنية للمنصة</p>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3 text-cyan-500">
                          <Upload size={20} />
                          <h4 className="text-xs font-black uppercase tracking-widest">مخزن الصور (Storage)</h4>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          إذا كنت تواجه مشاكل في رفع صور الإيصالات أو صور الدردشة، يمكنك محاولة تهيئة مخازن الصور تلقائياً. سيقوم هذا الإجراء بإنشاء Buckets باسم "receipts" و "support" في Supabase.
                        </p>
                        <button 
                          onClick={initializeStorage}
                          disabled={isInitializingStorage}
                          className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          {isInitializingStorage ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={16} />}
                          تهيئة مخازن الصور (Receipts & Support Buckets)
                        </button>
                      </div>

                      <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-red-500">
                          <ShieldCheck size={16} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">ملاحظة أمنية هامة</h4>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          في حال فشل التهيئة التلقائية، يجب عليك الدخول إلى لوحة تحكم Supabase يدوياً وإنشاء Buckets جديدة بالأسماء التالية:
                          <br />
                          1. <span className="text-white font-mono font-black">receipts</span>
                          <br />
                          2. <span className="text-white font-mono font-black">support</span>
                          <br />
                          وتفعيل خيار <span className="text-white font-bold">Public Access</span> لكل منهما لضمان ظهور الصور بشكل صحيح.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'support' && (
                  <div className="h-[calc(100vh-12rem)]">
                    <AdminSupport />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
