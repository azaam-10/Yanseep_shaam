-- 0. Enable necessary extensions and Real-time
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Real-time for profiles and notifications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, notifications;
COMMIT;

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    age INT,
    sham_cash_address TEXT,
    email TEXT,
    balance DECIMAL DEFAULT 0,
    is_frozen BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    last_daily_reward_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Update profiles table columns if they exist but are missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sham_cash_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_reward_at TIMESTAMPTZ;

-- 4. Functions
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOL := FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := floor(random() * 900000 + 100000)::TEXT;
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger for generating referral code BEFORE insert
CREATE OR REPLACE FUNCTION public.handle_before_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := floor(random() * 900000 + 100000)::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for referral rewards AFTER insert
CREATE OR REPLACE FUNCTION public.handle_after_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- منح المكافأة للداعي
    IF NEW.referred_by IS NOT NULL AND NEW.referred_by != NEW.id THEN
        -- تحديث الرصيد المتوفر للداعي (+1 ليرة)
        UPDATE public.profiles 
        SET balance = COALESCE(balance, 0) + 1 
        WHERE id = NEW.referred_by;
        
        -- إرسال إشعار فوري للداعي
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.referred_by, 
            'مكافأة إحالة جديدة 💰', 
            'تم إضافة 1 ليرة سورية إلى رصيدك المتوفر بنجاح لدعوة عضو جديد.', 
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users -> profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_id UUID;
  metadata_ref TEXT;
  user_age INT;
BEGIN
  metadata_ref := NEW.raw_user_meta_data->>'referred_by';
  
  -- محاولة تحويل المعرف بشكل آمن جداً
  IF metadata_ref IS NOT NULL AND metadata_ref ~ '^[0-9a-fA-F-]{36}$' THEN
    BEGIN
      ref_id := metadata_ref::UUID;
    EXCEPTION WHEN OTHERS THEN
      ref_id := NULL;
    END;
  ELSE
    ref_id := NULL;
  END IF;

  -- محاولة تحويل العمر بشكل آمن
  IF NEW.raw_user_meta_data->>'age' IS NOT NULL AND NEW.raw_user_meta_data->>'age' ~ '^[0-9]+$' THEN
    user_age := (NEW.raw_user_meta_data->>'age')::int;
  ELSE
    user_age := NULL;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, referred_by, balance, age, sham_cash_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email),
    ref_id,
    0,
    user_age,
    COALESCE(NEW.raw_user_meta_data->>'sham_cash_address', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    age = EXCLUDED.age,
    sham_cash_address = EXCLUDED.sham_cash_address,
    referred_by = COALESCE(profiles.referred_by, EXCLUDED.referred_by);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach triggers
DROP TRIGGER IF EXISTS tr_before_profile_insert ON public.profiles;
CREATE TRIGGER tr_before_profile_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_before_profile_insert();

DROP TRIGGER IF EXISTS tr_after_profile_insert ON public.profiles;
CREATE TRIGGER tr_after_profile_insert
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_after_profile_insert();

-- Remove old triggers
DROP TRIGGER IF EXISTS tr_handle_new_user_referral ON public.profiles;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill referral codes for existing users
UPDATE public.profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
