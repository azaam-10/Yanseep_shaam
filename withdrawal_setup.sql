-- إنشاء جدول طلبات السحب
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    sham_cash_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- السياسات
DROP POLICY IF EXISTS "Users can view their own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can insert their own withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- السماح للمسؤولين برؤية وتحديث جميع الطلبات (يتم التعامل معها عبر الخدمة أو سياسات إضافية إذا لزم الأمر)
-- في هذا التطبيق، نفترض أن المسؤول يستخدم مفتاح الخدمة أو لديه صلاحيات واسعة
CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND email = 'rwanatiya3@gmail.com' -- البريد الإلكتروني للمسؤول
        )
    );
