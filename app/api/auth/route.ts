import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword, verifyPassword } from '@/lib/password'
import { endSession, getSessionUser, startSession } from '@/lib/session'

// Iguala el tiempo de respuesta cuando el usuario no existe.
const dummyHash = hashPassword('usuario-inexistente')

// POST - Login
export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('users_simple')
            .select('id, username, full_name, role, password')
            .eq('username', username)
            .eq('is_active', true)
            .maybeSingle()

        if (error) throw error

        const isValid = await verifyPassword(password, data?.password ?? await dummyHash)

        if (!data || !isValid) {
            return NextResponse.json(
                { error: 'Usuario o contraseña incorrectos' },
                { status: 401 }
            )
        }

        // Actualizar last_login
        await supabase
            .from('users_simple')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.id)

        startSession(data.id)

        return NextResponse.json({
            success: true,
            user: {
                id: data.id,
                username: data.username,
                fullName: data.full_name,
                role: data.role
            }
        })

    } catch (error) {
        console.error('Error en login:', error)
        return NextResponse.json(
            { error: 'Error al procesar el login' },
            { status: 500 }
        )
    }
}

// GET - Verificar sesión
export async function GET() {
    try {
        const user = await getSessionUser()

        if (!user) {
            return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 })
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role
            }
        })

    } catch (error) {
        console.error('Error verificando sesión:', error)
        return NextResponse.json(
            { error: 'Error al verificar sesión' },
            { status: 500 }
        )
    }
}

// DELETE - Cerrar sesión
export async function DELETE() {
    endSession()
    return NextResponse.json({ success: true })
}
