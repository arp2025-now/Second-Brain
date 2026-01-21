-- =============================================
-- Second Brain - Schema Update (for existing tables)
-- Run this if you get "relation already exists" errors
-- =============================================

-- Drop existing triggers first (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_items_updated_at ON items;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_default_categories();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS search_items(TEXT, UUID);

-- =============================================
-- RECREATE FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default system categories
  INSERT INTO categories (user_id, name, icon, color, is_system, order_index) VALUES
    (NEW.id, 'Inbox', 'inbox', '#6366f1', TRUE, 0),
    (NEW.id, 'Notes', 'sticky-note', '#10b981', TRUE, 1),
    (NEW.id, 'Gratitude', 'heart', '#f43f5e', TRUE, 2),
    (NEW.id, 'Archive', 'archive', '#64748b', TRUE, 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default categories when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- FULL-TEXT SEARCH FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION search_items(
  search_query TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  url TEXT,
  summary TEXT,
  item_type TEXT,
  status TEXT,
  category_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.content,
    i.url,
    i.summary,
    i.item_type,
    i.status,
    i.category_id,
    i.created_at,
    ts_rank(
      to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.content, '') || ' ' || coalesce(i.summary, '')),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM items i
  WHERE
    i.user_id = p_user_id
    AND to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.content, '') || ' ' || coalesce(i.summary, ''))
        @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
