-- إضافة عمود is_active لجدول الكروت للتمييز بين الكروت الحالية والقديمة
ALTER TABLE shop_tickets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- تحديث الكروت القديمة (اختياري، نفترض أن كل الكروت الحالية نشطة)
UPDATE shop_tickets SET is_active = TRUE WHERE is_active IS NULL;

-- تحديث سياسات RLS إذا لزم الأمر (عادة لا نحتاج إذا كانت السياسات تعتمد على owner_id)

-- تمكين التحديثات الفورية (Realtime) لجدول الكروت
-- ملاحظة: قد تحتاج لتفعيل هذا من لوحة تحكم Supabase أيضاً
ALTER PUBLICATION supabase_realtime ADD TABLE shop_tickets;
