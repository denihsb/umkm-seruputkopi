import { supabase } from '@/lib/supabaseClient';

function toFriendlyError(error) {
  const message = error?.message?.toLowerCase() ?? '';

  if (message.includes('invalid login credentials')) {
    return new Error('Email atau kata sandi salah');
  }

  if (message.includes('user already registered')) {
    return new Error('Email tersebut sudah terdaftar');
  }

  return new Error('Terjadi kesalahan. Silakan coba lagi.');
}

async function unwrap(request) {
  const { data, error } = await request;

  if (error) {
    throw toFriendlyError(error);
  }

  return data;
}

export async function signUp(fullName, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    if (error.message?.toLowerCase().includes('user already registered')) {
      throw new Error('Email sudah terdaftar. Silakan masuk.');
    }

    throw toFriendlyError(error);
  }

  if (data.user?.identities?.length === 0) {
    throw new Error('Email sudah terdaftar. Silakan masuk.');
  }

  return {
    ...data,
    needsEmailConfirmation: data.session === null,
  };
}

export async function signIn(email, password) {
  return unwrap(supabase.auth.signInWithPassword({ email, password }));
}

export async function signOut() {
  return unwrap(supabase.auth.signOut());
}

export async function getSession() {
  const data = await unwrap(supabase.auth.getSession());
  return data.session;
}

export async function fetchProfile(userId) {
  return unwrap(supabase.from('profiles').select('id, full_name, role').eq('id', userId).single());
}
