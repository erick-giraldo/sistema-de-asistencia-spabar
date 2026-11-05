'use client'

import { useState, useEffect, useMemo } from 'react'
import AppHeader from '@/components/AppHeader'
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

    const total = filteredAndSortedSchedules.length

    return (
        <div className="page-shell">
            <AppHeader
                current="horarios"
                user={{ name: user.fullName || user.full_name || user.username, role: user.role }}
                canManageUsers={permissions.canAdd}
                onLogout={onLogout}
            />

            <main className="page-main">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <h1 className="page-title">Horarios</h1>
                    {permissions.canAdd && (
                        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                            {showAddForm ? 'Cerrar' : 'Agregar horario'}
                        </button>
                    )}
                </div>

                {user.role === 'viewer' && (
                    <p className="mt-8 text-sm text-spa-muted">
                        <span className="text-spa-text">Acceso de solo lectura.</span> No puedes editar, agregar ni eliminar horarios.
                    </p>
                )}

                {showAddForm && permissions.canAdd && (
                    <AddScheduleForm
                        schedule={newSchedule}
                        onChange={setNewSchedule}
                        onSubmit={addSchedule}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                <section aria-label="Lista de horarios" className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-spa-line pb-4">
                        <div className="max-w-[480px] flex-[1_1_320px]">
                            <label htmlFor="buscar-horario" className="field-label">Buscar</label>
                            <input
                                id="buscar-horario"
                                type="search"
                                placeholder="Nombre o departamento"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="field border-b-0 text-lg"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <label htmlFor="horarios-por-pagina" className="text-sm text-spa-muted">Mostrar</label>
                                <select
                                    id="horarios-por-pagina"
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="field w-14 font-mono text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <p className="text-sm text-spa-muted">
                                {total === 0 ? (
                                    <><span className="font-mono text-spa-text">0</span> horarios</>
                                ) : (
                                    <>
                                        <span className="font-mono text-spa-text">{startIndex + 1}–{Math.min(endIndex, total)}</span>
                                        {' de '}
                                        <span className="font-mono text-spa-text">{total}</span> horarios
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

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

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </section>
            </main>
        </div>
    )
}
