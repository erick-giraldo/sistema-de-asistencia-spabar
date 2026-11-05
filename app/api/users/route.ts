import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword } from '@/lib/password'
import { requireRole } from '@/lib/session'

// Nunca incluye la columna password.
const PUBLIC_COLUMNS = 'id, username, full_name, role, is_active, last_login, created_at'
const VALID_ROLES = ['viewer', 'moderator', 'admin', 'super_admin']

function forbidden(message: string) {
    return NextResponse.json({ error: message }, { status: 403 })
}

// GET - Obtener todos los usuarios
export async function GET() {
    try {
        const { denied } = await requireRole('admin', 'super_admin')
        if (denied) return denied

        const { data, error } = await getSupabaseAdmin()
            .from('users_simple')
            .select(PUBLIC_COLUMNS)
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
        const { user: currentUser, denied } = await requireRole('admin', 'super_admin')
        if (denied) return denied

        const { username, password, full_name, role } = await request.json()
        const newRole = role || 'viewer'

        // Validaciones
        if (typeof username !== 'string' || typeof password !== 'string' || !username || !password || !full_name) {
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

        if (!VALID_ROLES.includes(newRole)) {
            return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
        }

        if (newRole === 'super_admin' && currentUser.role !== 'super_admin') {
            return forbidden('Solo un Super Admin puede asignar ese rol')
        }

        const supabase = getSupabaseAdmin()

        // Verificar si el usuario ya existe
        const { data: existing, error: existingError } = await supabase
            .from('users_simple')
            .select('id')
            .eq('username', username)
            .maybeSingle()

        if (existingError) throw existingError

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
                    password: await hashPassword(password),
                    full_name,
                    role: newRole,
                    is_active: true
                }
            ])
            .select(PUBLIC_COLUMNS)

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
        const { user: currentUser, denied } = await requireRole('admin', 'super_admin')
        if (denied) return denied

        const body = await request.json()
        const { id, full_name, role, is_active } = body

        if (!id) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            )
        }

        if (role !== undefined && !VALID_ROLES.includes(role)) {
            return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
        }

        if (is_active === false && id === currentUser.id) {
            return forbidden('No puedes desactivar tu propio usuario')
        }

        const supabase = getSupabaseAdmin()

        if (currentUser.role !== 'super_admin') {
            if (role === 'super_admin') {
                return forbidden('Solo un Super Admin puede asignar ese rol')
            }

            const { data: target, error: targetError } = await supabase
                .from('users_simple')
                .select('role')
                .eq('id', id)
                .maybeSingle()

            if (targetError) throw targetError

            if (target?.role === 'super_admin') {
                return forbidden('Solo un Super Admin puede modificar a otro Super Admin')
            }
        }

        const updateData: any = {}
        if (full_name !== undefined) updateData.full_name = full_name
        if (role !== undefined) updateData.role = role
        if (is_active !== undefined) updateData.is_active = is_active

        const { data, error } = await supabase
            .from('users_simple')
            .update(updateData)
            .eq('id', id)
            .select(PUBLIC_COLUMNS)

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
        const { user: currentUser, denied } = await requireRole('super_admin')
        if (denied) return denied

        const { id } = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            )
        }

        if (id === currentUser.id) {
            return forbidden('No puedes eliminar tu propio usuario')
        }

        const { error } = await getSupabaseAdmin()
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
