# 🚀 Guía de Configuración con Supabase

Esta guía te ayudará a conectar tu aplicación con Supabase para tener los datos en la nube.

## 📋 ¿Por qué usar Supabase?

✅ **Datos en la nube** - Accede desde cualquier dispositivo
✅ **Respaldos automáticos** - Nunca pierdas tus datos
✅ **Multi-usuario** - Varias personas pueden usar simultáneamente
✅ **Escalable** - Crece con tu negocio
✅ **Gratuito** - El plan gratuito es suficiente para empezar

## 🎯 Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Regístrate con tu email o GitHub
4. Verifica tu correo electrónico

## 🏗️ Paso 2: Crear un nuevo proyecto

1. Haz clic en "New project"
2. Completa los datos:
   - **Name**: Spabar Attendance
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: South America (Sao Paulo) - para mejor rendimiento en Perú
   - **Pricing Plan**: Free (suficiente para empezar)
3. Haz clic en "Create new project"
4. Espera 2-3 minutos mientras se crea el proyecto

## 🗄️ Paso 3: Configurar la base de datos

### Opción A: Usando el SQL Editor (RECOMENDADO)

1. En tu proyecto de Supabase, ve al menú lateral izquierdo
2. Haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**
4. Copia y pega TODO el contenido del archivo `supabase/setup.sql`
5. Haz clic en **"Run"** (botón verde)
6. Deberías ver el mensaje "Success. No rows returned"
7. Ve a **"Table Editor"** en el menú lateral
8. Deberías ver la tabla "schedules" con 19 empleados

### Opción B: Usando la interfaz gráfica

1. Ve a **"Table Editor"** en el menú lateral
2. Haz clic en **"Create a new table"**
3. Configura la tabla:
   - **Name**: schedules
   - **Description**: Employee schedules
   - Habilita **"Enable Row Level Security (RLS)"**
4. Agrega las siguientes columnas:

   | Nombre | Tipo | Default | Opciones |
   |--------|------|---------|----------|
   | id | int8 | - | Primary, Auto-increment |
   | name | varchar | - | - |
   | department | varchar | 'Spabar' | - |
   | entry_time | time | - | - |
   | exit_time | time | - | - |
   | scheduled_hours | int4 | - | - |
   | created_at | timestamptz | now() | - |
   | updated_at | timestamptz | now() | - |

5. Haz clic en **"Save"**
6. Agrega los empleados manualmente o importa desde el JSON

## 🔑 Paso 4: Obtener las credenciales

1. Ve a **"Settings"** (⚙️) en el menú lateral
2. Haz clic en **"API"**
3. Copia los siguientes valores:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public (API Key):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ⚙️ Paso 5: Configurar variables de entorno

1. En la carpeta del proyecto, copia el archivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Abre `.env.local` con un editor de texto

3. Reemplaza los valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   USE_LOCAL_DB=false
   ```

4. Guarda el archivo

## 🔒 Paso 6: Configurar políticas de seguridad (RLS)

Si usaste la Opción B, necesitas configurar las políticas:

1. Ve a **"Authentication"** → **"Policies"**
2. Selecciona la tabla **"schedules"**
3. Haz clic en **"New Policy"**
4. Selecciona **"Get started quickly"** → **"Enable read access for all users"**
5. Repite para INSERT, UPDATE, y DELETE

O simplemente ejecuta estos comandos en el SQL Editor:

```sql
-- Permitir lectura
CREATE POLICY "Allow public read" ON schedules FOR SELECT TO public USING (true);

-- Permitir inserción
CREATE POLICY "Allow public insert" ON schedules FOR INSERT TO public WITH CHECK (true);

-- Permitir actualización
CREATE POLICY "Allow public update" ON schedules FOR UPDATE TO public USING (true);

