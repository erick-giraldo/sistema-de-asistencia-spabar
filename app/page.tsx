'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { format, parseISO, differenceInMinutes, getWeek } from 'date-fns'
import AttendanceTable from '@/components/AttendanceTable'
import { Transaction, Schedule, AttendanceRecord } from '@/app/types'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
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

      // Encontrar el encabezado
      let headerRow = -1
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === 'ID Empleado' || data[i][0] === 'Empleado ID') {
          headerRow = i
          break
        }
      }

      if (headerRow === -1) {
        alert('No se encontró el encabezado en el archivo')
        setProcessing(false)
        return
      }

      // Parsear transacciones
      const transactions: Transaction[] = []
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i]
        if (row[1] && row[3] && row[4]) {
          transactions.push({
            idEmpleado: String(row[0]),
            nombre: String(row[1]),
            departamento: String(row[2]),
            fecha: String(row[3]),
            hora: String(row[4])
          })
        }
      }

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
      'Horas Trabajadas': r.horasTrabajadas,
      'Min Tardanza': r.minTardanza,
      'Horas Extra': r.horasExtra,
      'Horas Programadas': r.horasProgramadas,
      'Alerta': r.alerta,
      'Asistencia': r.asistencia,
      'Semana': r.semana
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia_Detallada')
    XLSX.writeFile(wb, 'Asistencia_Detallada.xlsx')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Sistema de Asistencia Spabar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Procesa archivos de transacciones y genera reportes de asistencia
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Panel Admin
            </a>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Subir Archivo de Transacciones
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona el archivo Excel (.xlsx)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Archivo seleccionado: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            <button
              onClick={processFile}
              disabled={!file || processing}
              className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Procesar Archivo'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Resultado del Análisis
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {result.length} registro{result.length !== 1 ? 's' : ''} procesado{result.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={downloadResult}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Excel
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <AttendanceTable records={result} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}