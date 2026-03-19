-- Support System Setup

-- 1. Create support_chats table
CREATE TABLE IF NOT EXISTS support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count_admin INTEGER DEFAULT 0,
    unread_count_user INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES support_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for support_chats
CREATE POLICY "Users can view their own chat" ON support_chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chats" ON support_chats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Policies for support_messages
CREATE POLICY "Users can view their own messages" ON support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_chats
            WHERE support_chats.id = support_messages.chat_id AND support_chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON support_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_chats
            WHERE support_chats.id = support_messages.chat_id AND support_chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all messages" ON support_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. Storage for support images
-- Make sure to create a bucket named 'support' in Supabase Storage and set it to public.
