# 🎯 Sistema de Asistencia Spabar - Guía Completa

## 📦 Contenido del Paquete

Has recibido una aplicación web completa desarrollada en Next.js que replica y mejora la funcionalidad de tu macro de Excel.

## ✨ Características Principales

✅ **Procesamiento de archivos Excel** - Sube tus archivos de transacciones
✅ **Cálculo automático** - Horas trabajadas, tardanzas, horas extra
✅ **Panel de administración** - Edita horarios sin tocar código
✅ **Exportación a Excel** - Descarga reportes detallados
✅ **Base de datos JSON** - Fácil de modificar y respaldar
✅ **Interfaz moderna** - Diseño limpio y profesional

## 🚀 Instalación Rápida (Windows)

### Opción 1: Usando scripts batch (MÁS FÁCIL)
1. Extrae el archivo ZIP
2. Doble clic en `1-INSTALAR.bat` (solo la primera vez)
3. Espera a que termine la instalación
4. Doble clic en `2-EJECUTAR.bat`
5. Abre tu navegador en: http://localhost:3000

### Opción 2: Usando terminal
1. Extrae el archivo ZIP
2. Abre PowerShell o CMD en la carpeta
3. Ejecuta: `npm install`
4. Ejecuta: `npm run dev`
5. Abre tu navegador en: http://localhost:3000

## 📖 Manual de Uso

### 1️⃣ Procesar Archivo de Transacciones

**Paso 1:** En la página principal, haz clic en "Selecciona el archivo Excel"

**Paso 2:** Elige tu archivo de transacciones (igual al que usas actualmente)

**Paso 3:** Haz clic en "Procesar Archivo"

**Paso 4:** Revisa los resultados en la tabla:
- ✅ Filas normales = Sin problemas
- 🟡 Filas amarillas = Tardanza leve
- 🔴 Filas rojas = TARDANZA GRAVE (>30 min)

**Paso 5:** Descarga el reporte en Excel con el botón "Descargar Excel"

### 2️⃣ Gestionar Horarios

**Acceso al Panel:**
- Haz clic en "Panel Admin" (esquina superior derecha)
- **Usuario:** Deissy
- **Contraseña:** Meraki 2060

**Agregar nuevo empleado:**
1. Clic en "Agregar Nuevo"
2. Completa los datos
3. Clic en "Guardar Nuevo Horario"

**Editar horario:**
1. Busca el empleado en la tabla
2. Clic en "Editar"
3. Modifica los campos
4. Clic en "Guardar"

**Eliminar horario:**
1. Busca el empleado
2. Clic en "Eliminar"
3. Confirma la acción

## 📊 Formato del Archivo Excel

Tu archivo debe tener estas columnas (el orden puede variar):

| ID Empleado | Nombre | Departamento | Fecha | Hora |
|------------|---------|--------------|----------|----------|
| 9 | Emily | Spabar | 2026-02-03 | 08:00:00 |

**Notas importantes:**
- Los nombres deben coincidir con los de la base de datos
- El sistema agrupa automáticamente múltiples marcaciones
- Primera marcación = Entrada
- Última marcación = Salida

## 🎯 Cálculos Realizados

| Campo | Descripción |
|-------|-------------|
| **Horas Trabajadas** | Tiempo entre primera y última marcación |
| **Tardanza** | Minutos de retraso respecto a hora programada |
| **Horas Extra** | Horas adicionales sobre las programadas |
| **Alerta** | "TARDANZA GRAVE" si tardanza > 30 minutos |
| **Semana** | Número de semana del año |

### Ejemplo de Cálculo:

```
Empleado: Emily
Horario: 08:00 - 17:00 (9 horas)

Marcaciones del día:
- 08:15:00 ← Primera (ENTRADA)
- 12:30:00
- 13:30:00
- 17:30:00 ← Última (SALIDA)

Resultado:
✅ Entrada Real: 08:15:00
✅ Salida Real: 17:30:00
✅ Horas Trabajadas: 9.25h
⚠️ Tardanza: 15 minutos
✅ Horas Extra: 0.25h
✅ Sin alerta (tardanza < 30 min)
```

## 🗄️ Base de Datos

### Opción 1: Base de datos local (JSON) - RECOMENDADO PARA EMPEZAR

**Ubicación:** `data/schedules/database.json`

Puedes editar este archivo directamente con Notepad, VSCode, o cualquier editor de texto.

**Ejemplo:**
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

**⚠️ IMPORTANTE:** Mantén siempre el formato JSON válido.

### Opción 2: Supabase (Base de datos en la nube) - RECOMENDADO PARA PRODUCCIÓN

