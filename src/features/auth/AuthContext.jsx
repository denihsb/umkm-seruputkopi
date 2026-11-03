import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const isMountedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let sessionVersion = 0;
    isMountedRef.current = true;

    async function loadProfile(nextUser, version) {
      try {
        const nextProfile = await fetchProfile(nextUser.id);
        if (isMounted && version === sessionVersion) {
          setProfile(nextProfile);
        }
      } catch (error) {
        if (isMounted && version === sessionVersion) {
          console.error(error);
        }
      }
    }

    async function initializeSession() {
      const versionAtStart = sessionVersion;

      try {
        const session = await getSession();
        if (!isMounted || versionAtStart !== sessionVersion) {
          return;
        }

        const nextUser = session?.user ?? null;
        const version = ++sessionVersion;
        setUser(nextUser);
        setProfile(null);

        if (nextUser) {
          await loadProfile(nextUser, version);
        }
      } catch (error) {
        if (isMounted && versionAtStart === sessionVersion) {
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      const nextUser = session?.user ?? null;
      const version = ++sessionVersion;
      setUser(nextUser);
      setProfile(null);
      setLoading(false);

      if (nextUser) {
        Promise.resolve().then(() => {
          if (isMounted && version === sessionVersion) {
            loadProfile(nextUser, version);
          }
        });
      }
    });

    initializeSession();

    return () => {
      isMounted = false;
      isMountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    if (isMountedRef.current) {
      setUser(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signUp: signUpRequest,
      signIn: signInRequest,
      signOut,
    }),
    [loading, profile, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
