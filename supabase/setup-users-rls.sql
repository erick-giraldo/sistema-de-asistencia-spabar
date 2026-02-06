-- ============================================
-- CONFIGURACIÓN DE RLS PARA TABLA users_simple
-- Sistema de Asistencia Spabar
-- ============================================

-- Habilitar Row Level Security (RLS) en la tabla users_simple
ALTER TABLE users_simple ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (GET)
CREATE POLICY "Allow public read access on users_simple"
ON users_simple
FOR SELECT
TO public
USING (true);

-- Política para permitir inserción pública (POST)
CREATE POLICY "Allow public insert access on users_simple"
ON users_simple
FOR INSERT
TO public
WITH CHECK (true);

-- Política para permitir actualización pública (PUT)
CREATE POLICY "Allow public update access on users_simple"
ON users_simple
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Política para permitir eliminación pública (DELETE)
CREATE POLICY "Allow public delete access on users_simple"
ON users_simple
FOR DELETE
TO public
USING (true);

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users_simple';
