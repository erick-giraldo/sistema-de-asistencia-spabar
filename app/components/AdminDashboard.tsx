'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ScheduleTable from '@/components/ScheduleTable'
import AddScheduleForm from '@/components/AddScheduleForm'
import Pagination from '@/components/Pagination'
import { Schedule, User, Permissions } from '@/app/types'

type AdminDashboardProps = {
    user: User
    onLogout: () => void
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<Partial<Schedule>>({})
    const [showAddForm, setShowAddForm] = useState(false)
    const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
        name: '',
        department: 'Spabar',
        entryTime: '08:00:00',
        exitTime: '17:00:00',
        scheduledHours: 9
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<keyof Schedule>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const router = useRouter()

    // Control de permisos
    const permissions: Permissions = useMemo(() => {
        return {
            canView: true,
            canAdd: user.role === 'admin' || user.role === 'super_admin',
            canEdit: user.role === 'admin' || user.role === 'super_admin',
            canDelete: user.role === 'super_admin',
        }
    }, [user])

    useEffect(() => {
        loadSchedules()
    }, [])

    const loadSchedules = async () => {
        try {
            const response = await fetch('/api/schedules')
            const data = await response.json()
            setSchedules(data.schedules || [])
        } catch (error) {
            console.error('Error cargando horarios:', error)
        }
    }

    const startEdit = (schedule: Schedule) => {
        if (!permissions.canEdit) {
            alert('No tienes permisos para editar horarios')
            return
        }
        setEditingId(schedule.id)
        setEditForm({ ...schedule })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const saveEdit = async () => {
        if (!editingId || !permissions.canEdit) return

        try {
            const response = await fetch('/api/schedules', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, ...editForm })
            })

            if (response.ok) {
                await loadSchedules()
                setEditingId(null)
                setEditForm({})
                alert('Horario actualizado correctamente')
            }
        } catch (error) {
            console.error('Error actualizando horario:', error)
            alert('Error al actualizar el horario')
        }
    }

    const deleteSchedule = async (id: number) => {
        if (!permissions.canDelete) {
            alert('Solo los Super Administradores pueden eliminar horarios')
            return
        }

        if (!confirm('¿Estás seguro de eliminar este horario? Esta acción no se puede deshacer.')) return

        try {
            const response = await fetch('/api/schedules', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            if (response.ok) {
                await loadSchedules()
                alert('Horario eliminado correctamente')
            }
        } catch (error) {
            console.error('Error eliminando horario:', error)
            alert('Error al eliminar el horario')
        }
    }

    const addSchedule = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!permissions.canAdd) {
            alert('No tienes permisos para agregar horarios')
            return
        }

        try {
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule)
            })

            if (response.ok) {
                await loadSchedules()
                setShowAddForm(false)
                setNewSchedule({
                    name: '',
                    department: 'Spabar',
                    entryTime: '08:00:00',
                    exitTime: '17:00:00',
                    scheduledHours: 9
                })
                alert('Horario agregado correctamente')
            }
        } catch (error) {
            console.error('Error agregando horario:', error)
            alert('Error al agregar el horario')
        }
    }

    const handleSort = (field: keyof Schedule) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const filteredAndSortedSchedules = useMemo(() => {
        let filtered = schedules.filter(schedule =>
            schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schedule.department.toLowerCase().includes(searchTerm.toLowerCase())
        )

        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue
            }

            return 0
        })

        return filtered
    }, [schedules, searchTerm, sortField, sortDirection])

    const totalPages = Math.ceil(filteredAndSortedSchedules.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentSchedules = filteredAndSortedSchedules.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, itemsPerPage])

    const getRoleBadge = (role: string) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role as keyof typeof badges] || badges.viewer
        return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                Panel de Administración
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <p className="text-sm sm:text-base text-gray-600">
                                    Bienvenido, <span className="font-semibold">{user.fullName || user.full_name || user.username}</span>
                                </p>
                                {getRoleBadge(user.role)}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {permissions.canAdd && (
                                <button
                                    onClick={() => router.push('/admin/users')}
                                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                                >
                                    Gestionar Usuarios
                                </button>
                            )}
                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            >
                                Volver al Inicio
                            </button>
                            <button
                                onClick={onLogout}
                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Alerta para viewers */}
                    {user.role === 'viewer' && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                            <p className="font-semibold text-sm">⚠️ Acceso de Solo Lectura</p>
                            <p className="text-xs mt-1">
                                Tienes permisos de visualización únicamente. No puedes editar, agregar o eliminar horarios.
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                            Gestión de Horarios
                        </h2>
                        {permissions.canAdd && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                {showAddForm ? 'Cancelar' : '+ Agregar Nuevo'}
                            </button>
                        )}
                    </div>

                    {/* Add Form */}
                    {showAddForm && permissions.canAdd && (
                        <AddScheduleForm
                            schedule={newSchedule}
                            onChange={setNewSchedule}
                            onSubmit={addSchedule}
                            onCancel={() => setShowAddForm(false)}
                        />
                    )}

                    {/* Search and Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o departamento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                                        Mostrar:
                                    </label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>

                                <div className="text-sm text-gray-600 text-center sm:text-left">
                                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSchedules.length)} de {filteredAndSortedSchedules.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                        <ScheduleTable
                            schedules={currentSchedules}
                            editingId={editingId}
                            editForm={editForm}
                            permissions={permissions}
                            onEdit={startEdit}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            onDelete={deleteSchedule}
                            onEditFormChange={setEditForm}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                        />
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    )
}