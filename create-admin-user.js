// Script to create admin user using Supabase Admin API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg0MDc4NCwiZXhwIjoyMDc4NDE2Nzg0fQ.bPLDbHaKvgZxgWAtViJLOrPFSyS5PkbKjK2csCkyPSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('Creating admin user...');

  // Create user using Admin API
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@test.com',
    password: 'Test@123456',
    email_confirm: true,
    user_metadata: {
      full_name: 'Test Administrator'
    }
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('✅ User created successfully:', data.user.email);
  console.log('User ID:', data.user.id);

  // Now link to users table
  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ auth_user_id: data.user.id })
    .eq('email', 'admin@test.com')
    .select();

  if (updateError) {
    console.error('Error linking user:', updateError);
  } else {
    console.log('✅ User linked to users table');
    console.log(updateData);
  }

  console.log('\n✅ Done! You can now login with:');
  console.log('Email: admin@test.com');
  console.log('Password: Test@123456');
}

createAdminUser();
