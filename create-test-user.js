#!/usr/bin/env node

/**
 * Create Test Superadmin User for BJP West Bengal
 *
 * This script creates the admin@bjp.com user in Supabase Auth
 * and sets up the corresponding user_profile
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestSuperadmin() {
  console.log('🚀 Creating test superadmin user...\n');

  const testEmail = 'admin@bjp.com';
  const testPassword = 'Admin@123';
  const testName = 'BJP West Bengal Super Admin';

  try {
    // Step 1: Create auth user
    console.log('📝 Step 1: Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: testName
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists in auth, continuing to profile setup...');

        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === testEmail);
        if (!existingUser) throw new Error('User exists but could not be found');

        authData.user = existingUser;
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created:', authData.user.email);
    }

    const userId = authData.user.id;

    // Step 2: Check if organization exists
    console.log('\n📝 Step 2: Checking organization...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'bjp-wb')
      .single();

    let organizationId;
    if (orgError || !orgData) {
      console.log('⚠️  Organization not found, creating it...');
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Bharatiya Janata Party - West Bengal',
          slug: 'bjp-wb',
          type: 'party',
          contact_email: 'admin@bjp.com',
          phone: '+91-33-22801000',
          address: 'BJP State Office, Kolkata, West Bengal',
          state: 'West Bengal',
          status: 'active',
          subscription_plan: 'premium',
          is_active: true
        }])
        .select()
        .single();

      if (createOrgError) throw createOrgError;
      organizationId = newOrg.id;
      console.log('✅ Organization created');
    } else {
      organizationId = orgData.id;
      console.log('✅ Organization found');
    }

    // Step 3: Create or update user profile
    console.log('\n📝 Step 3: Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert([{
        id: userId,
        email: testEmail,
        full_name: testName,
        role: 'superadmin',
        status: 'active',
        is_super_admin: true,
        organization_id: organizationId,
        permissions: ['*'],
        phone: '+91-9999999999',
        designation: 'State Coordinator',
        state: 'West Bengal',
        district: 'Kolkata',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'id'
      })
      .select();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      throw profileError;
    }

    console.log('✅ User profile created');

    // Step 4: Verify setup
    console.log('\n📝 Step 4: Verifying setup...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (verifyError) throw verifyError;

    console.log('\n✅ SUCCESS! Test superadmin created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:        ${testEmail}`);
    console.log(`🔑 Password:     ${testPassword}`);
    console.log(`👤 Name:         ${verifyData.full_name}`);
    console.log(`🎭 Role:         ${verifyData.role}`);
    console.log(`⭐ Super Admin:  ${verifyData.is_super_admin}`);
    console.log(`🏢 Organization: ${organizationId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login at: http://localhost:5174/login');
    console.log('✨ Or click "Quick Login as Superadmin" button\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

createTestSuperadmin();
