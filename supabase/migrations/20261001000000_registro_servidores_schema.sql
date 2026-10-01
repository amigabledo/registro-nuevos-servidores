-- ============================================================================
-- Tabla independiente para el registro de nuevos servidores
-- Totalmente aislada: no modifica ni altera las tablas existentes de VentaMerch
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Función para actualización automática de timestamps (si no existe ya)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- 2. Tabla principal de registro de nuevos servidores
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

-- Índices esenciales para alto rendimiento y filtros rápidos
CREATE INDEX IF NOT EXISTS idx_servidores_area ON public.servidores_registro(area_servicio);
CREATE INDEX IF NOT EXISTS idx_servidores_estado ON public.servidores_registro(estado);
CREATE INDEX IF NOT EXISTS idx_servidores_escuela ON public.servidores_registro(escuela_nuevos_creyentes);
CREATE INDEX IF NOT EXISTS idx_servidores_bautizado ON public.servidores_registro(bautizado);
CREATE INDEX IF NOT EXISTS idx_servidores_retiro ON public.servidores_registro(retiro_liberacion);
CREATE INDEX IF NOT EXISTS idx_servidores_casa_paz ON public.servidores_registro(asiste_casa_paz);
CREATE INDEX IF NOT EXISTS idx_servidores_telefono ON public.servidores_registro(telefono);
CREATE INDEX IF NOT EXISTS idx_servidores_created_at ON public.servidores_registro(created_at DESC);

-- Trigger para actualización automática de updated_at
DROP TRIGGER IF EXISTS trg_servidores_updated_at ON public.servidores_registro;
CREATE TRIGGER trg_servidores_updated_at
  BEFORE UPDATE ON public.servidores_registro
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.servidores_registro ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
-- Inserción: permitida para cualquier persona pública (autorregistro QR) y usuarios autenticados
DROP POLICY IF EXISTS "Insercion publica y de servidores en registros" ON public.servidores_registro;
CREATE POLICY "Insercion publica y de servidores en registros" ON public.servidores_registro
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Lectura: exclusiva para usuarios autenticados (administradores y servidores)
DROP POLICY IF EXISTS "Lectura de registros para usuarios autenticados" ON public.servidores_registro;
CREATE POLICY "Lectura de registros para usuarios autenticados" ON public.servidores_registro
  FOR SELECT TO authenticated
  USING (true);

-- Modificación: exclusiva para usuarios autenticados (actualizar estado, notas)
DROP POLICY IF EXISTS "Actualizacion de registros para usuarios autenticados" ON public.servidores_registro;
CREATE POLICY "Actualizacion de registros para usuarios autenticados" ON public.servidores_registro
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Eliminación: exclusiva para usuarios autenticados
DROP POLICY IF EXISTS "Eliminacion de registros para usuarios autenticados" ON public.servidores_registro;
CREATE POLICY "Eliminacion de registros para usuarios autenticados" ON public.servidores_registro
  FOR DELETE TO authenticated
  USING (true);

-- 4. Concesión explícita de permisos (estándar Supabase Data API desde 30 de octubre)
GRANT INSERT ON public.servidores_registro TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servidores_registro TO authenticated;
GRANT ALL ON public.servidores_registro TO service_role;
