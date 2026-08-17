import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqxbcvbvqaokkqumpazs.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupGoogleReviewerAccount() {
  const email = 'reviewer@uplan.app';
  const password = 'UplanTest2026!';
  const fullName = 'Google Play Reviewer';

  console.log(`Setting up reviewer account: ${email}...`);

  // Try signing in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  let userId = signInData?.user?.id;

  if (signInError) {
    console.log('Account not found or password changed. Attempting sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('Sign up error:', signUpError.message);
      return;
    }
    userId = signUpData?.user?.id;
  }

  // If user exists, ensure profile is active and not suspended
  if (userId) {
    console.log(`Ensuring profile for user ID ${userId} is active...`);
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: email,
      full_name: fullName,
      role: 'user',
      status: 'active',
    });

    if (profileError) {
      console.error('Profile upsert error:', profileError.message);
    } else {
      console.log('Profile active and ready for Google Play Review!');
    }
  }
}

setupGoogleReviewerAccount();
