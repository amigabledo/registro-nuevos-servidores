import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch {
      // Perfil omitido silenciosamente en caso de fallo de red
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const candidateEmails = cleanId.includes('@')
      ? [cleanId]
      : [
          `${cleanId}@amigable.do`,
          `${cleanId}@merch.com`,
          `${cleanId}@servidores.iglesia.com`,
        ];

    // Intentar inicio de sesión en Supabase con los candidatos
    for (const email of candidateEmails) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password.trim(),
        });

        if (!error && data.user) {
          return { error: null };
        }
      } catch {
        // Continuar siguiente intento
      }
    }

    return { error: new Error('Usuario o contraseña incorrectos') };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorar error al cerrar sesión
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const role: UserRole = profile?.role ?? 'servidor';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role,
        loading,
        isAdmin,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}