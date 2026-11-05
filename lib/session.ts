import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { Role } from '@/app/types'

const SESSION_COOKIE = 'spabar_session'
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

export type SessionUser = {
    id: number
    username: string
    full_name: string
    role: Role
}

function sign(payload: string): Buffer {
    const secret = process.env.SESSION_SECRET
    if (!secret || secret.length < 32) {
        throw new Error('SESSION_SECRET debe tener al menos 32 caracteres')
    }
    return createHmac('sha256', secret).update(payload).digest()
}

function readUserId(token: string): number | null {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expected = sign(payload)
    const received = Buffer.from(signature, 'base64url')
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null

    try {
        const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
        return typeof exp === 'number' && exp > Date.now() / 1000 ? uid : null
    } catch {
        return null
    }
}

export function startSession(userId: number) {
    const payload = Buffer.from(JSON.stringify({
        uid: userId,
        exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
    })).toString('base64url')

    cookies().set(SESSION_COOKIE, `${payload}.${sign(payload).toString('base64url')}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS
    })
}

export function endSession() {
    cookies().delete(SESSION_COOKIE)
}

// Consulta la base en cada llamada para que un cambio de rol o una
// desactivación tengan efecto de inmediato.
export async function getSessionUser(): Promise<SessionUser | null> {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!token) return null

    const userId = readUserId(token)
    if (userId === null) return null

    const { data, error } = await getSupabaseAdmin()
        .from('users_simple')
        .select('id, username, full_name, role')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle()

    if (error) throw error
    return data as SessionUser | null
}

export async function requireRole(
    ...roles: Role[]
): Promise<{ user: SessionUser; denied?: never } | { user?: never; denied: NextResponse }> {
    const user = await getSessionUser()
    if (!user) {
        return { denied: NextResponse.json({ error: 'Sesión no válida' }, { status: 401 }) }
    }
    if (!roles.includes(user.role)) {
        return { denied: NextResponse.json({ error: 'No tienes permisos para esta acción' }, { status: 403 }) }
    }
    return { user }
}
