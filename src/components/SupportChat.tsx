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
  Paperclip
} from 'lucide-react';
import { supabase } from '../supabase';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_admin_reply: boolean;
  created_at: string;
}

interface SupportChatProps {
  userId: string;
  onClose: () => void;
}

export function SupportChat({ userId, onClose }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Get or create chat
        let { data: chat, error: chatError } = await supabase
          .from('support_chats')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (chatError) throw chatError;

        if (!chat) {
          const { data: newChat, error: createError } = await supabase
            .from('support_chats')
            .insert({ user_id: userId })
            .select('id')
            .maybeSingle(); // Use maybeSingle to avoid PGRST116 if another insert happened
          
          if (createError) {
            // If it's a unique constraint error, try fetching again
            if (createError.code === '23505') {
              const { data: retryChat } = await supabase
                .from('support_chats')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();
              chat = retryChat;
            } else {
              throw createError;
            }
          } else {
            chat = newChat;
          }
        }

        if (!chat) throw new Error('Could not initialize chat');

        setChatId(chat.id);

        // Fetch messages
        const { data: msgs, error: msgsError } = await supabase
          .from('support_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });

        if (msgsError) throw msgsError;
        setMessages(msgs || []);
        
        // Reset unread count for user
        await supabase
          .from('support_chats')
          .update({ unread_count_user: 0 })
          .eq('id', chat.id);

        // Subscribe to new messages
        const subscription = supabase
          .channel(`chat:${chat.id}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'support_messages',
            filter: `chat_id=eq.${chat.id}`
          }, (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
            // Reset unread count if user is viewing
            supabase.from('support_chats').update({ unread_count_user: 0 }).eq('id', chat.id);
          })
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Chat Init Error:', err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !sending) || !chatId) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content: content,
          is_admin_reply: false
        });

      if (error) throw error;

      // Update chat last message and increment unread count
      const { data: currentChat } = await supabase
        .from('support_chats')
        .select('unread_count_admin')
        .eq('id', chatId)
        .maybeSingle();

      await supabase
        .from('support_chats')
        .update({
          last_message: content || 'صورة',
          last_message_at: new Date().toISOString(),
          unread_count_admin: (currentChat?.unread_count_admin || 0) + 1
        })
        .eq('id', chatId);

    } catch (err) {
      console.error('Send Message Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${chatId}/${Date.now()}.${fileExt}`;
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
          chat_id: chatId,
          sender_id: userId,
          content: '',
          image_url: publicUrl,
          is_admin_reply: false
        });

      if (msgError) throw msgError;

      await supabase
        .from('support_chats')
        .update({
          last_message: 'صورة',
          last_message_at: new Date().toISOString()
        })
        .eq('id', chatId);

    } catch (err) {
      console.error('Image Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[1000]"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm">الدعم الفني</h3>
            <p className="text-white/70 text-[10px]">متصلون لمساعدتك</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f0f0f]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50">
            <MessageCircle className="w-12 h-12 text-gray-500" />
            <p className="text-xs text-gray-400">ابدأ المحادثة مع الدعم الفني</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.is_admin_reply 
                  ? 'bg-white/5 text-white rounded-tr-none' 
                  : 'bg-cyan-500 text-black rounded-tl-none font-bold'
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
                  msg.is_admin_reply ? 'text-gray-500' : 'text-black/50'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                  {!msg.is_admin_reply && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center gap-2">
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
          className="p-2 text-gray-400 hover:text-cyan-500 transition-colors"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
        </button>
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        <button 
          type="submit"
          disabled={sending || (!newMessage.trim() && !uploading)}
          className="p-2 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </motion.div>
  );
}
