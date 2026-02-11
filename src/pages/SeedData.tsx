import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const seedConstituencyData = async () => {
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      addLog('🚀 Starting comprehensive data seeding...');
      addLog('This will populate ALL database tables with sample data');
      addLog('');

      // Sample constituency data for 5 major Kolkata constituencies
      const constituenciesData = [
        {
          constituency_id: 'wb_kolkata_beleghata',
          constituency_name: 'Beleghata',
          district: 'Kolkata',
          total_voters: 178234,
          voter_turnout: 79.9,
          sentiment_score: 52.3,
          created_at: new Date().toISOString(),
        },
        {
          constituency_id: 'wb_kolkata_jadavpur',
          constituency_name: 'Jadavpur',
          district: 'Kolkata',
          total_voters: 165432,
          voter_turnout: 76.5,
          sentiment_score: 48.7,
          created_at: new Date().toISOString(),
        },
        {
          constituency_id: 'wb_kolkata_bhowanipore',
          constituency_name: 'Bhowanipore',
          district: 'Kolkata',
          total_voters: 165432,
          voter_turnout: 71.6,
          sentiment_score: 45.2,
          created_at: new Date().toISOString(),
        },
        {
          constituency_id: 'wb_kolkata_ballygunge',
          constituency_name: 'Ballygunge',
          district: 'Kolkata',
          total_voters: 172456,
          voter_turnout: 74.8,
          sentiment_score: 51.5,
          created_at: new Date().toISOString(),
        },
        {
          constituency_id: 'wb_kolkata_entally',
          constituency_name: 'Entally',
          district: 'Kolkata',
          total_voters: 156789,
          voter_turnout: 80.3,
          sentiment_score: 54.2,
          created_at: new Date().toISOString(),
        },
      ];

      addLog('📊 Creating 5 constituency records...');

      const { error: constError } = await supabase
        .from('constituencies')
        .upsert(constituenciesData);

      if (constError) {
        addLog(`⚠️ Constituencies: ${constError.message} (may already exist)`);
      } else {
        addLog('✅ 5 Constituency records created');
      }

      // Create sample sentiment data
      addLog('📈 Creating sentiment data...');

      const sentimentData = [];
      const now = new Date();

      const constituencies = ['wb_kolkata_beleghata', 'wb_kolkata_jadavpur', 'wb_kolkata_bhowanipore', 'wb_kolkata_ballygunge', 'wb_kolkata_entally'];

      for (const constId of constituencies) {
        for (let i = 0; i < 30; i++) {
          const daysAgo = Math.floor(i / 1);
          const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

          sentimentData.push({
            constituency_id: constId,
            sentiment_score: 45 + Math.random() * 20,
            positive_count: Math.floor(Math.random() * 1000) + 500,
            negative_count: Math.floor(Math.random() * 500) + 100,
            neutral_count: Math.floor(Math.random() * 700) + 300,
            total_mentions: Math.floor(Math.random() * 2000) + 1000,
            source: ['social_media', 'field_report', 'survey'][Math.floor(Math.random() * 3)],
            timestamp: timestamp.toISOString(),
            created_at: timestamp.toISOString(),
          });
        }
      }

      const { error: sentError } = await supabase
        .from('sentiment_data')
        .upsert(sentimentData);

      if (sentError) {
        addLog(`⚠️ Sentiment data: ${sentError.message}`);
      } else {
        addLog(`✅ Sentiment data created (${sentimentData.length} records for 5 constituencies)`);
      }

      // Create demographic data
      addLog('👥 Creating demographic data...');

      const demographics = [];
      for (const constId of constituencies) {
        demographics.push(
          {
            constituency_id: constId,
            demographic_type: 'age_group',
            demographic_value: 'Youth (18-35)',
            voter_count: 48000 + Math.floor(Math.random() * 8000),
            sentiment_score: 50 + Math.random() * 10,
            support_level: 'moderate',
          },
          {
            constituency_id: constId,
            demographic_type: 'age_group',
            demographic_value: 'Middle (36-55)',
            voter_count: 72000 + Math.floor(Math.random() * 10000),
            sentiment_score: 45 + Math.random() * 10,
            support_level: 'weak',
          },
          {
            constituency_id: constId,
            demographic_type: 'age_group',
            demographic_value: 'Senior (55+)',
            voter_count: 44000 + Math.floor(Math.random() * 8000),
            sentiment_score: 48 + Math.random() * 10,
            support_level: 'moderate',
          },
          {
            constituency_id: constId,
            demographic_type: 'gender',
            demographic_value: 'Male',
            voter_count: 88000 + Math.floor(Math.random() * 8000),
            sentiment_score: 47 + Math.random() * 10,
            support_level: 'moderate',
          },
          {
            constituency_id: constId,
            demographic_type: 'gender',
            demographic_value: 'Female',
            voter_count: 82000 + Math.floor(Math.random() * 8000),
            sentiment_score: 49 + Math.random() * 10,
            support_level: 'moderate',
          }
        );
      }

      const { error: demoError } = await supabase
        .from('demographic_sentiment')
        .upsert(demographics);

      if (demoError) {
        addLog(`⚠️ Demographics: ${demoError.message}`);
      } else {
        addLog(`✅ Demographic data created (${demographics.length} segments for 5 constituencies)`);
      }

      // Create issue data
      addLog('📋 Creating issue priority data...');

      const issues = [
        { name: 'Infrastructure', priority: 85, sentiment: 45 },
        { name: 'Healthcare', priority: 78, sentiment: 52 },
        { name: 'Jobs & Economy', priority: 92, sentiment: 48 },
        { name: 'Education', priority: 72, sentiment: 58 },
        { name: 'Law & Order', priority: 68, sentiment: 55 },
      ];

      const issueData = [];
      for (const constId of constituencies) {
        for (const issue of issues) {
          issueData.push({
            constituency_id: constId,
            issue_name: issue.name,
            priority_score: issue.priority + Math.floor(Math.random() * 10 - 5),
            sentiment_score: issue.sentiment + Math.floor(Math.random() * 10 - 5),
            mention_count: Math.floor(Math.random() * 500) + 200,
            created_at: new Date().toISOString(),
          });
        }
      }

      const { error: issueError } = await supabase
        .from('issue_sentiment')
        .upsert(issueData);

      if (issueError) {
        addLog(`⚠️ Issues: ${issueError.message}`);
      } else {
        addLog(`✅ Issue data created (${issueData.length} issues for 5 constituencies)`);
      }

      // Create sample voters for voter database
      addLog('👥 Creating sample voters...');

      const voterData = [];
      const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];
      const castes = ['General', 'OBC', 'SC', 'ST'];
      const sentiments = ['strong_supporter', 'supporter', 'neutral'];

      for (let i = 1; i <= 50; i++) {
        voterData.push({
          constituency_id: 'wb_kolkata_beleghata',
          voter_id: `BLG${String(i).padStart(5, '0')}`,
          first_name: `Voter${i}`,
          last_name: 'Sample',
          age: 25 + Math.floor(Math.random() * 50),
          gender: i % 2 === 0 ? 'Male' : 'Female',
          ward: wards[i % wards.length],
          booth_number: `B${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
          caste: castes[i % castes.length],
          phone: `98${String(10000000 + i).substring(0, 8)}`,
          sentiment: sentiments[i % sentiments.length],
          is_active: true,
          interaction_count: Math.floor(Math.random() * 5),
          created_at: new Date().toISOString(),
        });
      }

      const { error: voterError } = await supabase
        .from('voters')
        .upsert(voterData);

      if (voterError) {
        addLog(`⚠️ Voters: ${voterError.message}`);
      } else {
        addLog('✅ Sample voters created (50 voters)');
      }

      // Create social media posts
      addLog('📱 Creating social media posts...');

      const socialPosts = [
        {
          platform: 'facebook',
          post_content: 'Great initiative by @BJPBengal for youth employment in Beleghata! 🎯',
          posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 1250,
          shares: 320,
          comments_count: 89,
          reach: 15600,
          sentiment_score: 0.78,
          hashtags: ['BJPBengal', 'YouthEmployment'],
          mentions: ['BJPBengal'],
        },
        {
          platform: 'twitter',
          post_content: 'Attended BJP town hall in Beleghata. Strong focus on infrastructure. #BJPBengal',
          posted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: 850,
          shares: 210,
          comments_count: 45,
          reach: 8900,
          sentiment_score: 0.65,
          hashtags: ['BJPBengal', 'Infrastructure'],
          mentions: ['BJPBengal'],
        },
      ];

      const { error: socialError } = await supabase
        .from('social_media_posts')
        .upsert(socialPosts);

      if (socialError) {
        addLog(`⚠️ Social Media: ${socialError.message}`);
      } else {
        addLog('✅ Social media posts created (2 posts)');
      }

      // Create news articles
      addLog('📰 Creating news articles...');

      const newsArticles = [
        {
          title: 'BJP announces development projects for Beleghata constituency',
          content: 'In a major announcement, BJP West Bengal unit has unveiled a comprehensive development plan for Beleghata constituency focusing on infrastructure and employment.',
          source: 'The Telegraph',
          constituency_id: 'wb_kolkata_beleghata',
          district: 'Kolkata',
          published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          sentiment_score: 0.72,
          political_relevance: 0.85,
          is_breaking: false,
          is_verified: true,
        },
        {
          title: 'Local residents meet BJP leaders to discuss civic issues',
          content: 'Residents of Beleghata constituency held discussions with BJP representatives on water supply and road maintenance concerns.',
          source: 'Anandabazar Patrika',
          constituency_id: 'wb_kolkata_beleghata',
          district: 'Kolkata',
          published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          sentiment_score: 0.58,
          political_relevance: 0.65,
          is_breaking: false,
          is_verified: true,
        },
      ];

      const { error: newsError } = await supabase
        .from('news_articles')
        .upsert(newsArticles);

      if (newsError) {
        addLog(`⚠️ News Articles: ${newsError.message}`);
      } else {
        addLog('✅ News articles created (2 articles)');
      }

      addLog('');
      addLog('🎉 COMPREHENSIVE DATA SEEDING COMPLETED!');
      addLog('');
      addLog('✅ Successfully created data for 5 Kolkata constituencies:');
      addLog('   • Beleghata');
      addLog('   • Jadavpur');
      addLog('   • Bhowanipore');
      addLog('   • Ballygunge');
      addLog('   • Entally');
      addLog('');
      addLog('📊 Data created:');
      addLog(`   • ${sentimentData.length} Sentiment data points`);
      addLog(`   • ${demographics.length} Demographic segments`);
      addLog(`   • ${issueData.length} Issue priorities`);
      addLog('   • 50 Sample voters');
      addLog('   • 2 Social media posts');
      addLog('   • 2 News articles');
      addLog('');
      addLog('📍 Next Steps:');
      addLog('1. Go to Constituency Insights Dashboard');
      addLog('2. Select ANY Kolkata constituency from dropdown');
      addLog('3. Explore sentiment, demographics, and issues');
      addLog('4. Go to Voter Database to see voters');
      addLog('5. Go to Social Media Channels to see posts');
      addLog('');
      addLog('🔄 Need to reseed? Just click the button again!');

    } catch (err: any) {
      setError(err.message);
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Seed Database with Demo Data
            </h1>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Purpose:</strong> This page seeds your Supabase database with sample constituency data
                  so you can demo the application features.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>What it creates:</strong>
                  <br />
                  • Constituency record (Beleghata - Kolkata)
                  <br />
                  • 30 days of sentiment data
                  <br />
                  • Demographic breakdowns (Age, Gender)
                  <br />
                  • Top 5 issues with priorities
                  <br />
                  • 50 sample voters for Voter Database
                  <br />
                  • 2 social media posts
                  <br />
                  • 2 news articles
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={seedConstituencyData}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold rounded-lg transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="w-6 h-6" />
                Seed Database Now
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Error occurred:</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 bg-gray-900 rounded-lg p-6 text-white font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Seeding Log:</span>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {results.map((log, idx) => (
                  <div key={idx} className="opacity-90 hover:opacity-100">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">After Seeding:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Navigate to <strong>Dashboard → Constituency Insights Dashboard</strong></li>
              <li>Select <strong>"Beleghata - Kolkata"</strong> from the dropdown</li>
              <li>Explore the charts, metrics, and demographic segments</li>
              <li>Switch between time ranges (24H, 7D, 30D, 4Y, 8Y)</li>
              <li>Click on different voter segments (Youth, Women, etc.)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
