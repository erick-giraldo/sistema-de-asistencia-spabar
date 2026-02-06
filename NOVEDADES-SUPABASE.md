# 🎉 NUEVA VERSIÓN: Ahora con Soporte Supabase

## ✨ ¿Qué hay de nuevo?

Tu aplicación ahora soporta **dos modos de base de datos**:

### 📁 Modo 1: Base de datos local (JSON)
- Ya estaba incluido
- Perfecto para empezar
- Sin configuración adicional
- Datos en tu computadora

### ☁️ Modo 2: Supabase (NUEVO)
- Base de datos en la nube
- Acceso desde cualquier lugar
- Multi-usuario
- Respaldos automáticos
- ¡Plan gratuito disponible!

## 🎯 Lo Mejor: Puedes cambiar entre ambos cuando quieras

Empieza con JSON local para familiarizarte, luego migra a Supabase cuando estés listo.

## 📚 Documentación Incluida

### Para Supabase:
1. **`supabase/INICIO-RAPIDO.md`** → Configuración en 5 minutos
2. **`supabase/CONFIGURACION-SUPABASE.md`** → Guía completa paso a paso
3. **`supabase/COMPARACION.md`** → ¿Cuál opción es mejor para ti?
4. **`supabase/README.md`** → Índice de toda la documentación

### Guías Originales:
- **`GUIA-COMPLETA.md`** → Manual completo de usuario
- **`INSTALACION.md`** → Cómo instalar la aplicación
- **`EJEMPLOS.md`** → Casos de uso y ejemplos
- **`README.md`** → Documentación técnica

## 🚀 Inicio Rápido

### Opción A: Usar JSON Local (MÁS RÁPIDO)
1. Ejecuta `1-INSTALAR.bat`
2. Ejecuta `2-EJECUTAR.bat`
3. ¡Listo! Ya funciona

### Opción B: Usar Supabase
1. Lee `supabase/INICIO-RAPIDO.md`
2. Configura Supabase (5 minutos)
3. Ejecuta la aplicación
4. ¡Datos en la nube!

## 🔧 Archivos Nuevos

```
spabar-attendance/
├── .env.example              # Plantilla de variables de entorno
├── .env.local                # Tu configuración (crear)
├── lib/
│   └── supabase.ts          # Cliente de Supabase
├── supabase/
│   ├── README.md            # Índice de Supabase
│   ├── INICIO-RAPIDO.md     # Configuración rápida
│   ├── CONFIGURACION-SUPABASE.md  # Guía completa
│   ├── COMPARACION.md       # JSON vs Supabase
│   ├── setup.sql            # Script para crear BD
│   ├── migrate.js           # Migrar datos a Supabase
│   └── test-connection.js   # Verificar conexión
└── app/api/schedules/
    └── route.ts             # API actualizada (soporta ambos)
```

## 🎨 Características Actualizadas

### API REST (`app/api/schedules/route.ts`)
Ahora soporta ambas opciones automáticamente:
- Lee `.env.local` para saber qué usar
- `USE_LOCAL_DB=true` → Usa JSON
- `USE_LOCAL_DB=false` → Usa Supabase
- Sin cambios en el código del frontend

### Scripts de Utilidad
- **`test-connection.js`** → Verifica que Supabase funcione
- **`migrate.js`** → Migra datos de JSON a Supabase
- Ambos incluyen mensajes claros y manejo de errores

## 💡 Casos de Uso Recomendados

### Usa JSON Local si:
- ✅ Solo tú usarás la aplicación
- ✅ La usarás en una sola computadora
- ✅ Quieres máxima simplicidad
- ✅ Es tu primera vez con la app

### Usa Supabase si:
- ✅ Varias personas necesitan acceso
- ✅ Quieres acceder desde diferentes lugares
- ✅ Necesitas respaldos automáticos
- ✅ Planeas escalar el sistema

