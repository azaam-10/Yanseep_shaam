-- تحديث نظام الإحالة لمنح نقاط بدلاً من رصيد مالي مباشر
-- وتحديث وظيفة الاستبدال

-- 1. إضافة عمود النقاط إذا لم يكن موجوداً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. تحديث تريجر الإحالة لمنح نقاط
CREATE OR REPLACE FUNCTION public.handle_after_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- منح المكافأة للداعي (نقطة واحدة لكل إحالة)
    IF NEW.referred_by IS NOT NULL AND NEW.referred_by != NEW.id THEN
        -- تحديث نقاط الداعي (+1 نقطة)
        UPDATE public.profiles 
        SET points = COALESCE(points, 0) + 1 
        WHERE id = NEW.referred_by;
        
        -- إرسال إشعار فوري للداعي
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.referred_by, 
            'مكافأة إحالة جديدة 🌟', 
            'تم إضافة 1 نقطة إلى رصيد نقاطك بنجاح لدعوة عضو جديد. يمكنك استبدالها برصيد مالي من صفحة الفريق.', 
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إعادة إنشاء وظيفة الاستبدال للتأكد من عملها
CREATE OR REPLACE FUNCTION public.exchange_points_for_balance(user_id UUID, amount_to_exchange INTEGER)
RETURNS JSONB AS $$
DECLARE
    current_points INTEGER;
BEGIN
    -- جلب النقاط الحالية
    SELECT points INTO current_points FROM public.profiles WHERE id = user_id;
    
    -- التحقق من كفاية النقاط
    IF current_points < amount_to_exchange THEN
        RETURN jsonb_build_object('success', false, 'message', 'نقاط غير كافية');
    END IF;
    
    -- تحديث النقاط والرصيد
    UPDATE public.profiles 
    SET 
        points = points - amount_to_exchange,
        balance = balance + amount_to_exchange
    WHERE id = user_id;
    
    -- إضافة إشعار
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        user_id, 
        'استبدال نقاط 🔄', 
        'تم استبدال ' || amount_to_exchange || ' نقطة بـ ' || amount_to_exchange || ' ليرة سورية بنجاح.', 
        'success'
    );
    
    RETURN jsonb_build_object('success', true, 'new_points', current_points - amount_to_exchange);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
