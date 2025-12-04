-- Election Topic Mentions Table
-- Tracks topic-wise mentions and their impact on BJP/TMC

CREATE TABLE IF NOT EXISTS election_topic_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL, -- 'transcript' or 'news'
  source_id UUID,
  topic VARCHAR(50) NOT NULL, -- 'development', 'law_order', 'employment', 'corruption', 'minority'
  party VARCHAR(10) NOT NULL, -- 'BJP' or 'TMC'
  impact VARCHAR(10) NOT NULL, -- 'positive', 'negative', or 'neutral'
  score NUMERIC(4, 3) DEFAULT 0, -- -1 to 1
  keywords_matched TEXT[],
  text_snippet TEXT,
  channel_name VARCHAR(255),
  constituency VARCHAR(100), -- Constituency name for filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_election_topic_mentions_topic ON election_topic_mentions(topic);
CREATE INDEX IF NOT EXISTS idx_election_topic_mentions_party ON election_topic_mentions(party);
CREATE INDEX IF NOT EXISTS idx_election_topic_mentions_impact ON election_topic_mentions(impact);
CREATE INDEX IF NOT EXISTS idx_election_topic_mentions_created_at ON election_topic_mentions(created_at);
CREATE INDEX IF NOT EXISTS idx_election_topic_mentions_constituency ON election_topic_mentions(constituency);

-- Add topic detection columns to tv_transcripts table
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS topic_development BOOLEAN DEFAULT false;
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS topic_law_order BOOLEAN DEFAULT false;
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS topic_employment BOOLEAN DEFAULT false;
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS topic_corruption BOOLEAN DEFAULT false;
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS topic_minority BOOLEAN DEFAULT false;
-- Add constituency column for filtering by constituency
ALTER TABLE tv_transcripts ADD COLUMN IF NOT EXISTS constituency VARCHAR(100);
-- Index for constituency filtering
CREATE INDEX IF NOT EXISTS idx_tv_transcripts_constituency ON tv_transcripts(constituency);

-- Add topic detection columns to local_news table
ALTER TABLE local_news ADD COLUMN IF NOT EXISTS topic_development BOOLEAN DEFAULT false;
ALTER TABLE local_news ADD COLUMN IF NOT EXISTS topic_law_order BOOLEAN DEFAULT false;
ALTER TABLE local_news ADD COLUMN IF NOT EXISTS topic_employment BOOLEAN DEFAULT false;
ALTER TABLE local_news ADD COLUMN IF NOT EXISTS topic_corruption BOOLEAN DEFAULT false;
ALTER TABLE local_news ADD COLUMN IF NOT EXISTS topic_minority BOOLEAN DEFAULT false;

-- Create view for topic-wise stats
CREATE OR REPLACE VIEW election_topic_stats AS
SELECT
  topic,
  party,
  impact,
  COUNT(*) as mention_count,
  AVG(score) as avg_score,
  DATE(created_at) as mention_date
FROM election_topic_mentions
GROUP BY topic, party, impact, DATE(created_at)
ORDER BY mention_date DESC, topic, party;

-- Create view for party-wise seat impact estimation
CREATE OR REPLACE VIEW party_seat_impact AS
SELECT
  party,
  topic,
  SUM(CASE WHEN impact = 'positive' THEN 0.1 ELSE 0 END) +
  SUM(CASE WHEN impact = 'negative' THEN -0.15 ELSE 0 END) as seat_impact,
  COUNT(*) as total_mentions,
  SUM(CASE WHEN impact = 'positive' THEN 1 ELSE 0 END) as positive_count,
  SUM(CASE WHEN impact = 'negative' THEN 1 ELSE 0 END) as negative_count,
  SUM(CASE WHEN impact = 'neutral' THEN 1 ELSE 0 END) as neutral_count
FROM election_topic_mentions
GROUP BY party, topic
ORDER BY party, topic;

-- Enable RLS
ALTER TABLE election_topic_mentions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on election_topic_mentions"
ON election_topic_mentions FOR SELECT
USING (true);

-- Create policy for insert
CREATE POLICY "Allow insert on election_topic_mentions"
ON election_topic_mentions FOR INSERT
WITH CHECK (true);

COMMENT ON TABLE election_topic_mentions IS 'Tracks election topic mentions (Development, Law & Order, Jobs, Corruption, Minority) and their impact on BJP/TMC';
