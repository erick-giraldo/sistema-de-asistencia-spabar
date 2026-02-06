# 📁 Directorio Supabase

Este directorio contiene todos los archivos necesarios para configurar y usar Supabase como base de datos en la nube.

## 📄 Archivos Incluidos

### 📘 Documentación

- **`INICIO-RAPIDO.md`** - Configuración en 5 minutos
  - Para usuarios que quieren empezar rápidamente
  - Pasos mínimos necesarios
  - Ideal para principiantes

- **`CONFIGURACION-SUPABASE.md`** - Guía completa paso a paso
  - Configuración detallada
  - Explicación de cada paso
  - Solución de problemas
  - Mejores prácticas

- **`COMPARACION.md`** - JSON Local vs Supabase
  - Tabla comparativa
  - Recomendaciones por caso de uso
  - Costos proyectados
  - Cuándo usar cada opción

### 🛠️ Scripts

- **`setup.sql`** - Script SQL para crear la base de datos
  - Crea la tabla `schedules`
  - Configura permisos (RLS)
  - Inserta datos iniciales
  - Configura triggers

- **`migrate.js`** - Migra datos de JSON a Supabase
  - Lee `data/schedules/database.json`
  - Inserta en Supabase
  - Evita duplicados
  - Muestra estadísticas

- **`test-connection.js`** - Verifica la conexión
  - Valida credenciales
  - Prueba acceso a la tabla
  - Muestra datos de ejemplo
  - Detecta problemas comunes

## 🚀 Inicio Rápido

### 1. Lee la documentación
```bash
# Para empezar rápido (5 minutos)
cat supabase/INICIO-RAPIDO.md

# Para configuración completa
cat supabase/CONFIGURACION-SUPABASE.md

# Para decidir si usar Supabase
cat supabase/COMPARACION.md
```

### 2. Configura Supabase
1. Crea cuenta en https://supabase.com
2. Crea nuevo proyecto
3. Ejecuta `setup.sql` en SQL Editor
4. Copia credenciales a `.env.local`

### 3. Verifica la conexión
```bash
npm install
node supabase/test-connection.js
```

### 4. Migra datos (opcional)
```bash
node supabase/migrate.js
```

## 📋 Requisitos

- Node.js instalado
- Cuenta en Supabase (gratuita)
- Variables de entorno configuradas en `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  USE_LOCAL_DB=false
  ```

## 🔧 Comandos Útiles

### Verificar conexión
```bash
node supabase/test-connection.js
```
**Output esperado:** ✅ Conexión exitosa + lista de empleados

### Migrar datos
```bash
node supabase/migrate.js
```
**Output esperado:** Resumen de migración con estadísticas

### Ver estructura SQL
```bash
cat supabase/setup.sql
```

## 🆘 Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
**Solución:**
```bash
npm install
```

### Error: "Invalid API key"
**Causa:** Credenciales incorrectas en `.env.local`
**Solución:**
1. Ve a Supabase → Settings → API
2. Copia nuevamente las credenciales
3. Actualiza `.env.local`

### Error: "Table 'schedules' does not exist"
**Causa:** No se ejecutó el script SQL
**Solución:**
1. Ve a Supabase → SQL Editor
2. Ejecuta el contenido de `setup.sql`

### No aparecen datos
**Causa:** Base de datos vacía
**Solución:**
```bash
node supabase/migrate.js
```

### La app sigue usando JSON local
**Causa:** Variable de entorno incorrecta
**Solución:**
Verifica que `.env.local` tenga:
```env
USE_LOCAL_DB=false
```

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://app.supabase.com)
- [Comunidad Supabase](https://discord.supabase.com)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Flujo Recomendado

1. **Primero:** Lee `COMPARACION.md` para decidir si usar Supabase
2. **Si decides usar Supabase:** Lee `INICIO-RAPIDO.md`
3. **Para detalles:** Consulta `CONFIGURACION-SUPABASE.md`
4. **Ejecuta:** `test-connection.js` para verificar
5. **Migra:** `migrate.js` si tienes datos en JSON
6. **Usa:** Tu aplicación ahora usa Supabase

## ✅ Checklist de Configuración

- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Script `setup.sql` ejecutado
- [ ] Credenciales copiadas a `.env.local`
- [ ] `USE_LOCAL_DB=false` en `.env.local`
- [ ] `test-connection.js` ejecutado exitosamente
- [ ] Datos migrados (si aplica)
- [ ] Aplicación iniciada y funcionando

## 🎉 ¡Listo!

Si completaste el checklist, tu aplicación está usando Supabase correctamente.

¿Problemas? Consulta `CONFIGURACION-SUPABASE.md` sección "Solución de problemas"
