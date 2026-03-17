-- 1. إضافة عمود الصلاحيات لجدول الحسابات إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. تعيين المسؤولين (الأدمن)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com');

-- 3. تحديث سياسات جدول طلبات السحب (withdrawal_requests)
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;

CREATE POLICY "Admins can manage all withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR email IN ('azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com'))
        )
    );

-- 4. تحديث سياسات جدول طلبات الشحن (recharge_requests)
DROP POLICY IF EXISTS "Admins can manage all recharge requests" ON public.recharge_requests;

CREATE POLICY "Admins can manage all recharge requests" ON public.recharge_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR email IN ('azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com'))
        )
    );

-- 5. السماح للمسؤولين بتحديث أرصدة المستخدمين
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR email IN ('azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com'))
        )
    );

-- 6. السماح للمسؤولين برؤية جميع الإشعارات (اختياري)
DROP POLICY IF EXISTS "Admins can see all notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR email IN ('azaamazeez8876@gmail.com', 'rwanatiya3@gmail.com', 'azaamazeez1@gmail.com'))
        )
    );
