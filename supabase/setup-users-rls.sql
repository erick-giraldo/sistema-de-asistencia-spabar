-- ============================================
-- PROTECCIÓN DE LA TABLA users_simple
-- Sistema de Asistencia Spabar
--
-- La app accede a esta tabla solo desde el servidor con SUPABASE_SERVICE_ROLE_KEY,
-- que salta RLS. Las claves anon y publishable no deben tener ningún acceso.
-- ============================================

-- Elimina todas las políticas existentes, incluidas las públicas anteriores
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users_simple'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.users_simple', policy_record.policyname);
  END LOOP;
END $$;

-- RLS activado y sin políticas: bloquea todo acceso con la clave anon
ALTER TABLE public.users_simple ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users_simple FROM anon, authenticated;

-- Los hashes de contraseña no caben en columnas de longitud corta
ALTER TABLE public.users_simple ALTER COLUMN password TYPE TEXT;

-- Verificación: la primera consulta no debe devolver filas
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users_simple';

SELECT relrowsecurity AS rls_activado FROM pg_class
WHERE oid = 'public.users_simple'::regclass;
