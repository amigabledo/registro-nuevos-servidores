-- ============================================================================
-- Sistema de registro de nuevos servidores
-- Esquema completo con perfiles, postulantes, RLS e índices
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

-- 2. Tabla de perfiles para administradores y servidores
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'servidor' CHECK (role IN ('admin', 'servidor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tabla principal de registro de nuevos servidores
CREATE TABLE IF NOT EXISTS public.servidores_registro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT,
  escuela_nuevos_creyentes TEXT NOT NULL CHECK (escuela_nuevos_creyentes IN ('si', 'no', 'cursando')),
  bautizado BOOLEAN NOT NULL DEFAULT false,
  fecha_bautismo DATE,
  retiro_liberacion BOOLEAN NOT NULL DEFAULT false,
  fecha_retiro DATE,
  tiene_mentor BOOLEAN NOT NULL DEFAULT false,
  nombre_mentor TEXT,
  asiste_casa_paz BOOLEAN NOT NULL DEFAULT false,
  area_servicio TEXT NOT NULL CHECK (area_servicio IN ('ujieres', 'seguridad', 'escuela_dominical')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobado', 'contactado')),
  notas_servidor TEXT,
  registrado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices esenciales para búsquedas y filtros
CREATE INDEX IF NOT EXISTS idx_servidores_area ON public.servidores_registro(area_servicio);
CREATE INDEX IF NOT EXISTS idx_servidores_estado ON public.servidores_registro(estado);
CREATE INDEX IF NOT EXISTS idx_servidores_escuela ON public.servidores_registro(escuela_nuevos_creyentes);
CREATE INDEX IF NOT EXISTS idx_servidores_bautizado ON public.servidores_registro(bautizado);
CREATE INDEX IF NOT EXISTS idx_servidores_retiro ON public.servidores_registro(retiro_liberacion);
CREATE INDEX IF NOT EXISTS idx_servidores_casa_paz ON public.servidores_registro(asiste_casa_paz);
CREATE INDEX IF NOT EXISTS idx_servidores_telefono ON public.servidores_registro(telefono);
CREATE INDEX IF NOT EXISTS idx_servidores_created_at ON public.servidores_registro(created_at DESC);

DROP TRIGGER IF EXISTS trg_servidores_updated_at ON public.servidores_registro;
CREATE TRIGGER trg_servidores_updated_at
  BEFORE UPDATE ON public.servidores_registro
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.servidores_registro ENABLE ROW LEVEL SECURITY;

-- 4. Función de verificación de roles con búsqueda segura
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = role_name
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 5. Políticas RLS para perfiles
DROP POLICY IF EXISTS "Lectura de perfiles para usuarios autenticados" ON public.profiles;
CREATE POLICY "Lectura de perfiles para usuarios autenticados" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins pueden gestionar perfiles" ON public.profiles;
CREATE POLICY "Admins pueden gestionar perfiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- 6. Políticas RLS para servidores_registro
-- Inserción: permitida tanto anónima (formulario QR público) como autenticada (servidor registrando)
DROP POLICY IF EXISTS "Insercion publica y de servidores en registros" ON public.servidores_registro;
CREATE POLICY "Insercion publica y de servidores en registros" ON public.servidores_registro
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Lectura: exclusiva para usuarios autenticados (admins y servidores)
DROP POLICY IF EXISTS "Lectura de registros para usuarios autenticados" ON public.servidores_registro;
CREATE POLICY "Lectura de registros para usuarios autenticados" ON public.servidores_registro
  FOR SELECT TO authenticated
  USING (true);

-- Modificación: exclusiva para usuarios autenticados
DROP POLICY IF EXISTS "Actualizacion de registros para usuarios autenticados" ON public.servidores_registro;
CREATE POLICY "Actualizacion de registros para usuarios autenticados" ON public.servidores_registro
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Eliminación: exclusiva para administradores
DROP POLICY IF EXISTS "Eliminacion de registros para administradores" ON public.servidores_registro;
CREATE POLICY "Eliminacion de registros para administradores" ON public.servidores_registro
  FOR DELETE TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- 7. Trigger automático al registrarse un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'servidor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Concesión explícita de permisos (estándar Supabase Data API desde el 30 de octubre)
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT INSERT ON public.servidores_registro TO anon;
GRANT SELECT, INSERT, UPDATE ON public.servidores_registro TO authenticated;
GRANT ALL ON public.servidores_registro TO service_role;
