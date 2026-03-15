-- تحديث جدول الملفات الشخصية لإضافة حقول المكافأة اليومية
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_daily_reward_at TIMESTAMPTZ;

-- وظيفة آمنة لاستلام المكافأة اليومية (تعتمد على وقت السيرفر)
CREATE OR REPLACE FUNCTION claim_daily_reward(user_id UUID, reward_amount DECIMAL)
RETURNS JSON AS $$
DECLARE
    last_claim TIMESTAMPTZ;
    current_balance DECIMAL;
    result JSON;
BEGIN
    -- الحصول على تاريخ آخر استلام ورصيد الحالي
    SELECT last_daily_reward_at, balance INTO last_claim, current_balance
    FROM profiles
    WHERE id = user_id;

    -- التحقق مما إذا كان قد مر يوم كامل (أو يوم تقويمي جديد)
    -- هنا نستخدم التحقق من اليوم التقويمي لتبسيط الأمر للمستخدم
    IF last_claim IS NOT NULL AND last_claim::date >= CURRENT_DATE THEN
        RETURN json_build_object(
            'success', false,
            'message', 'لقد استلمت مكافأتك اليوم بالفعل',
            'next_available', (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ
        );
    END IF;

    -- تحديث الرصيد وتاريخ الاستلام
    UPDATE profiles
    SET balance = balance + reward_amount,
        last_daily_reward_at = NOW()
    WHERE id = user_id;

    RETURN json_build_object(
        'success', true,
        'message', 'تم استلام المكافأة بنجاح',
        'new_balance', current_balance + reward_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
