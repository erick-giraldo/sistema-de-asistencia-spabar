import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

const USE_LOCAL_DB = process.env.USE_LOCAL_DB === 'true'
const DB_PATH = path.join(process.cwd(), 'data', 'schedules', 'database.json')

// GET - Obtener todos los horarios
export async function GET() {
  try {
    if (USE_LOCAL_DB) {
      // Usar base de datos local JSON
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      const database = JSON.parse(data)
      return NextResponse.json(database)
    } else {
      // Usar Supabase
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      // Transformar nombres de columnas de snake_case a camelCase
      const schedules = data.map(item => ({
        id: item.id,
        name: item.name,
        department: item.department,
        entryTime: item.entry_time,
        exitTime: item.exit_time,
        scheduledHours: item.scheduled_hours
      }))

      return NextResponse.json({ schedules })
    }
  } catch (error) {
    console.error('Error reading schedules:', error)
    return NextResponse.json({ error: 'Error loading schedules' }, { status: 500 })
  }
}

// POST - Crear nuevo horario
export async function POST(request: Request) {
  try {
    const newSchedule = await request.json()

    if (USE_LOCAL_DB) {
      // Usar base de datos local JSON
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      const database = JSON.parse(data)

      const maxId = database.schedules.reduce((max: number, s: any) => Math.max(max, s.id), 0)
      newSchedule.id = maxId + 1

      database.schedules.push(newSchedule)
      fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2))

      return NextResponse.json({ success: true, schedule: newSchedule })
    } else {
      // Usar Supabase
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            name: newSchedule.name,
            department: newSchedule.department,
            entry_time: newSchedule.entryTime,
            exit_time: newSchedule.exitTime,
            scheduled_hours: newSchedule.scheduledHours
          }
        ])
        .select()

      if (error) throw error

      const schedule = {
        id: data[0].id,
        name: data[0].name,
        department: data[0].department,
        entryTime: data[0].entry_time,
        exitTime: data[0].exit_time,
        scheduledHours: data[0].scheduled_hours
      }

      return NextResponse.json({ success: true, schedule })
    }
  } catch (error) {
    console.error('Error adding schedule:', error)
    return NextResponse.json({ error: 'Error adding schedule' }, { status: 500 })
  }
}

// PUT - Actualizar horario
export async function PUT(request: Request) {
  try {
    const updatedSchedule = await request.json()

    if (USE_LOCAL_DB) {
      // Usar base de datos local JSON
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      const database = JSON.parse(data)

      const index = database.schedules.findIndex((s: any) => s.id === updatedSchedule.id)
      if (index !== -1) {
        database.schedules[index] = updatedSchedule
        fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2))
        return NextResponse.json({ success: true, schedule: updatedSchedule })
      }

      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    } else {
      // Usar Supabase
      const { data, error } = await supabase
        .from('schedules')
        .update({
          name: updatedSchedule.name,
          department: updatedSchedule.department,
          entry_time: updatedSchedule.entryTime,
          exit_time: updatedSchedule.exitTime,
          scheduled_hours: updatedSchedule.scheduledHours
        })
        .eq('id', updatedSchedule.id)
        .select()

      if (error) throw error

      const schedule = {
        id: data[0].id,
        name: data[0].name,
        department: data[0].department,
        entryTime: data[0].entry_time,
        exitTime: data[0].exit_time,
        scheduledHours: data[0].scheduled_hours
      }

      return NextResponse.json({ success: true, schedule })
    }
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Error updating schedule' }, { status: 500 })
  }
}

// DELETE - Eliminar horario
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (USE_LOCAL_DB) {
      // Usar base de datos local JSON
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      const database = JSON.parse(data)

      database.schedules = database.schedules.filter((s: any) => s.id !== id)
      fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2))

      return NextResponse.json({ success: true })
    } else {
      // Usar Supabase
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Error deleting schedule' }, { status: 500 })
  }
}

