# Ejemplos y Casos de Uso

## Formato de Archivo de Entrada

### Estructura Esperada del Excel

El archivo debe tener esta estructura (puede tener columnas adicionales que serán ignoradas):

| ID Empleado | Nombre | Departamento | Fecha | Hora | ... |
|------------|---------|--------------|-----------|----------|-----|
| 9 | Emily | Spabar | 2026-02-03 | 08:00:00 | ... |
| 9 | Emily | Spabar | 2026-02-03 | 17:00:00 | ... |
| 10 | Liliana | Spabar | 2026-02-03 | 10:05:00 | ... |
| 10 | Liliana | Spabar | 2026-02-03 | 19:02:00 | ... |

### Ejemplo Real

```
ID Empleado: 9
Nombre: Emily
Departamento: Spabar
Fecha: 2026-02-03
Hora Entrada: 08:15:00
Hora Salida: 17:05:00

Horario Programado:
- Entrada: 08:00:00
- Salida: 17:00:00
- Horas: 9

Resultado:
- Horas Trabajadas: 8.83h
- Tardanza: 15 minutos
- Horas Extra: 0h (trabajó menos de lo programado)
- Alerta: (ninguna, tardanza < 30 min)
```

## Casos de Uso

### Caso 1: Empleado Puntual
```
Entrada Real: 08:00:00
Salida Real: 17:00:00
Entrada Programada: 08:00:00
Horas Programadas: 9

Resultado:
✅ Horas Trabajadas: 9h
✅ Tardanza: 0 minutos
✅ Horas Extra: 0h
✅ Sin alertas
```

### Caso 2: Tardanza Leve
```
Entrada Real: 08:20:00
Salida Real: 17:00:00
Entrada Programada: 08:00:00
Horas Programadas: 9

Resultado:
⚠️ Horas Trabajadas: 8.67h
⚠️ Tardanza: 20 minutos
✅ Horas Extra: 0h
✅ Sin alertas (tardanza < 30 min)
```

### Caso 3: Tardanza Grave
```
Entrada Real: 08:45:00
Salida Real: 17:00:00
Entrada Programada: 08:00:00
Horas Programadas: 9

Resultado:
❌ Horas Trabajadas: 8.25h
❌ Tardanza: 45 minutos
✅ Horas Extra: 0h
🚨 ALERTA: "TARDANZA GRAVE"
```

### Caso 4: Horas Extra
```
Entrada Real: 08:00:00
Salida Real: 19:00:00
Entrada Programada: 08:00:00
Horas Programadas: 9

Resultado:
✅ Horas Trabajadas: 11h
✅ Tardanza: 0 minutos
💪 Horas Extra: 2h
✅ Sin alertas
```

### Caso 5: Jornada Extendida (12 horas)
```
Entrada Real: 09:00:00
Salida Real: 21:00:00
Entrada Programada: 09:00:00
Horas Programadas: 12

Resultado:
✅ Horas Trabajadas: 12h
✅ Tardanza: 0 minutos
✅ Horas Extra: 0h
✅ Sin alertas
```

## Múltiples Marcaciones

Si un empleado hace múltiples marcaciones en el día, el sistema:
- Toma la PRIMERA marcación como hora de entrada
- Toma la ÚLTIMA marcación como hora de salida

### Ejemplo:
```
Empleado: Emily
Fecha: 2026-02-03

Marcaciones:
08:00:00 ← Primera (ENTRADA)
12:30:00
13:30:00
17:00:00 ← Última (SALIDA)
21:10:01

Resultado:
Entrada: 08:00:00
Salida: 21:10:01
Horas Trabajadas: 13.17h
```

## Gestión de Horarios en el Panel Admin

### Agregar Nuevo Empleado
1. Ir a Panel Admin (http://localhost:3000/admin)
2. Iniciar sesión
3. Clic en "Agregar Nuevo"
4. Llenar el formulario:
   - Nombre: María
   - Departamento: Spabar
   - Hora Entrada: 08:00
   - Hora Salida: 17:00
   - Horas Programadas: 9
5. Clic en "Guardar Nuevo Horario"

### Editar Horario Existente
1. Buscar el empleado en la tabla
2. Clic en "Editar"
3. Modificar los campos necesarios
4. Clic en "Guardar"

### Eliminar Horario
1. Buscar el empleado en la tabla
2. Clic en "Eliminar"
3. Confirmar la acción

## Exportación de Resultados

El archivo Excel generado incluye:

| Columna | Descripción |
|---------|-------------|
| Nombre | Nombre del empleado |
| Fecha | Fecha de asistencia |
| Entrada Real | Hora de primera marcación |
| Salida Real | Hora de última marcación |
| Horas Trabajadas | Total de horas (Salida - Entrada) |
| Min Tardanza | Minutos de tardanza |
| Horas Extra | Horas adicionales trabajadas |
| Horas Programadas | Horas que debía trabajar |
| Alerta | "TARDANZA GRAVE" si > 30 min |
| Asistencia | Siempre "ASISTIÓ" |
| Semana | Número de semana ISO |

## Notas Importantes

1. **Fechas**: El sistema acepta fechas en formato YYYY-MM-DD o formatos reconocidos por Excel
2. **Horas**: Las horas deben estar en formato HH:MM:SS o HH:MM
3. **Nombres**: Deben coincidir exactamente con los nombres en la base de datos
4. **Departamento**: Se usa como filtro adicional pero no es obligatorio para el cálculo
5. **Semana ISO**: Se calcula según el estándar ISO 8601 (semana comienza en lunes)

## Solución de Problemas Comunes

### El empleado no aparece en el reporte
- Verifica que el nombre en el Excel coincida exactamente con el de la base de datos
- Revisa que las fechas y horas sean válidas

### Las horas calculadas son incorrectas
- Verifica que las marcaciones estén en la misma fecha
- Confirma que el formato de hora sea correcto

### "Tardanza Grave" cuando no debería
- Revisa la hora de entrada programada en el panel admin
- Verifica que la zona horaria sea correcta

### No se generan horas extra
- Las horas extra solo se calculan cuando se trabaja MÁS de las horas programadas
- Verifica que las horas programadas estén correctas en el panel admin
