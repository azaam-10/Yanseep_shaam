-- 1. تنظيف البيانات المكررة (إبقاء محادثة واحدة فقط لكل مستخدم)
DELETE FROM support_chats a
USING support_chats b
WHERE a.id < b.id
  AND a.user_id = b.user_id;

-- 2. إضافة قيد الفريد (Unique Constraint) لضمان عدم التكرار مستقبلاً
ALTER TABLE support_chats DROP CONSTRAINT IF EXISTS support_chats_user_id_key;
ALTER TABLE support_chats ADD CONSTRAINT support_chats_user_id_key UNIQUE (user_id);

-- 3. التأكد من وجود الأعمدة في جدول الرسائل
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='content') THEN
        ALTER TABLE support_messages ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='image_url') THEN
        ALTER TABLE support_messages ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 4. تحديث السياسات الأمنية (RLS) لضمان الصلاحيات الكاملة
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- سياسات المحادثات
DROP POLICY IF EXISTS "Users can view their own chats" ON support_chats;
CREATE POLICY "Users can view their own chats" ON support_chats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chats" ON support_chats;
CREATE POLICY "Users can insert their own chats" ON support_chats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chats" ON support_chats;
CREATE POLICY "Users can update their own chats" ON support_chats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all chats" ON support_chats;
CREATE POLICY "Admins can view all chats" ON support_chats FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- سياسات الرسائل
DROP POLICY IF EXISTS "Users can view their own messages" ON support_messages;
CREATE POLICY "Users can view their own messages" ON support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM support_chats WHERE id = chat_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can send messages" ON support_messages;
CREATE POLICY "Users can send messages" ON support_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_chats WHERE id = chat_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can do everything" ON support_messages;
CREATE POLICY "Admins can do everything" ON support_messages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. تحديث ذاكرة الكاش للنظام
NOTIFY pgrst, 'reload schema';
