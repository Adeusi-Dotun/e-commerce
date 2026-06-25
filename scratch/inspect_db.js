const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const supabaseUrl = 'https://fjfdvqjcnqlsdojrkast.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZmR2cWpjbnFsc2RvanJrYXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDYzODQsImV4cCI6MjA5MjcyMjM4NH0.RxBKS5RM5aFWEK2R5ZkJcgsTFWfI3UupCdyp6OJAHLU';

async function run() {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  const data = await response.json();
  const profilesDefinition = data.definitions.profiles;
  console.log('Profiles table definition:', JSON.stringify(profilesDefinition, null, 2));
}

run();
