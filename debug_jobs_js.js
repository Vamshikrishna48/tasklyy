const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parse of .env
const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
  console.log('--- Checking Jobs ---');
  const { data: jobs, error } = await supabase.from('jobs').select('*');
  if (error) {
    console.error('Error fetching jobs:', error);
  } else {
    console.log(`Found ${jobs.length} jobs.`);
    console.log(JSON.stringify(jobs.slice(0, 2), null, 2));
  }

  console.log('\n--- Testing Relationships ---');
  // Try simple relationship names
  const { data: related, error: relError } = await supabase
    .from('jobs')
    .select('*, poster:profiles(full_name)')
    .limit(1);

  if (relError) {
    console.error('Relationship fetch failed (simple):', relError.message);
    
    // Try explicit column reference
    const { data: explicit, error: expError } = await supabase
      .from('jobs')
      .select('*, poster:profiles!poster_id(full_name)')
      .limit(1);
      
    if (expError) {
      console.error('Relationship fetch failed (explicit):', expError.message);
    } else {
      console.log('SUCCESS: Relationship works with !poster_id syntax.');
    }
  } else {
    console.log('SUCCESS: Relationship works with simple syntax.');
  }

  process.exit(0);
}

checkJobs();
