# Guía de Instalación Rápida

## Pasos para ejecutar la aplicación:

### 1. Instalar Node.js
Si no tienes Node.js instalado, descárgalo desde: https://nodejs.org/
(Se recomienda la versión LTS)

### 2. Abrir terminal en la carpeta del proyecto
- Windows: Shift + Click derecho en la carpeta → "Abrir ventana de PowerShell aquí"
- Mac/Linux: Click derecho → "Abrir terminal aquí"

### 3. Instalar dependencias
```bash
npm install
```
Este proceso puede tardar 2-3 minutos la primera vez.

### 4. Iniciar la aplicación
```bash
npm run dev
```

### 5. Abrir en el navegador
Abre tu navegador y ve a: http://localhost:3000

¡Listo! Ya puedes usar la aplicación.

## Solución de problemas

### Error: "npm no se reconoce..."
- Asegúrate de haber instalado Node.js correctamente
- Reinicia la terminal después de instalar Node.js

### Error: "Puerto 3000 en uso"
- Cierra cualquier aplicación que esté usando el puerto 3000
- O modifica el puerto en package.json: "dev": "next dev -p 3001"

### Error al procesar archivo Excel
- Verifica que el archivo tenga la estructura correcta
- Asegúrate de que tenga las columnas: ID Empleado, Nombre, Departamento, Fecha, Hora

## Acceso al panel de administración

URL: http://localhost:3000/admin

Credenciales:
- Usuario: Deissy
- Contraseña: Meraki 2060

## Editar la base de datos manualmente

La base de datos está en: `data/schedules/database.json`

Puedes editarla con cualquier editor de texto (Notepad++, VSCode, etc.)

**¡IMPORTANTE!**: Asegúrate de mantener el formato JSON válido.

## Detener la aplicación

Presiona `Ctrl + C` en la terminal donde está corriendo.
