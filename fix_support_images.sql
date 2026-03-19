-- 1. التأكد من وجود عمود image_url في جدول support_messages
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='image_url') THEN
        ALTER TABLE support_messages ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. إنشاء مخزن الصور support إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('support', 'support', true)
ON CONFLICT (id) DO NOTHING;

-- 3. إعداد سياسات الوصول للمخزن (Storage Policies)
-- السماح للجميع بمشاهدة الصور
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'support');

-- السماح للمستخدمين المسجلين برفع الصور
DROP POLICY IF EXISTS "Authenticated Users Upload" ON storage.objects;
CREATE POLICY "Authenticated Users Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'support' AND auth.role() = 'authenticated'
);

-- السماح للمسؤولين بالتحكم الكامل
DROP POLICY IF EXISTS "Admins Full Access" ON storage.objects;
CREATE POLICY "Admins Full Access" ON storage.objects FOR ALL USING (
    bucket_id = 'support' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
