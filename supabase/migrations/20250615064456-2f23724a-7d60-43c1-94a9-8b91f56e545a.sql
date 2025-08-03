
-- Update user_profiles table so display_name is required, and represents Full Name
ALTER TABLE public.user_profiles
ALTER COLUMN display_name SET NOT NULL;

-- Update trigger function to set display_name from sign up metadata full name, fallback to email before '@'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  RETURN new;
END;
$function$;
