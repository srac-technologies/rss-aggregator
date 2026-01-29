-- Curation System Schema
-- Magazines, Curated Articles, and Curation Agent Settings

-- 1. Magazines (マガジン) - Collections of curated articles
CREATE TABLE IF NOT EXISTS magazines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cover_image_url text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Curation Agent Settings (キュレーションエージェント設定)
CREATE TABLE IF NOT EXISTS curation_agent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  magazine_id uuid NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  
  -- LLM settings
  llm_provider text DEFAULT 'anthropic',
  llm_model text DEFAULT 'claude-3-5-haiku-20241022',
  
  -- Selection criteria prompt - used to decide accept/reject articles
  selection_prompt text NOT NULL,
  
  -- Curation prompt - used to summarize/explain accepted articles
  curation_prompt text NOT NULL,
  
  -- Scheduling
  run_frequency text DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Curated Articles (キュレーション記事)
CREATE TABLE IF NOT EXISTS curated_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  magazine_id uuid NOT NULL REFERENCES magazines(id) ON DELETE CASCADE,
  agent_setting_id uuid REFERENCES curation_agent_settings(id) ON DELETE SET NULL,
  
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  
  -- Status
  status text DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at timestamp with time zone,
  
  -- Metadata
  llm_tokens_used integer,
  processing_duration_ms integer,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Curated Article Sources (N:N relationship between curated articles and source news)
CREATE TABLE IF NOT EXISTS curated_article_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curated_article_id uuid NOT NULL REFERENCES curated_articles(id) ON DELETE CASCADE,
  news_id bigint NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  
  -- Selection metadata
  relevance_score float,
  selection_reason text,
  
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(curated_article_id, news_id)
);

-- 5. Curation Runs (実行履歴)
CREATE TABLE IF NOT EXISTS curation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_setting_id uuid NOT NULL REFERENCES curation_agent_settings(id) ON DELETE CASCADE,
  
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  
  status text DEFAULT 'running', -- 'running', 'completed', 'failed'
  
  -- Stats
  articles_evaluated integer DEFAULT 0,
  articles_accepted integer DEFAULT 0,
  articles_rejected integer DEFAULT 0,
  curated_article_id uuid REFERENCES curated_articles(id) ON DELETE SET NULL,
  
  -- LLM usage
  llm_tokens_used integer DEFAULT 0,
  
  -- Error info
  error_message text,
  error_stack text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_magazines_slug ON magazines(slug);
CREATE INDEX idx_curated_articles_magazine_id ON curated_articles(magazine_id);
CREATE INDEX idx_curated_articles_status ON curated_articles(status);
CREATE INDEX idx_curated_article_sources_curated_article_id ON curated_article_sources(curated_article_id);
CREATE INDEX idx_curated_article_sources_news_id ON curated_article_sources(news_id);
CREATE INDEX idx_curation_agent_settings_magazine_id ON curation_agent_settings(magazine_id);
CREATE INDEX idx_curation_agent_settings_subscription_id ON curation_agent_settings(subscription_id);
CREATE INDEX idx_curation_runs_agent_setting_id ON curation_runs(agent_setting_id);

-- Function to get curated articles with their sources
CREATE OR REPLACE FUNCTION get_curated_article_with_sources(p_curated_article_id uuid)
RETURNS TABLE (
  id uuid,
  magazine_id uuid,
  title text,
  content text,
  summary text,
  status text,
  published_at timestamp with time zone,
  created_at timestamp with time zone,
  source_news_ids bigint[],
  source_news_titles text[]
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.magazine_id,
    ca.title,
    ca.content,
    ca.summary,
    ca.status,
    ca.published_at,
    ca.created_at,
    array_agg(n.id) as source_news_ids,
    array_agg(n.title) as source_news_titles
  FROM curated_articles ca
  LEFT JOIN curated_article_sources cas ON cas.curated_article_id = ca.id
  LEFT JOIN news n ON n.id = cas.news_id
  WHERE ca.id = p_curated_article_id
  GROUP BY ca.id, ca.magazine_id, ca.title, ca.content, ca.summary, ca.status, ca.published_at, ca.created_at;
END;
$$;

-- Function to get magazine articles
CREATE OR REPLACE FUNCTION get_magazine_articles(
  p_magazine_id uuid,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0,
  p_status text DEFAULT 'published'
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  status text,
  published_at timestamp with time zone,
  created_at timestamp with time zone,
  source_count bigint
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.title,
    ca.summary,
    ca.status,
    ca.published_at,
    ca.created_at,
    count(cas.id) as source_count
  FROM curated_articles ca
  LEFT JOIN curated_article_sources cas ON cas.curated_article_id = ca.id
  WHERE ca.magazine_id = p_magazine_id
    AND (p_status IS NULL OR ca.status = p_status)
  GROUP BY ca.id, ca.title, ca.summary, ca.status, ca.published_at, ca.created_at
  ORDER BY ca.published_at DESC NULLS LAST, ca.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grants
GRANT ALL ON magazines TO authenticated;
GRANT ALL ON magazines TO service_role;
GRANT ALL ON curation_agent_settings TO authenticated;
GRANT ALL ON curation_agent_settings TO service_role;
GRANT ALL ON curated_articles TO authenticated;
GRANT ALL ON curated_articles TO service_role;
GRANT ALL ON curated_article_sources TO authenticated;
GRANT ALL ON curated_article_sources TO service_role;
GRANT ALL ON curation_runs TO authenticated;
GRANT ALL ON curation_runs TO service_role;
GRANT EXECUTE ON FUNCTION get_curated_article_with_sources(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_curated_article_with_sources(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION get_magazine_articles(uuid, int, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_magazine_articles(uuid, int, int, text) TO service_role;
