-- Add offset parameter to get_rss_feed function for pagination

-- Drop existing function and grants
DROP FUNCTION IF EXISTS get_rss_feed(uuid, int);

-- Recreate function with offset parameter
CREATE OR REPLACE FUNCTION get_rss_feed(
  p_subscription_id uuid,
  p_limit int DEFAULT 1000,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id bigint,
  created_at timestamp with time zone,
  guid text,
  url text,
  content text,
  title text,
  parent text,
  tagged_at timestamp with time zone,
  subscription_id uuid
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    n.id,
    n.created_at,
    n.guid,
    n.url,
    n.content,
    n.title,
    n.parent,
    n.tagged_at,
    s.id AS subscription_id
  FROM subscriptions s
  JOIN subscriptions_tags st ON st.subscription_id = s.id
  JOIN news_tags nt ON nt.tag_id = st.tag_id
  JOIN news n ON n.id = nt.news_id
  WHERE s.id = p_subscription_id
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_rss_feed(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rss_feed(uuid, int, int) TO anon;
GRANT EXECUTE ON FUNCTION get_rss_feed(uuid, int, int) TO service_role;
