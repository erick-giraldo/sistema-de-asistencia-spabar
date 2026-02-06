import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Login
export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        // Opción 1: Usando tabla users_simple (desarrollo/demo)
        const { data, error } = await supabase
            .from('users_simple')
            .select('id, username, full_name, role')
            .eq('username', username)
            .eq('password', password)
            .eq('is_active', true)
            .single()

        if (error || !data) {
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

        // Retornar datos del usuario
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

// GET - Verificar sesión (opcional)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID requerido' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('users_simple')
            .select('id, username, full_name, role')
            .eq('id', userId)
            .eq('is_active', true)
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        return NextResponse.json({
            user: {
                id: data.id,
                username: data.username,
                fullName: data.full_name,
                role: data.role
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