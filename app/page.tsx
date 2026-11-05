'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { format, parseISO, differenceInMinutes, getWeek } from 'date-fns'
import AppHeader from '@/components/AppHeader'
import AttendanceTable from '@/components/AttendanceTable'
import { Transaction, Schedule, AttendanceRecord } from '@/app/types'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  console.log("🚀 ~ Home ~ processing:", processing)
  const [result, setResult] = useState<AttendanceRecord[] | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const processFile = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

      // Encontrar el encabezado sin usar bucles for
      const headerRow = data.findIndex(
        (row) => row[0] === 'ID Empleado' || row[0] === 'Empleado ID'
      )

      if (headerRow === -1) {
        alert('No se encontró el encabezado en el archivo')
        setProcessing(false)
        return
      }

      // Encontrar índices de columnas dinámicamente (sin for)
      const headers = data[headerRow]
      const normalized = headers.map((h: any) => String(h ?? '').toLowerCase().trim())
      const idEmpleadoIdx = normalized.findIndex((h: string) => h.includes('id') && h.includes('empleado'))
      const nombreIdx = normalized.findIndex((h: string) => h === 'nombre')
      const departamentoIdx = normalized.findIndex((h: string) => h === 'departamento')
      const fechaIdx = normalized.findIndex((h: string) => h === 'fecha')
      const horaIdx = normalized.findIndex((h: string) => h === 'hora')

      // Validar que se encontraron todas las columnas necesarias
      if (nombreIdx === -1 || fechaIdx === -1 || horaIdx === -1) {
        alert('No se encontraron todas las columnas necesarias. Se requieren: Nombre, Fecha y Hora')
        setProcessing(false)
        return
      }

      // Parsear transacciones (sin for)
      const rows = data.slice(headerRow + 1)
      const transactions: Transaction[] = rows
        .map((row, idx) =>
          row && row[nombreIdx] && row[fechaIdx] && row[horaIdx]
            ? ({
                idEmpleado: idEmpleadoIdx !== -1 ? String(row[idEmpleadoIdx]) : `${idx + headerRow + 1}`,
                nombre: String(row[nombreIdx]),
                departamento: departamentoIdx !== -1 ? String(row[departamentoIdx]) : 'N/A',
                fecha: String(row[fechaIdx]),
                hora: String(row[horaIdx])
              } as Transaction)
            : null
        )
        .filter((t): t is Transaction => Boolean(t))

      // Obtener horarios
      const schedulesResponse = await fetch('/api/schedules')
      const schedulesData = await schedulesResponse.json()
      const schedules: Schedule[] = schedulesData.schedules

      // Agrupar por empleado y fecha
      const grouped = new Map<string, { entrada: Date | null, salida: Date | null }>()

      transactions.forEach(t => {
        const key = `${t.nombre}|${t.fecha}`
        const dateTime = new Date(`${t.fecha} ${t.hora}`)

        if (!grouped.has(key)) {
          grouped.set(key, { entrada: dateTime, salida: dateTime })
        } else {
          const current = grouped.get(key)!
          if (dateTime < current.entrada!) current.entrada = dateTime
          if (dateTime > current.salida!) current.salida = dateTime
        }
      })

      // Calcular asistencia
      const attendance: AttendanceRecord[] = []

      grouped.forEach((value, key) => {
        const [nombre, fecha] = key.split('|')
        const schedule = schedules.find(s => s.name === nombre)

        if (!schedule || !value.entrada || !value.salida) return

        const entradaReal = value.entrada
        const salidaReal = value.salida

        // Crear fecha programada de entrada
        const [hh, mm, ss] = schedule.entryTime.split(':')
        const entradaProg = new Date(fecha)
        entradaProg.setHours(parseInt(hh), parseInt(mm), parseInt(ss))

        const horasTrabajadas = (salidaReal.getTime() - entradaReal.getTime()) / (1000 * 60 * 60)
        const minTardanza = Math.max(0, differenceInMinutes(entradaReal, entradaProg))
        const horasExtra = Math.max(0, horasTrabajadas - schedule.scheduledHours)

        attendance.push({
          nombre,
          fecha,
          entradaReal: format(entradaReal, 'HH:mm:ss'),
          salidaReal: format(salidaReal, 'HH:mm:ss'),
          horasTrabajadas: parseFloat(horasTrabajadas.toFixed(2)),
          minTardanza,
          horasExtra: parseFloat(horasExtra.toFixed(2)),
          horasProgramadas: schedule.scheduledHours,
          alerta: minTardanza > 30 ? 'TARDANZA GRAVE' : '',
          asistencia: 'ASISTIÓ',
          semana: getWeek(parseISO(fecha), { weekStartsOn: 1 })
        })
      })

      // Ordenar por nombre y fecha
      attendance.sort((a, b) => {
        if (a.nombre !== b.nombre) return a.nombre.localeCompare(b.nombre)
        return a.fecha.localeCompare(b.fecha)
      })

      setResult(attendance)
    } catch (error) {
      console.error('Error procesando archivo:', error)
      alert('Error al procesar el archivo. Verifica que sea un archivo Excel válido.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadResult = () => {
    if (!result) return

    const ws = XLSX.utils.json_to_sheet(result.map(r => ({
      'Nombre': r.nombre,
      'Fecha': r.fecha,
      'Entrada Real': r.entradaReal,
      'Salida Real': r.salidaReal,
      'Horas Trabajadas': r.horasTrabajadas, // convertido a formato horas abajo
      'Tardanza (Horas)': r.minTardanza,     // convertido a formato horas abajo
      'Horas Extra': r.horasExtra,
      'Horas Programadas': r.horasProgramadas,
      'Alerta': r.alerta,
      'Asistencia': r.asistencia,
      'Semana': r.semana
    })))

    // Formatear columnas E (Horas Trabajadas), F (Tardanza) y G (Horas Extra) como horas con segundos
    // E, F, G corresponden a índices 4, 5 y 6 (0-based)
    result.forEach((r, i) => {
      const eAddr = XLSX.utils.encode_cell({ c: 4, r: i + 1 })
      const fAddr = XLSX.utils.encode_cell({ c: 5, r: i + 1 })
      const gAddr = XLSX.utils.encode_cell({ c: 6, r: i + 1 })
      const horasTrab = r.horasTrabajadas
      const tardanzaMin = r.minTardanza
      const horasExtra = r.horasExtra
      ;(ws as any)[eAddr] = { t: 'n', v: horasTrab / 24, z: '[h]:mm:ss' }
      ;(ws as any)[fAddr] = { t: 'n', v: (tardanzaMin / 60) / 24, z: '[h]:mm:ss' }
      ;(ws as any)[gAddr] = { t: 'n', v: horasExtra / 24, z: '[h]:mm:ss' }
    })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia_Detallada')
    XLSX.writeFile(wb, 'Asistencia_Detallada.xlsx')
  }

  const alertCount = result ? result.filter((record) => record.alerta).length : 0

  return (
    <div className="page-shell">
      <AppHeader current="asistencia" />

      <main className="page-main">
        <h1 className="page-title">Asistencia</h1>
        <p className="mt-5 max-w-[560px] text-lg leading-normal text-spa-muted">
          Procesa archivos de transacciones y genera reportes de asistencia.
        </p>

        <section aria-label="Subir archivo" className="mt-14 flex flex-wrap items-stretch gap-3">
          <label className="relative flex min-h-16 min-w-0 flex-[999_1_420px] cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-spa-strong px-6 py-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-spa-text hover:border-spa-hover">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="sr-only"
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[13px] text-spa-muted">Archivo Excel de transacciones (.xlsx)</span>
              <span className={file ? 'break-all font-mono text-[15px]' : 'text-[15px] text-spa-faint'}>
                {file ? file.name : 'Ningún archivo seleccionado'}
              </span>
            </span>
            <span className="whitespace-nowrap text-sm">Seleccionar</span>
          </label>

          <Button
            onClick={processFile}
            size="xl"
            variant="primary"
            loading={processing}
            disabled={!file || processing}
            loadingText="Procesando..."
            className="min-h-16 flex-[1_1_200px]"
          >
            Procesar archivo
          </Button>
        </section>

        {result && (
          <section aria-labelledby="resultado" className="mt-[72px]">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-spa-line pb-6">
              <div>
                <h2 id="resultado" className="text-[28px] tracking-[-0.02em]">Resultado del análisis</h2>
                <p className="mt-2 text-sm text-spa-muted">
                  <span className="font-mono text-spa-text">{result.length}</span> registro{result.length !== 1 ? 's' : ''} procesado{result.length !== 1 ? 's' : ''}
                  {' · '}
                  <span className="font-mono text-spa-alert">{alertCount}</span> con alerta
                </p>
              </div>
              <button onClick={downloadResult} className="btn-ghost">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11" />
                </svg>
                Descargar Excel
              </button>
            </div>

            <AttendanceTable records={result} />
          </section>
        )}
      </main>
    </div>
  )
}