-- Permitir eliminación
CREATE POLICY "Allow public delete" ON schedules FOR DELETE TO public USING (true);
```

## 🧪 Paso 7: Probar la conexión

1. Detén el servidor si está corriendo (Ctrl + C)
2. Reinicia el servidor:
   ```bash
   npm run dev
   ```
3. Abre http://localhost:3000/admin
4. Inicia sesión
5. Deberías ver los horarios cargados desde Supabase
6. Intenta agregar un nuevo empleado
7. Ve a Supabase → Table Editor → schedules
8. ¡Deberías ver el nuevo empleado!

## 🔄 Migrar datos existentes (Opcional)

Si ya tienes datos en el archivo JSON local:

### Método 1: Importar desde JSON

1. Ve a **"Table Editor"** en Supabase
2. Selecciona la tabla **"schedules"**
3. Haz clic en **"Insert"** → **"Import data from CSV"**
4. Primero convierte tu JSON a CSV:
   - Abre `data/schedules/database.json`
   - Copia los datos a Excel
   - Exporta como CSV
5. Importa el CSV en Supabase

### Método 2: Script de migración

Crea un archivo `migrate.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SUPABASE_KEY'
)

async function migrate() {
  const data = JSON.parse(fs.readFileSync('./data/schedules/database.json'))
  
  for (const schedule of data.schedules) {
    await supabase.from('schedules').insert({
      name: schedule.name,
      department: schedule.department,
      entry_time: schedule.entryTime,
      exit_time: schedule.exitTime,
      scheduled_hours: schedule.scheduledHours
    })
  }
  
  console.log('Migración completada!')
}

migrate()
```

## 🔀 Volver a la base de datos local

Si quieres volver a usar la base de datos JSON local:

1. Abre `.env.local`
2. Cambia `USE_LOCAL_DB=true`
3. Reinicia el servidor

## 📊 Monitoreo y administración

### Ver datos en tiempo real

1. Ve a **"Table Editor"** en Supabase
2. Selecciona **"schedules"**
3. Verás todos los cambios en tiempo real

### Ver logs de la base de datos

1. Ve a **"Logs"** en el menú lateral
2. Selecciona **"Database"**
3. Verás todas las consultas ejecutadas

### Hacer respaldos

1. Ve a **"Database"** → **"Backups"**
2. Los respaldos automáticos están habilitados
3. Puedes descargar respaldos manuales cuando quieras

## 🆘 Solución de problemas

### Error: "Invalid API key"
**Solución:** Verifica que copiaste correctamente la API key en `.env.local`

### Error: "Failed to fetch"
**Solución:** 
- Verifica que el URL de Supabase sea correcto
- Verifica que tengas conexión a internet
- Revisa que las políticas RLS estén configuradas

### No aparecen datos
**Solución:**
- Ve a Supabase → Table Editor → schedules
- Verifica que haya datos en la tabla
- Revisa las políticas RLS
- Verifica que `USE_LOCAL_DB=false` en `.env.local`

### Error al insertar/actualizar
**Solución:**
- Revisa las políticas RLS (deben permitir INSERT/UPDATE)
- Verifica los tipos de datos en las columnas
- Revisa la consola del navegador para más detalles

## 💡 Consejos y mejores prácticas

1. **Guarda tu contraseña de DB**: La necesitarás para administración avanzada
2. **Monitorea el uso**: El plan gratuito tiene límites (500MB DB, 5GB transfer)
3. **Haz respaldos regulares**: Descarga respaldos mensuales
4. **Revisa los logs**: Útil para debugging
5. **Usa el SQL Editor**: Para consultas y mantenimiento avanzado

## 🎓 Recursos adicionales

- **Documentación Supabase**: https://supabase.com/docs
- **Dashboard Supabase**: https://app.supabase.com
- **Comunidad Supabase**: https://discord.supabase.com

## 🚀 Siguientes pasos

Una vez configurado Supabase, puedes:

1. **Desplegar en Vercel** para tener la app en internet
2. **Agregar autenticación** de usuarios
3. **Crear dashboards** avanzados
4. **Agregar notificaciones** por email
5. **Integrar con otras apps** vía API

¡Listo! Tu aplicación ahora usa Supabase como base de datos en la nube. 🎉
