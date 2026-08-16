import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqxbcvbvqaokkqumpazs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeGJjdmJ2cWFva2txdW1wYXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDkxNTUsImV4cCI6MjEwMjAyNTE1NX0.PIKUS_qZ_kv5dlohBPadASISXwP5bNq0wUu_O-ccON0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
