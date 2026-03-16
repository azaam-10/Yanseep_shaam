-- وظيفة لاستبدال النقاط بالرصيد
CREATE OR REPLACE FUNCTION public.exchange_points_for_balance(user_id UUID, amount_to_exchange INTEGER)
RETURNS JSONB AS $$
DECLARE
    current_points INTEGER;
    result JSONB;
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
