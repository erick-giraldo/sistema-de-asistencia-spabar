/**
 * Administra las contraseñas de users_simple. Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local.
 *
 * Ver usuarios y el estado de su contraseña:  node supabase/set-password.js
 * Cambiar una contraseña:                     node supabase/set-password.js <usuario>
 *
 * La contraseña se pide por teclado para que no quede en el historial de la terminal.
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')
const { hashPassword, isPasswordHash } = require('../lib/password')

require('dotenv').config({ path: '.env.local', quiet: true })

const MIN_LENGTH = 10

function fail(message) {
  console.error(`❌ ${message}`)
  process.exit(1)
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    // Silencia el eco del teclado; la pregunta se escribe aparte.
    rl._writeToOutput = () => {}
    process.stdout.write(question)
    rl.question('', (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function listUsers(supabase) {
  const { data, error } = await supabase
    .from('users_simple')
    .select('username, role, is_active, password')
    .order('username')

  if (error) fail(error.message)

  for (const user of data) {
    const state = isPasswordHash(user.password) ? 'hash' : 'TEXTO PLANO'
    console.log(`${user.username} | ${user.role} | ${user.is_active ? 'activo' : 'inactivo'} | ${state}`)
  }
}

async function setPassword(supabase, username) {
  if (!process.stdin.isTTY) {
    fail('Ejecuta este comando directamente en tu terminal para poder escribir la contraseña.')
  }

  const password = await askHidden(`Nueva contraseña para ${username}: `)
  if (password.length < MIN_LENGTH) fail(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`)

  const confirmation = await askHidden('Repite la contraseña: ')
  if (password !== confirmation) fail('Las contraseñas no coinciden.')

  const { data, error } = await supabase
    .from('users_simple')
    .update({ password: await hashPassword(password) })
    .eq('username', username)
    .select('username')

  if (error) fail(error.message)
  if (data.length === 0) fail(`No existe el usuario "${username}".`)

  console.log(`✅ Contraseña actualizada para ${username}`)
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) fail('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.')

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const username = process.argv[2]
  if (username) await setPassword(supabase, username)
  else await listUsers(supabase)
}

main()
