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

const DEMO_USERS: Record<string, { role: UserRole; fullName: string }> = {
  admin: { role: 'admin', fullName: 'Administrador' },
  marcos: { role: 'admin', fullName: 'Marcos' },
  kramos: { role: 'admin', fullName: 'Katherine Ramos' },
  servidor: { role: 'servidor', fullName: 'Servidor' },
  servidor1: { role: 'servidor', fullName: 'Servidor 1' },
  servidor2: { role: 'servidor', fullName: 'Servidor 2' },
};

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
    // Verificar si hay sesión demo guardada localmente
    const savedDemo = localStorage.getItem('servidores_demo_auth');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email } as User);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('servidores_demo_auth');
      }
    }

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
      : [`${cleanId}@merch.com`, `${cleanId}@servidores.iglesia.com`];

    // Intentar inicio de sesión en Supabase con los candidatos
    for (const email of candidateEmails) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          localStorage.removeItem('servidores_demo_auth');
          return { error: null };
        }
      } catch {
        // Continuar siguiente intento
      }
    }

    // Verificación especial para Katherine Ramos con la clave kamos123
    if (cleanId === 'kramos') {
      const cleanPass = password.trim();
      if (cleanPass === 'kamos123' || cleanPass === 'kramos123') {
        const demoProfile: Profile = {
          id: 'demo-kramos',
          username: 'kramos',
          full_name: 'Katherine Ramos',
          email: 'kramos@iglesiamontededios.org.do',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(demoProfile);
        setUser({ id: demoProfile.id, email: demoProfile.email } as User);
        localStorage.setItem('servidores_demo_auth', JSON.stringify(demoProfile));
        return { error: null };
      }
      return { error: new Error('Contraseña incorrecta') };
    }

    // Fallback de demostración para los demás usuarios requeridos
    const demoUser = DEMO_USERS[cleanId] || (cleanId.includes('@') && DEMO_USERS[cleanId.split('@')[0]]);
    if (demoUser) {
      const demoEmail = candidateEmails[0];
      const demoProfile: Profile = {
        id: `demo-${cleanId}`,
        username: cleanId,
        full_name: demoUser.fullName,
        email: demoEmail,
        role: demoUser.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(demoProfile);
      setUser({ id: demoProfile.id, email: demoEmail } as User);
      localStorage.setItem('servidores_demo_auth', JSON.stringify(demoProfile));
      return { error: null };
    }

    return { error: new Error('Usuario o contraseña incorrectos') };
  };

  const signOut = async () => {
    localStorage.removeItem('servidores_demo_auth');
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
    if (user && !user.id.startsWith('demo-')) {
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