## 🔄 Migración Fácil

### De JSON a Supabase:
```bash
# 1. Configura Supabase (ver guía)
# 2. Ejecuta:
node supabase/migrate.js
# 3. Cambia en .env.local:
USE_LOCAL_DB=false
```

### De Supabase a JSON:
```bash
# 1. Cambia en .env.local:
USE_LOCAL_DB=true
# 2. Reinicia la app
```

## 📊 Estructura de la Base de Datos

### En JSON Local:
```json
{
  "schedules": [
    {
      "id": 3,
      "name": "Sabrina",
      "department": "Spabar",
      "entryTime": "08:00:00",
      "exitTime": "17:00:00",
      "scheduledHours": 9
    }
  ]
}
```

### En Supabase:
```sql
CREATE TABLE schedules (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT 'Spabar',
  entry_time TIME NOT NULL,
  exit_time TIME NOT NULL,
  scheduled_hours INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Nota:** Los nombres de columnas se convierten automáticamente entre formatos.

## 🛡️ Seguridad

### JSON Local:
- Datos en tu computadora
- Acceso físico requerido
- Tú controlas los respaldos

### Supabase:
- Datos encriptados (HTTPS + en reposo)
- Autenticación incluida
- Políticas de seguridad (RLS)
- Respaldos automáticos

## 💰 Costos

### JSON Local:
- **Gratis para siempre**
- Sin límites
- Sin restricciones

### Supabase:
- **Plan Gratuito:**
  - 500 MB base de datos
  - 5 GB transferencia/mes
  - **Costo:** $0/mes
  - **Suficiente para:** >10,000 empleados

Para tu caso de 19 empleados: **Plan gratuito es más que suficiente**

## 🎯 Recomendación Personal

1. **Empieza con JSON Local**
   - Familiarízate con la aplicación
   - Sin complicaciones
   - Funciona inmediatamente

2. **Considera Supabase si:**
   - Ya dominas la aplicación
   - Necesitas acceso remoto
   - Más personas la usarán
   - Quieres respaldos automáticos

3. **Lo mejor:**
   - Puedes cambiar cuando quieras
   - No pierdes ningún dato
   - Un script hace la migración

## 📞 Soporte

### Para JSON Local:
- Ver `GUIA-COMPLETA.md`
- Ver `EJEMPLOS.md`

### Para Supabase:
- Ver `supabase/INICIO-RAPIDO.md` (primero)
- Ver `supabase/CONFIGURACION-SUPABASE.md` (completo)
- Ver `supabase/COMPARACION.md` (decidir)

### Scripts de ayuda:
```bash
# Verificar conexión a Supabase
node supabase/test-connection.js

# Migrar datos
node supabase/migrate.js
```

## ✅ Checklist de Instalación

- [ ] Descomprimir el ZIP
- [ ] Ejecutar `1-INSTALAR.bat`
- [ ] Decidir: JSON Local o Supabase (ver `COMPARACION.md`)
- [ ] Si usas JSON Local:
  - [ ] Ejecutar `2-EJECUTAR.bat`
  - [ ] ¡Listo!
- [ ] Si usas Supabase:
  - [ ] Leer `supabase/INICIO-RAPIDO.md`
  - [ ] Configurar cuenta en Supabase
  - [ ] Ejecutar script SQL
  - [ ] Copiar credenciales a `.env.local`
  - [ ] Ejecutar `test-connection.js`
  - [ ] Ejecutar `2-EJECUTAR.bat`
  - [ ] ¡Listo!

## 🎉 ¡Disfruta tu nueva aplicación!

Ahora tienes la flexibilidad de:
- ✅ Empezar simple (JSON Local)
- ✅ Escalar cuando necesites (Supabase)
- ✅ Cambiar entre opciones fácilmente
- ✅ Sin perder datos en la transición

**¡Gracias por usar el Sistema de Asistencia Spabar!** 🚀
