# 🚀 Inicio Rápido con Supabase

## ⚡ Configuración en 5 minutos

### 1️⃣ Crear proyecto en Supabase (2 min)
1. Ve a https://supabase.com
2. Regístrate gratis
3. Crea nuevo proyecto
4. Espera a que se cree

### 2️⃣ Configurar base de datos (1 min)
1. En Supabase, ve a "SQL Editor"
2. Copia y pega el contenido de `supabase/setup.sql`
3. Haz clic en "Run"
4. ¡Listo! Tienes 19 empleados en la BD

### 3️⃣ Obtener credenciales (1 min)
1. Ve a "Settings" → "API"
2. Copia:
   - Project URL
   - anon public key

### 4️⃣ Configurar aplicación (1 min)
1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   USE_LOCAL_DB=false
   ```

3. Guarda el archivo

### 5️⃣ Verificar conexión (30 seg)
```bash
node supabase/test-connection.js
```

Si ves ✅, ¡todo está listo!

### 6️⃣ Iniciar aplicación
```bash
npm run dev
```

## 🎯 Comandos útiles

### Verificar conexión
```bash
node supabase/test-connection.js
```

### Migrar datos del JSON a Supabase
```bash
node supabase/migrate.js
```

### Volver a usar base de datos local
Edita `.env.local`:
```env
USE_LOCAL_DB=true
```

## 📚 Documentación completa

Para más detalles, consulta: `supabase/CONFIGURACION-SUPABASE.md`

## 🆘 Problemas comunes

**Error: "Invalid API key"**
→ Verifica que copiaste correctamente la key en `.env.local`

**Error: "Table schedules does not exist"**
→ Ejecuta el script `supabase/setup.sql` en el SQL Editor

**No aparecen datos**
→ Verifica que `USE_LOCAL_DB=false` en `.env.local`

## ✅ Ventajas de usar Supabase

- ☁️ Datos en la nube
- 🔄 Sincronización automática
- 👥 Multi-usuario
- 💾 Respaldos automáticos
- 🚀 Gratis para empezar

¡Disfruta de tu base de datos en la nube! 🎉
