import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getData() {
  console.log('Fetching Bhowanipore data from database...\n');

  // Get leader data
  const { data: leader } = await supabase
    .from('constituency_leaders')
    .select('*')
    .eq('constituency_id', 'wb_kolkata_bhowanipore')
    .single();

  console.log('LEADER DATA:');
  if (leader) {
    console.log('  Current MLA:', leader.current_mla_name, '(' + leader.current_mla_party + ')');
    console.log('  Runner-up:', leader.runner_up_name, '(' + leader.runner_up_party + ')');
    console.log('  2021 Votes - Winner:', leader.current_mla_votes_2021, ', Runner-up:', leader.runner_up_votes_2021);
  } else {
    console.log('  No leader data found');
  }

  // Get issues
  const { data: issues } = await supabase
    .from('constituency_issues')
    .select('*')
    .eq('constituency_id', 'wb_kolkata_bhowanipore');

  console.log('\nISSUES DATA:');
  if (issues && issues.length > 0) {
    issues.forEach((issue, i) => {
      console.log('  ' + (i + 1) + '. ' + issue.issue_title + ' (' + issue.severity + ')');
    });
  } else {
    console.log('  No issues found');
  }

  // Get events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .ilike('location', '%bhowanipore%')
    .limit(5);

  console.log('\nEVENTS DATA:');
  if (events && events.length > 0) {
    events.forEach((event, i) => {
      console.log('  ' + (i + 1) + '. ' + event.event_name);
    });
  } else {
    console.log('  No events found');
  }
}

getData();
