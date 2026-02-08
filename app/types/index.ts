export type Transaction = {
    idEmpleado: string
    nombre: string
    departamento: string
    fecha: string
    hora: string
}

export type Schedule = {
    id: number
    name: string
    department: string
    entryTime: string
    exitTime: string
    scheduledHours: number
}

export type AttendanceRecord = {
    nombre: string
    fecha: string
    entradaReal: string
    salidaReal: string
    horasTrabajadas: number
    minTardanza: number
    horasExtra: number
    horasProgramadas: number
    alerta: string
    asistencia: string
    semana: number
}

export type Role = 'admin' | 'viewer' | 'super_admin' | 'moderator'

export type User = {
    id: number
    username: string
    fullName?: string
    full_name?: string
    role: Role
    password?: string
    is_active?: boolean
    last_login?: string | null
    created_at?: string
}

export type CurrentUser = {
    id: number
    username: string
    fullName: string
    role: Role
}

export type Permissions = {
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
}