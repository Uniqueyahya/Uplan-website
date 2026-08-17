'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current URL hash contains a password recovery token
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') && pathname !== '/reset-password') {
        router.replace(`/reset-password${hash}`);
        return;
      }
    }

    // Listen to Supabase auth state changes for PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (pathname !== '/reset-password') {
          router.replace('/reset-password');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