¿Quieres tener los datos en la nube y acceder desde cualquier lugar?

**Ventajas:**
- ☁️ Datos en la nube
- 🔄 Acceso desde cualquier dispositivo
- 👥 Multi-usuario (varias personas simultáneamente)
- 💾 Respaldos automáticos
- 🚀 Escalable
- 💰 Plan gratuito disponible

**Configuración rápida (5 minutos):**
1. Consulta: `supabase/INICIO-RAPIDO.md`
2. Para configuración detallada: `supabase/CONFIGURACION-SUPABASE.md`
3. Para comparar opciones: `supabase/COMPARACION.md`

**Migración de JSON a Supabase:**
```bash
node supabase/migrate.js
```

**Cambiar entre opciones:**
Edita `.env.local` y cambia `USE_LOCAL_DB=true` (JSON) o `USE_LOCAL_DB=false` (Supabase)

## 🔐 Credenciales

**Panel de Administración:**
- **Usuario:** Deissy
- **Contraseña:** Meraki 2060

Para cambiar las credenciales, edita el archivo:
`app/admin/page.tsx` (línea ~38)

## 📂 Estructura del Proyecto

```
spabar-attendance/
├── 1-INSTALAR.bat        # Script de instalación (Windows)
├── 2-EJECUTAR.bat        # Script para ejecutar (Windows)
├── README.md             # Documentación técnica
├── INSTALACION.md        # Guía de instalación
├── EJEMPLOS.md           # Ejemplos de uso
├── app/                  # Aplicación
│   ├── page.tsx         # Página principal
│   ├── admin/           # Panel admin
│   └── api/             # API REST
├── data/
│   └── schedules/
│       └── database.json # Base de datos
└── package.json          # Dependencias
```

## 🆘 Solución de Problemas

### ❌ "npm no se reconoce"
**Solución:** Instala Node.js desde https://nodejs.org/

### ❌ "Puerto 3000 en uso"
**Solución:** Cierra otras aplicaciones o modifica el puerto en package.json

### ❌ "Error al procesar archivo"
**Solución:** 
- Verifica que el archivo sea .xlsx
- Comprueba que tenga las columnas correctas
- Asegúrate de que las fechas y horas sean válidas

### ❌ "Empleado no aparece en el reporte"
**Solución:**
- Verifica que el nombre coincida exactamente con la base de datos
- Revisa que tenga horario asignado en el panel admin

### ❌ "No puedo iniciar sesión en admin"
**Solución:**
- Usuario: Deissy (con mayúscula)
- Contraseña: Meraki 2060 (con espacio)

## 🔄 Actualizar la Aplicación

Para detener el servidor: **Ctrl + C** en la terminal

Para reiniciar: Ejecuta nuevamente `2-EJECUTAR.bat` o `npm run dev`

## 💾 Respaldar Datos

**Importante:** Haz copias de seguridad de:
- `data/schedules/database.json` - Horarios de empleados

## 🌐 Despliegue en Internet (Opcional)

Si quieres que la aplicación esté disponible en internet:

1. Crea cuenta gratuita en Vercel: https://vercel.com
2. Conecta tu repositorio de GitHub
3. Vercel desplegará automáticamente

## 📞 Soporte

Para dudas o problemas:
1. Revisa esta guía completa
2. Consulta el archivo EJEMPLOS.md
3. Revisa el archivo INSTALACION.md

## 🎓 Tecnologías Utilizadas

- **Next.js 14** - Framework web moderno
- **TypeScript** - JavaScript con tipos
- **Tailwind CSS** - Estilos profesionales
- **xlsx** - Procesamiento de Excel
- **date-fns** - Manejo de fechas

## ✅ Ventajas sobre el Macro de Excel

✅ **Más rápido** - Procesa archivos grandes en segundos
✅ **Más seguro** - No requiere habilitar macros
✅ **Multi-usuario** - Varias personas pueden usar a la vez
✅ **Edición en línea** - Modifica horarios sin abrir Excel
✅ **Backup automático** - La base de datos se guarda en JSON
✅ **Portable** - Funciona en Windows, Mac, Linux
✅ **Exportable** - Descarga reportes en Excel

## 📝 Notas Finales

- La aplicación funciona 100% local en tu computadora
- No se envía ningún dato a internet
- Todos los cálculos son idénticos a tu macro original
- Puedes personalizar colores, textos, etc. editando los archivos

---

**¡Gracias por usar el Sistema de Asistencia Spabar!** 🎉

Si necesitas ayuda adicional, no dudes en preguntar.
