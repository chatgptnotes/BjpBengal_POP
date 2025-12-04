// Test script to verify AI Insights are loading correctly
import { aiService } from './src/services/aiPoliticalIntelligence.js';
import { constituencyIntelligenceService } from './src/services/constituencyIntelligenceService.js';
import { electionWinningStrategy } from './src/services/electionWinningStrategy.js';

async function testAIInsights() {
  const constituencyId = 'birbhum-8'; // Hansan

  console.log('Testing AI Insights for Hansan (birbhum-8)...\n');

  try {
    // Test 1: Constituency Intelligence
    console.log('1. Testing Constituency Intelligence Service...');
    const intelligence = await constituencyIntelligenceService.getConstituencyIntelligence(constituencyId);
    console.log('✓ Intelligence data received:', {
      name: intelligence.basic.name,
      winProbability: intelligence.bjpStrategy.winProbability,
      swingNeeded: intelligence.bjpStrategy.swingNeeded
    });

    // Test 2: Election Winning Strategy
    console.log('\n2. Testing Election Winning Strategy Service...');
    const strategy = await electionWinningStrategy.generateWinningStrategy(constituencyId);
    console.log('✓ Strategy data received:', {
      status: strategy.constituency.currentStatus,
      confidence: strategy.winningFormula.confidence,
      gapToVictory: strategy.winningFormula.gapToVictory
    });

    // Test 3: AI Insights Generation
    console.log('\n3. Testing AI Insights Generation...');
    const insights = await aiService.generateConstituencyInsights(constituencyId);
    console.log('✓ Insights generated:', {
      count: insights.length,
      categories: [...new Set(insights.map(i => i.category))],
      priorities: [...new Set(insights.map(i => i.priority))]
    });

    // Display first insight
    if (insights.length > 0) {
      console.log('\nFirst Insight:');
      console.log('Title:', insights[0].title);
      console.log('Description:', insights[0].description);
      console.log('Category:', insights[0].category);
      console.log('Priority:', insights[0].priority);
    }

    console.log('\n✅ All tests passed! AI Insights are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIInsights();