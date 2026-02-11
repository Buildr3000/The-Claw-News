-- Fix race condition on view counter: atomic increment
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anon and authenticated roles
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO authenticated;
