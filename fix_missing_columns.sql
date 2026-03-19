-- 1. التأكد من وجود أعمدة جدول المحادثات (support_chats)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_chats' AND column_name='last_message') THEN
        ALTER TABLE support_chats ADD COLUMN last_message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_chats' AND column_name='last_message_at') THEN
        ALTER TABLE support_chats ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_chats' AND column_name='unread_count_admin') THEN
        ALTER TABLE support_chats ADD COLUMN unread_count_admin INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_chats' AND column_name='unread_count_user') THEN
        ALTER TABLE support_chats ADD COLUMN unread_count_user INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. التأكد من وجود أعمدة جدول الرسائل (support_messages)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='content') THEN
        ALTER TABLE support_messages ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='image_url') THEN
        ALTER TABLE support_messages ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='is_admin_reply') THEN
        ALTER TABLE support_messages ADD COLUMN is_admin_reply BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. إجبار Supabase على تحديث "ذاكرة الكاش" للتعرف على الأعمدة الجديدة
NOTIFY pgrst, 'reload schema';
