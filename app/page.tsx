'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { format, parseISO, differenceInMinutes, getWeek } from 'date-fns'

type Transaction = {
  idEmpleado: string
  nombre: string
  departamento: string
  fecha: string
  hora: string
}

type Schedule = {
  id: number
  name: string
  department: string
  entryTime: string
  exitTime: string
  scheduledHours: number
}

type AttendanceRecord = {
  nombre: string
  fecha: string
  entradaReal: string
  salidaReal: string
  horasTrabajadas: number
  minTardanza: number
  horasExtra: number
  horasProgramadas: number
  alerta: string
  asistencia: string
  semana: number
}

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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Asistencia Spabar</h1>
            <p className="text-gray-600">Procesa archivos de transacciones y genera reportes de asistencia</p>
          </div>
          <a
            href="/admin"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Panel Admin
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Subir Archivo de Transacciones</h2>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Selecciona el archivo Excel (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2.5"
            />
          </div>

          <button
            onClick={processFile}
            disabled={!file || processing}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : 'Procesar Archivo'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Resultado del Análisis</h2>
              <button
                onClick={downloadResult}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Descargar Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hrs Trab</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tardanza</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hrs Extra</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alerta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semana</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.map((record, idx) => (
                    <tr key={idx} className={record.alerta ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 text-sm">{record.nombre}</td>
                      <td className="px-4 py-3 text-sm">{record.fecha}</td>
                      <td className="px-4 py-3 text-sm">{record.entradaReal}</td>
                      <td className="px-4 py-3 text-sm">{record.salidaReal}</td>
                      <td className="px-4 py-3 text-sm">{record.horasTrabajadas}h</td>
                      <td className="px-4 py-3 text-sm">{record.minTardanza}m</td>
                      <td className="px-4 py-3 text-sm">{record.horasExtra}h</td>
                      <td className="px-4 py-3 text-sm">
                        {record.alerta && (
                          <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded">
                            {record.alerta}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{record.semana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
