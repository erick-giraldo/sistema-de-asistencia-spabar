# Sistema de Asistencia Spabar

Sistema web desarrollado en Next.js para procesar archivos de transacciones de empleados y generar reportes de asistencia detallados.

## 🚀 Características

- **Procesamiento de archivos Excel**: Sube archivos .xlsx con transacciones de empleados
- **Cálculo automático de asistencia**: 
  - Horas trabajadas
  - Minutos de tardanza
  - Horas extra
  - Alertas de tardanza grave (>30 minutos)
- **Panel de administración**: Gestiona horarios de empleados
- **Exportación a Excel**: Descarga reportes detallados
- **Base de datos JSON**: Fácil de editar y mantener

## 📋 Requisitos

- Node.js 18 o superior
- npm o yarn

## 🔧 Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### Página Principal

1. Haz clic en "Selecciona el archivo Excel"
2. Elige tu archivo de transacciones (.xlsx)
3. Haz clic en "Procesar Archivo"
4. Revisa los resultados en la tabla
5. Descarga el reporte en Excel con el botón "Descargar Excel"

### Panel de Administración

1. Haz clic en "Panel Admin"
2. Ingresa las credenciales:
   - **Usuario**: Deissy
   - **Contraseña**: Meraki 2060
3. Gestiona los horarios de empleados:
   - **Editar**: Modifica horarios existentes
   - **Eliminar**: Elimina horarios
   - **Agregar Nuevo**: Crea nuevos horarios

## 📁 Estructura del Proyecto

```
spabar-attendance/
├── app/
│   ├── page.tsx              # Página principal
│   ├── admin/
│   │   └── page.tsx          # Panel de administración
│   ├── api/
│   │   └── schedules/
│   │       └── route.ts      # API REST para horarios
│   ├── layout.tsx            # Layout principal
│   └── globals.css           # Estilos globales
├── data/
│   └── schedules/
│       └── database.json     # Base de datos de horarios
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🗄️ Base de Datos

### Opción 1: Base de datos local (JSON)

Los horarios se almacenan en `data/schedules/database.json` con la siguiente estructura:

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

### Opción 2: Supabase (Base de datos en la nube)

La aplicación también soporta Supabase para tener los datos en la nube. Ventajas:

- ✅ Acceso desde cualquier dispositivo
- ✅ Respaldos automáticos
- ✅ Multi-usuario
- ✅ Escalable
- ✅ Plan gratuito disponible

**Para configurar Supabase, consulta la guía:** `supabase/CONFIGURACION-SUPABASE.md`

## 📊 Formato del Archivo de Entrada

El archivo Excel debe tener las siguientes columnas:

| ID Empleado | Nombre | Departamento | Fecha | Hora |
|------------|--------|--------------|--------|------|
| 9 | Emily | Spabar | 2026-02-03 | 08:15:00 |

## 🔍 Cálculos Realizados

- **Horas Trabajadas**: Diferencia entre la última y primera marcación del día
- **Tardanza**: Diferencia en minutos entre hora de entrada real y programada
- **Horas Extra**: Horas trabajadas que superan las horas programadas
- **Alerta**: Se genera si la tardanza supera 30 minutos
- **Semana**: Número de semana del año según ISO 8601

## 🛠️ Tecnologías Utilizadas

- **Next.js 14**: Framework React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **xlsx**: Procesamiento de archivos Excel
- **date-fns**: Manejo de fechas

## 📝 Notas

- Los horarios se pueden editar en tiempo real desde el panel de administración
- El sistema agrupa automáticamente múltiples marcaciones del mismo día
- Se toma la primera marcación como entrada y la última como salida
- Las tardanzas se calculan solo si la entrada es posterior a la hora programada

## 🔐 Credenciales de Acceso

**Panel de Administración:**
- Usuario: `Deissy`
- Contraseña: `Meraki 2060`

## 🚀 Despliegue en Producción

Para desplegar en producción:

```bash
npm run build
npm start
```

O despliega en Vercel con un solo clic:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📄 Licencia

Este proyecto es de uso interno para Spabar.
