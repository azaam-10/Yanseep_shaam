import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Check, 
  CheckCheck,
  User as UserIcon,
  Search,
  Paperclip,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { supabase } from '../supabase';

interface Chat {
  id: string;
  user_id: string;
  last_message: string;
  last_message_at: string;
  unread_count_admin: number;
  unread_count_user: number;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_admin_reply: boolean;
  created_at: string;
}

export function AdminSupport() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
    
    // Subscribe to new chats and updates
    const subscription = supabase
      .channel('admin_chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_chats'
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('support_chats')
        .select('*, profiles(first_name, last_name, email)')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (err) {
      console.error('Fetch Chats Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .eq('chat_id', activeChat.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        
        // Reset unread count for admin
        await supabase
          .from('support_chats')
          .update({ unread_count_admin: 0 })
          .eq('id', activeChat.id);

      } catch (err) {
        console.error('Fetch Messages Error:', err);
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`admin_chat:${activeChat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `chat_id=eq.${activeChat.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        // Reset unread count if admin is viewing
        supabase.from('support_chats').update({ unread_count_admin: 0 }).eq('id', activeChat.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !sending) || !activeChat) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: activeChat.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content: content,
          is_admin_reply: true
        });

      if (error) throw error;

      // Update chat last message and increment unread count
      const { data: currentChat } = await supabase
        .from('support_chats')
        .select('unread_count_user')
        .eq('id', activeChat.id)
        .maybeSingle();

      await supabase
        .from('support_chats')
        .update({
          last_message: content || 'صورة',
          last_message_at: new Date().toISOString(),
          unread_count_user: (currentChat?.unread_count_user || 0) + 1
        })
        .eq('id', activeChat.id);

    } catch (err) {
      console.error('Send Message Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeChat.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('support')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('support')
        .getPublicUrl(fileName);

      const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
          chat_id: activeChat.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content: '',
          image_url: publicUrl,
          is_admin_reply: true
        });

      if (msgError) throw msgError;

      await supabase
        .from('support_chats')
        .update({
          last_message: 'صورة',
          last_message_at: new Date().toISOString()
        })
        .eq('id', activeChat.id);

    } catch (err) {
      console.error('Image Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const filteredChats = chats.filter(chat => 
    `${chat.profiles.first_name} ${chat.profiles.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    chat.profiles.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[600px] bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden" dir="rtl">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-[350px] border-l border-white/10 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-bottom border-white/10 space-y-4">
          <h3 className="text-white font-black text-lg">محادثات الدعم</h3>
          <div className="relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث عن مستخدم..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
              <MessageCircle className="w-12 h-12 text-gray-500 mb-2" />
              <p className="text-xs text-gray-400">لا توجد محادثات نشطة</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5 relative ${
                  activeChat?.id === chat.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-black font-black">
                  {chat.profiles.first_name[0]}
                </div>
                <div className="flex-1 text-right overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-bold text-sm truncate">
                      {chat.profiles.first_name} {chat.profiles.last_name}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {new Date(chat.last_message_at).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{chat.last_message || 'ابدأ المحادثة'}</p>
                </div>
                {chat.unread_count_admin > 0 && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                    {chat.unread_count_admin}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#1a1a1a] ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeChat ? (
          <div className="text-center space-y-4 opacity-30">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <p className="text-white font-bold">اختر محادثة للبدء في الرد</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 text-gray-400">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black">
                  {activeChat.profiles.first_name[0]}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    {activeChat.profiles.first_name} {activeChat.profiles.last_name}
                  </h4>
                  <p className="text-cyan-500 text-[10px]">{activeChat.profiles.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.is_admin_reply 
                      ? 'bg-cyan-500 text-black rounded-tl-none font-bold' 
                      : 'bg-white/5 text-white rounded-tr-none'
                  }`}>
                    {msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Chat" 
                        className="rounded-lg mb-2 max-w-full cursor-pointer"
                        onClick={() => window.open(msg.image_url!, '_blank')}
                      />
                    )}
                    {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                    <div className={`text-[9px] mt-1 flex items-center gap-1 ${
                      msg.is_admin_reply ? 'text-black/50' : 'text-gray-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                      {msg.is_admin_reply && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#0f0f0f] border-t border-white/10 flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-3 text-gray-400 hover:text-cyan-500 transition-colors bg-white/5 rounded-xl"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
              </button>
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <button 
                type="submit"
                disabled={sending || (!newMessage.trim() && !uploading)}
                className="p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
