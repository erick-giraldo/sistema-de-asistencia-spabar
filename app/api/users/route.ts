import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener todos los usuarios
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('users_simple')
            .select('id, username, full_name, role, is_active, last_login, created_at')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ users: data })
    } catch (error) {
        console.error('Error obteniendo usuarios:', error)
        return NextResponse.json(
            { error: 'Error al obtener usuarios' },
            { status: 500 }
        )
    }
}

// POST - Crear nuevo usuario
export async function POST(request: Request) {
    try {
        const { username, password, full_name, role } = await request.json()

        // Validaciones
        if (!username || !password || !full_name) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Verificar si el usuario ya existe
        const { data: existing } = await supabase
            .from('users_simple')
            .select('id')
            .eq('username', username)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'El nombre de usuario ya está en uso' },
                { status: 400 }
            )
        }

        // Crear usuario
        const { data, error } = await supabase
            .from('users_simple')
            .insert([
                {
                    username,
                    password, // En producción, usar bcrypt
                    full_name,
                    role: role || 'viewer',
                    is_active: true
                }
            ])
            .select()

        if (error) throw error

        return NextResponse.json({
            success: true,
            user: data[0]
        })

    } catch (error) {
        console.error('Error creando usuario:', error)
        return NextResponse.json(
            { error: 'Error al crear usuario' },
            { status: 500 }
        )
    }
}

// PUT - Actualizar usuario
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, full_name, role, is_active } = body

        if (!id) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            )
        }

        const updateData: any = {}
        if (full_name !== undefined) updateData.full_name = full_name
        if (role !== undefined) updateData.role = role
        if (is_active !== undefined) updateData.is_active = is_active

        const { data, error } = await supabase
            .from('users_simple')
            .update(updateData)
            .eq('id', id)
            .select()

        if (error) throw error

        return NextResponse.json({
            success: true,
            user: data[0]
        })

    } catch (error) {
        console.error('Error actualizando usuario:', error)
        return NextResponse.json(
            { error: 'Error al actualizar usuario' },
            { status: 500 }
        )
    }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('users_simple')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error eliminando usuario:', error)
        return NextResponse.json(
            { error: 'Error al eliminar usuario' },
            { status: 500 }
        )
    }
}