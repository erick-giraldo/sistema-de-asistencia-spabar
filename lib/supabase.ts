import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Schedule = {
  id: number
  name: string
  department: string
  entry_time: string
  exit_time: string
  scheduled_hours: number
  created_at?: string
  updated_at?: string
}
