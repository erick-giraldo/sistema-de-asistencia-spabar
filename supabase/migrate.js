/**
 * Script de migración de base de datos local (JSON) a Supabase
 * 
 * Uso:
 * 1. Configura las variables de entorno en .env.local
 * 2. Ejecuta: node supabase/migrate.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.error('Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('🚀 Iniciando migración a Supabase...\n')

  try {
    // Leer archivo JSON local
    const dbPath = path.join(__dirname, '..', 'data', 'schedules', 'database.json')
    const jsonData = fs.readFileSync(dbPath, 'utf-8')
    const database = JSON.parse(jsonData)

    console.log(`📁 Encontrados ${database.schedules.length} horarios en el archivo local\n`)

    // Verificar conexión a Supabase
    const { count, error: countError } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error conectando a Supabase:', countError.message)
      process.exit(1)
    }

    console.log(`📊 Actualmente hay ${count} registros en Supabase\n`)

    // Preguntar al usuario si desea continuar
    if (count > 0) {
      console.log('⚠️  ADVERTENCIA: Ya existen registros en Supabase')
      console.log('Esta migración agregará los registros del JSON sin eliminar los existentes.')
      console.log('Si quieres empezar de cero, elimina primero los registros en Supabase.\n')
    }

    let successCount = 0
    let errorCount = 0

    // Migrar cada horario
    for (const schedule of database.schedules) {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('schedules')
        .select('id')
        .eq('name', schedule.name)
        .single()

      if (existing) {
        console.log(`⏭️  Saltando ${schedule.name} (ya existe)`)
        continue
      }

      // Insertar nuevo registro
      const { data, error } = await supabase
        .from('schedules')
        .insert([
          {
            name: schedule.name,
            department: schedule.department,
            entry_time: schedule.entryTime,
            exit_time: schedule.exitTime,
            scheduled_hours: schedule.scheduledHours
          }
        ])

      if (error) {
        console.error(`❌ Error insertando ${schedule.name}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Migrado: ${schedule.name}`)
        successCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(50))
    console.log(`✅ Exitosos: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📁 Total en JSON: ${database.schedules.length}`)
    console.log('='.repeat(50) + '\n')

    // Verificar resultado final
    const { count: finalCount } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true })

    console.log(`🎉 Migración completada! Total de registros en Supabase: ${finalCount}\n`)

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

// Ejecutar migración
migrate()
