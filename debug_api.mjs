import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://njlrsszxksbkclkveoyi.supabase.co';

async function main() {
  let url = SUPABASE_URL;
  let serviceKey = '';
  
  try {
    const paths = ['.env.local', '.env'];
    for (const envPath of paths) {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const matchUrl = envContent.match(/VITE_SUPABASE_URL\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (matchUrl && matchUrl[2]) url = matchUrl[2].trim();
        const matchKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (matchKey && matchKey[2]) {
          serviceKey = matchKey[2].trim();
          break;
        }
      }
    }
  } catch (err) {}

  if (!serviceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in env files.');
    return;
  }

  console.log('Connecting to Supabase:', url);
  const supabase = createClient(url, serviceKey);

  // 1. Get a test worker user
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'smartwipeai@gmail.com')
    .single();

  if (profErr || !profiles) {
    console.error('Error fetching test profile:', profErr);
    return;
  }

  console.log('Found test profile:', profiles);

  // 2. Temporarily set a password for this user so we can sign in
  const tempPassword = 'DebugPassword123!';
  const { data: userUpdate, error: updateErr } = await supabase.auth.admin.updateUserById(
    profiles.id,
    { password: tempPassword }
  );

  if (updateErr) {
    console.error('Error updating user password:', updateErr);
    return;
  }

  console.log('Successfully set temporary password for user.');

  // 3. Sign in as the user using the client anon key
  let anonKey = '';
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
    if (match && match[2]) anonKey = match[2].trim();
  } catch (err) {}

  if (!anonKey) {
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const match = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
      if (match && match[2]) anonKey = match[2].trim();
    } catch (err) {}
  }

  const clientSupabase = createClient(url, anonKey);
  const { data: authData, error: authErr } = await clientSupabase.auth.signInWithPassword({
    email: profiles.email,
    password: tempPassword
  });

  if (authErr || !authData.session) {
    console.error('Error signing in:', authErr);
    return;
  }

  const token = authData.session.access_token;
  console.log('Successfully signed in! Got JWT Access Token.');

  // 4. Call the live endpoint verify-bank
  console.log('Calling live API endpoint /api/verify-bank...');
  const response = await fetch('https://www.tasskly.com/api/verify-bank', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      bank_name: 'HDFC Bank',
      bank_account_number: '50100850887019',
      bank_ifsc_code: 'HDFC0011298'
    })
  });

  console.log('API Status Code:', response.status);
  const text = await response.text();
  console.log('API Response Body:', text);
}

main().catch(console.error);
