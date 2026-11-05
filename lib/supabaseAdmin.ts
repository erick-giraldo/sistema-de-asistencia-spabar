import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Salta RLS: usar solo en rutas del servidor. La variable no lleva NEXT_PUBLIC_
// para que nunca llegue al navegador.
export function getSupabaseAdmin(): SupabaseClient {
    if (client) return client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    }

    client = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    })
    return client
}
