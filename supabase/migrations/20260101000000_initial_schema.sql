-- ============================================================================
-- Plantilla base: Esquema inicial con Auth, Perfiles, Roles y Seguridad RLS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Función para actualización automática de timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- 2. Tabla de perfiles vinculada a auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices esenciales para rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Trigger para actualización automática de updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Función de verificación de roles con búsqueda segura (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = role_name
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 4. Protección contra escalada de privilegios en perfiles
CREATE OR REPLACE FUNCTION public.prevent_profile_priv_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF (SELECT auth.uid()) IS NULL OR NOT public.has_role((SELECT auth.uid()), 'admin') THEN
      RAISE EXCEPTION 'Permisos insuficientes para modificar el rol de usuario';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_profile_priv_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_priv_escalation
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_priv_escalation();

-- 5. Políticas RLS optimizadas con InitPlan ((SELECT auth.uid()))
DROP POLICY IF EXISTS "Lectura de perfiles para usuarios autenticados" ON public.profiles;
CREATE POLICY "Lectura de perfiles para usuarios autenticados" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id OR public.has_role((SELECT auth.uid()), 'admin')
  );

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Admins pueden actualizar cualquier perfil" ON public.profiles;
CREATE POLICY "Admins pueden actualizar cualquier perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- 6. Trigger automático al registrarse un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Función auxiliar para Keep Alive de Supabase con ruta segura
CREATE OR REPLACE FUNCTION public.ping()
RETURNS TEXT AS $$
BEGIN
  RETURN 'pong';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 8. Concesión explícita de permisos (estándar Supabase Data API desde el 30 de octubre)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.ping() TO anon, authenticated, service_role;