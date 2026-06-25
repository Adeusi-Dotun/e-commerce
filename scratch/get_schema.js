const fs = require('fs');

const supabaseUrl = 'https://fjfdvqjcnqlsdojrkast.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZmR2cWpjbnFsc2RvanJrYXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDYzODQsImV4cCI6MjA5MjcyMjM4NH0.RxBKS5RM5aFWEK2R5ZkJcgsTFWfI3UupCdyp6OJAHLU';

async function run() {
  try {
    // Dynamic import for node-fetch is not needed if we use global fetch (Node 18+)
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    fs.writeFileSync('scratch/schema.json', JSON.stringify(data.definitions, null, 2));
    console.log('Schema saved successfully to scratch/schema.json');
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

run();
