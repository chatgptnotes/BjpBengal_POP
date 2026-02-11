import { useState } from 'react';
import { Database, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function DatabaseSetup() {
  const [copied, setCopied] = useState(false);

  const minimalSchema = `-- Minimal schema for Pulse of People Demo
-- Run this in Supabase SQL Editor

-- 1. Constituencies table
CREATE TABLE IF NOT EXISTS constituencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT UNIQUE NOT NULL,
  constituency_name TEXT NOT NULL,
  district TEXT,
  total_voters INTEGER,
  voter_turnout DECIMAL,
  sentiment_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sentiment data table
CREATE TABLE IF NOT EXISTS sentiment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT NOT NULL,
  sentiment_score DECIMAL,
  positive_count INTEGER,
  negative_count INTEGER,
  neutral_count INTEGER,
  total_mentions INTEGER,
  source TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Demographic sentiment table
CREATE TABLE IF NOT EXISTS demographic_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT NOT NULL,
  demographic_type TEXT NOT NULL,
  demographic_value TEXT NOT NULL,
  voter_count INTEGER,
  sentiment_score DECIMAL,
  support_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Issue sentiment table
CREATE TABLE IF NOT EXISTS issue_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT NOT NULL,
  issue_name TEXT NOT NULL,
  priority_score INTEGER,
  sentiment_score DECIMAL,
  mention_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Voters table
CREATE TABLE IF NOT EXISTS voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constituency_id TEXT,
  voter_id TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  gender TEXT,
  ward TEXT,
  booth_number TEXT,
  caste TEXT,
  phone TEXT,
  sentiment TEXT,
  is_active BOOLEAN DEFAULT true,
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  post_content TEXT,
  posted_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  sentiment_score DECIMAL,
  hashtags TEXT[],
  mentions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  constituency_id TEXT,
  district TEXT,
  published_at TIMESTAMPTZ,
  sentiment_score DECIMAL,
  political_relevance DECIMAL,
  is_breaking BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sentiment_constituency ON sentiment_data(constituency_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_timestamp ON sentiment_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_demographic_constituency ON demographic_sentiment(constituency_id);
CREATE INDEX IF NOT EXISTS idx_issue_constituency ON issue_sentiment(constituency_id);
CREATE INDEX IF NOT EXISTS idx_voters_constituency ON voters(constituency_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_news_constituency ON news_articles(constituency_id);

-- Enable RLS (but allow all for demo)
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo (allows all operations)
CREATE POLICY "Allow all on constituencies" ON constituencies FOR ALL USING (true);
CREATE POLICY "Allow all on sentiment_data" ON sentiment_data FOR ALL USING (true);
CREATE POLICY "Allow all on demographic_sentiment" ON demographic_sentiment FOR ALL USING (true);
CREATE POLICY "Allow all on issue_sentiment" ON issue_sentiment FOR ALL USING (true);
CREATE POLICY "Allow all on voters" ON voters FOR ALL USING (true);
CREATE POLICY "Allow all on social_media_posts" ON social_media_posts FOR ALL USING (true);
CREATE POLICY "Allow all on news_articles" ON news_articles FOR ALL USING (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(minimalSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Database Setup Required
            </h1>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  <strong>Your Supabase database needs to be set up with tables before you can seed data.</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Follow the steps below to create all necessary database tables (takes 2 minutes).
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-8">

            {/* Step 1 */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Step 1: Copy the SQL Schema
              </h2>
              <p className="text-gray-700 mb-4">
                Click the button below to copy the database schema to your clipboard.
              </p>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy SQL Schema
                  </>
                )}
              </button>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Step 2: Open Supabase SQL Editor
              </h2>
              <p className="text-gray-700 mb-4">
                Go to your Supabase project and open the SQL Editor.
              </p>
              <a
                href="https://supabase.com/dashboard/project/iwtgbseaoztjbnvworyq/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Open Supabase SQL Editor
              </a>
              <p className="text-sm text-gray-600 mt-2">
                Direct link to your project SQL Editor →
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Step 3: Paste and Run the SQL
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
                <li>Click "New Query" in the SQL Editor</li>
                <li>Paste the copied SQL schema (Cmd+V or Ctrl+V)</li>
                <li>Click "Run" or press Cmd+Enter</li>
                <li>Wait 5-10 seconds for completion</li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ You should see "Success. No rows returned" message
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Step 4: Seed the Database with Data
              </h2>
              <p className="text-gray-700 mb-4">
                After tables are created, seed them with demo data.
              </p>
              <a
                href="/seed-data"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-5 h-5" />
                Go to Seed Data Page
              </a>
            </div>

          </div>

          {/* SQL Preview */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">SQL Schema Preview:</h2>
            <div className="bg-gray-900 rounded-lg p-6 text-white font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
              <pre>{minimalSchema}</pre>
            </div>
          </div>

          {/* What gets created */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What Gets Created:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">7 Database Tables</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• constituencies</li>
                  <li>• sentiment_data</li>
                  <li>• demographic_sentiment</li>
                  <li>• issue_sentiment</li>
                  <li>• voters</li>
                  <li>• social_media_posts</li>
                  <li>• news_articles</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Additional Features</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 7 performance indexes</li>
                  <li>• Row-level security enabled</li>
                  <li>• Permissive policies for demo</li>
                  <li>• UUID primary keys</li>
                  <li>• Timestamp tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Troubleshooting:</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900">Error: "relation already exists"</p>
                <p className="text-sm text-gray-700 mt-1">
                  This is normal if tables already exist. The script uses IF NOT EXISTS to avoid errors.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900">Error: "permission denied"</p>
                <p className="text-sm text-gray-700 mt-1">
                  Make sure you're logged in as the project owner or have admin privileges.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900">Can't find SQL Editor?</p>
                <p className="text-sm text-gray-700 mt-1">
                  In Supabase dashboard: Click "SQL Editor" in left sidebar, then "New Query".
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
