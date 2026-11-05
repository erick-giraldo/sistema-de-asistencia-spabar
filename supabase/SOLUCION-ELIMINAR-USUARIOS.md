> ⚠️ **Guía obsoleta.** La app ya no usa políticas públicas en `users_simple`: accede desde el servidor con `SUPABASE_SERVICE_ROLE_KEY`. `setup-users-rls.sql` ahora elimina esas políticas. No desactives RLS en esta tabla.

# 🔧 Solución: Habilitar Eliminación de Usuarios

## Problema Identificado

Los usuarios no se pueden eliminar porque la tabla `users_simple` en Supabase **no tiene políticas de Row Level Security (RLS)** configuradas. Cuando RLS está habilitado pero no hay políticas, Supabase bloquea todas las operaciones por seguridad.

## Solución

Debes ejecutar el script SQL `setup-users-rls.sql` en tu base de datos de Supabase para habilitar las políticas necesarias.

### Pasos para Aplicar la Solución:

1. **Abre Supabase Dashboard**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y Pega el Script**
   - Abre el archivo `supabase/setup-users-rls.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta el Script**
   - Haz clic en el botón **"Run"** o presiona `Ctrl + Enter` (Windows/Linux) o `Cmd + Enter` (Mac)
   - Deberías ver un mensaje de éxito

5. **Verifica las Políticas**
   - Al final del script hay una consulta SELECT que mostrará todas las políticas creadas
   - Deberías ver 4 políticas:
     - `Allow public read access on users_simple` (SELECT)
     - `Allow public insert access on users_simple` (INSERT)
     - `Allow public update access on users_simple` (UPDATE)
     - `Allow public delete access on users_simple` (DELETE)

6. **Prueba la Eliminación**
   - Regresa a tu aplicación
   - Intenta eliminar un usuario
   - Ahora debería funcionar correctamente ✅

## Qué Hace el Script

El script hace lo siguiente:

1. **Habilita RLS** en la tabla `users_simple`
2. **Crea 4 políticas públicas** que permiten:
   - ✅ Lectura (SELECT)
   - ✅ Inserción (INSERT)
   - ✅ Actualización (UPDATE)
   - ✅ Eliminación (DELETE)

## Nota de Seguridad

⚠️ **Importante**: Estas políticas permiten acceso público a todas las operaciones. En un entorno de producción real, deberías implementar políticas más restrictivas basadas en autenticación de Supabase Auth.

Para mayor seguridad en producción, considera:
- Usar Supabase Auth para autenticación
- Crear políticas basadas en roles de usuario
- Restringir operaciones DELETE solo a super_admin

## Mejoras Aplicadas al Código

También he mejorado la función `deleteUser` en el frontend para:
- ✅ Mostrar mensajes de error más detallados
- ✅ Capturar y mostrar el error específico del servidor
- ✅ Ayudar a diagnosticar problemas futuros

## Alternativa: Deshabilitar RLS (No Recomendado)

Si solo estás en desarrollo y quieres una solución rápida (NO para producción):

```sql
ALTER TABLE users_simple DISABLE ROW LEVEL SECURITY;
```

⚠️ **Advertencia**: Esto elimina toda la seguridad de la tabla. Solo úsalo en desarrollo local.
