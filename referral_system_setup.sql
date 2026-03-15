-- 1. Add referral columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- 2. Function to generate a unique 6-digit referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOL := FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := floor(random() * 900000 + 100000)::TEXT;
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to assign referral code to new profiles and reward referrer
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign a unique referral code if not already set
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    
    -- If referred_by is set, reward the referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Add 1 SYP to the referrer's balance
        UPDATE profiles 
        SET balance = balance + 1 
        WHERE id = NEW.referred_by;
        
        -- Add a notification for the referrer
        INSERT INTO notifications (user_id, text, type)
        VALUES (
            NEW.referred_by, 
            'مبروك! لقد حصلت على 1 ليرة سورية مكافأة لدعوة مستخدم جديد', 
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger on profiles
DROP TRIGGER IF EXISTS tr_handle_new_user_referral ON profiles;
CREATE TRIGGER tr_handle_new_user_referral
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_referral();

-- 5. Ensure the profile creation trigger handles referred_by from metadata
-- This is a common pattern. We update the existing function if it exists.
-- If you have a different function name, you might need to adjust this.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, age, sham_cash_address, email, referred_by)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    (NEW.raw_user_meta_data->>'age')::int,
    NEW.raw_user_meta_data->>'sham_cash_address',
    NEW.raw_user_meta_data->>'email',
    (NEW.raw_user_meta_data->>'referred_by')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Backfill referral codes for existing users
UPDATE profiles SET referral_code = generate_referral_code() WHERE referral_code IS NULL;
