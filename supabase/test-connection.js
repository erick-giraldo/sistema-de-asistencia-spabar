/**
 * Script para verificar la conexión con Supabase
 * 
 * Uso: node supabase/test-connection.js
 */

const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando configuración de Supabase...\n')

// Verificar variables de entorno
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.error('\nPor favor configura las siguientes variables en .env.local:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('\nConsulta supabase/CONFIGURACION-SUPABASE.md para más información')
  process.exit(1)
}

console.log('✅ Variables de entorno encontradas')
console.log(`📍 URL: ${supabaseUrl}`)
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`)

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a Supabase...\n')

    // Intentar obtener datos de la tabla schedules
    const { data, error, count } = await supabase
      .from('schedules')
      .select('*', { count: 'exact' })

    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message)
      console.error('\nPosibles causas:')
      console.error('1. Las credenciales son incorrectas')
      console.error('2. La tabla "schedules" no existe')
      console.error('3. Las políticas RLS no están configuradas correctamente')
      console.error('\nConsulta supabase/CONFIGURACION-SUPABASE.md para configurar la base de datos')
      process.exit(1)
    }

    console.log('✅ ¡Conexión exitosa!\n')
    console.log('=' .repeat(50))
    console.log('📊 INFORMACIÓN DE LA BASE DE DATOS')
    console.log('='.repeat(50))
    console.log(`📋 Total de horarios: ${count}`)
    
    if (data && data.length > 0) {
      console.log('\n📝 Primeros 5 registros:')
      data.slice(0, 5).forEach((schedule, index) => {
        console.log(`\n${index + 1}. ${schedule.name}`)
        console.log(`   - Departamento: ${schedule.department}`)
        console.log(`   - Horario: ${schedule.entry_time} - ${schedule.exit_time}`)
        console.log(`   - Horas: ${schedule.scheduled_hours}h`)
      })
    } else {
      console.log('\n⚠️  La tabla está vacía')
      console.log('   Ejecuta: node supabase/migrate.js para importar datos')
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Todo está configurado correctamente!')
    console.log('='.repeat(50) + '\n')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }
}

testConnection()
