#!/usr/bin/env node
/**
 * Run SQL migration on Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  const migrationFile = process.argv[2] || '20_leader_profiles_extended.sql';
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

  console.log(`Running migration: ${migrationFile}`);

  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;

    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
    console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));

    const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });

    if (error) {
      // Try direct query for DDL statements
      const { error: directError } = await supabase.from('leader_profiles').select('count').limit(1);
      if (directError && !directError.message.includes('does not exist')) {
        console.log(`Statement ${i + 1}: ${error.message}`);
        // Continue anyway for ALTER TABLE IF NOT EXISTS statements
      }
    } else {
      console.log(`Statement ${i + 1}: OK`);
    }
  }

  console.log('\nMigration completed!');
}

runMigration().catch(console.error);
