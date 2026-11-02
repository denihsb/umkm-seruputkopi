import { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

import { AuthContext } from './authContext.js';
import {
  fetchProfile,
  getSession,
  signIn as signInRequest,
  signOut as signOutRequest,
  signUp as signUpRequest,
} from './api.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(nextUser) {
      if (!nextUser) {
        if (isMounted) {
          setProfile(null);
        }
        return;
      }

      const nextProfile = await fetchProfile(nextUser.id);
      if (isMounted) {
        setProfile(nextProfile);
      }
    }

    async function initializeSession() {
      try {
        const session = await getSession();
        if (isMounted) {
          setUser(session?.user ?? null);
        }
        await loadProfile(session?.user);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
      try {
        await loadProfile(session?.user);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signUp: signUpRequest,
      signIn: signInRequest,
      signOut: signOutRequest,
    }),
    [loading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
