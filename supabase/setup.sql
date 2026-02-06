-- ============================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Sistema de Asistencia Spabar
-- ============================================

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT 'Spabar',
  entry_time TIME NOT NULL,
  exit_time TIME NOT NULL,
  scheduled_hours INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por nombre
CREATE INDEX IF NOT EXISTS idx_schedules_name ON schedules(name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (GET)
CREATE POLICY "Allow public read access"
ON schedules
FOR SELECT
TO public
USING (true);

-- Política para permitir inserción pública (POST)
CREATE POLICY "Allow public insert access"
ON schedules
FOR INSERT
TO public
WITH CHECK (true);

-- Política para permitir actualización pública (PUT)
CREATE POLICY "Allow public update access"
ON schedules
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Política para permitir eliminación pública (DELETE)
CREATE POLICY "Allow public delete access"
ON schedules
FOR DELETE
TO public
USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales
INSERT INTO schedules (name, department, entry_time, exit_time, scheduled_hours) VALUES
  ('Sabrina', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Sarai', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Andrea', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Valeria', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Susan', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Rosaura', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Emily', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Liliana', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Mauricio', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Wilmer', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Madeley', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Yolis', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Nayeli', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Fabrizzio', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Janet', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Jeferson', 'Spabar', '08:00:00', '17:00:00', 9),
  ('Daimary', 'Spabar', '10:00:00', '19:00:00', 9),
  ('Niurka', 'Spabar', '09:00:00', '21:00:00', 12),
  ('Stefany', 'Spabar', '10:00:00', '19:00:00', 9)
ON CONFLICT DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT * FROM schedules ORDER BY name;
