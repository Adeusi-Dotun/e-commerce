import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjfdvqjcnqlsdojrkast.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZmR2cWpjbnFsc2RvanJrYXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDYzODQsImV4cCI6MjA5MjcyMjM4NH0.RxBKS5RM5aFWEK2R5ZkJcgsTFWfI3UupCdyp6OJAHLU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);