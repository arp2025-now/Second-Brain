-- Disable the trigger that causes the error
-- The app will handle profile creation instead
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
