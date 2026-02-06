'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Schedule = {
    id: number
    name: string
    department: string
    entryTime: string
    exitTime: string
    scheduledHours: number
}

type User = {
    id: number
    username: string
    fullName: string
    role: 'admin' | 'viewer' | 'super_admin'
}

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
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

    // ============================================
    // CONTROL DE PERMISOS BASADO EN ROL
    // ============================================
    const permissions = useMemo(() => {
        if (!user) return { canView: false, canAdd: false, canEdit: false, canDelete: false }

        return {
            canView: true, // Todos pueden ver
            canAdd: user.role === 'admin' || user.role === 'super_admin',
            canEdit: user.role === 'admin' || user.role === 'super_admin',
            canDelete: user.role === 'super_admin', // Solo super_admin puede eliminar
        }
    }, [user])

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const storedUser = sessionStorage.getItem('user')

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser)
                setUser(userData)
                setAuthenticated(true)
                await loadSchedules()
            } catch (error) {
                console.error('Error parsing user data:', error)
                sessionStorage.removeItem('user')
            }
        }

        setIsLoading(false)
    }

    const loadSchedules = async () => {
        try {
            const response = await fetch('/api/schedules')
            const data = await response.json()
            setSchedules(data.schedules)
        } catch (error) {
            console.error('Error cargando horarios:', error)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setUser(data.user)
                setAuthenticated(true)
                sessionStorage.setItem('user', JSON.stringify(data.user))
                await loadSchedules()
            } else {
                setLoginError(data.error || 'Usuario o contraseña incorrectos')
            }
        } catch (error) {
            console.error('Error en login:', error)
            setLoginError('Error al conectar con el servidor')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        setAuthenticated(false)
        setUser(null)
        sessionStorage.removeItem('user')
        setUsername('')
        setPassword('')
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

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    // Función para obtener el badge de rol
    const getRoleBadge = (role: string) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role as keyof typeof badges] || badges.viewer
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.text}</span>
    }

    if (isLoading && !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                <div className="text-white text-2xl">Cargando...</div>
            </div>
        )
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Panel de Administración</h1>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                                placeholder="Deissy"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                                placeholder="Meraki 2060"
                                disabled={isLoading}
                            />
                        </div>

                        {loginError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                    <button
                        onClick={() => router.push('/')}
                        disabled={isLoading}
                        className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
                        {user && (
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-600">
                                    Bienvenido, <span className="font-semibold">{user.fullName || user.username}</span>
                                </p>
                                {getRoleBadge(user.role)}
                            </div>
                        )}
                    </div>
                    <div className="space-x-4 flex items-center">
                        {permissions.canAdd && (
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Gestionar Usuarios
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            Volver al Inicio
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Alerta de permisos limitados para viewers */}
                {user?.role === 'viewer' && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                        <p className="font-semibold">⚠️ Acceso de Solo Lectura</p>
                        <p className="text-sm">Tienes permisos de visualización únicamente. No puedes editar, agregar o eliminar horarios.</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Gestión de Horarios</h2>
                        {permissions.canAdd && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                {showAddForm ? 'Cancelar' : 'Agregar Nuevo'}
                            </button>
                        )}
                    </div>

                    {showAddForm && permissions.canAdd && (
                        <form onSubmit={addSchedule} className="mb-8 p-6 bg-green-50 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">Nuevo Horario</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={newSchedule.name}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Departamento</label>
                                    <input
                                        type="text"
                                        value={newSchedule.department}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, department: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hora de Entrada</label>
                                    <input
                                        type="time"
                                        step="1"
                                        value={newSchedule.entryTime?.substring(0, 5)}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, entryTime: e.target.value + ':00' })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hora de Salida</label>
                                    <input
                                        type="time"
                                        step="1"
                                        value={newSchedule.exitTime?.substring(0, 5)}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, exitTime: e.target.value + ':00' })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Horas Programadas</label>
                                    <input
                                        type="number"
                                        value={newSchedule.scheduledHours}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduledHours: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Guardar Nuevo Horario
                            </button>
                        </form>
                    )}

                    <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex-1 min-w-[200px] max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Mostrar:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <div className="text-sm text-gray-700">
                                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSchedules.length)} de {filteredAndSortedSchedules.length}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => handleSort('id')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('department')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Departamento {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('entryTime')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        H. Entrada {sortField === 'entryTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('exitTime')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        H. Salida {sortField === 'exitTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('scheduledHours')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Hrs Prog. {sortField === 'scheduledHours' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentSchedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay horarios registrados'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentSchedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            {editingId === schedule.id ? (
                                                <>
                                                    <td className="px-6 py-4">{schedule.id}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.department || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="time"
                                                            step="1"
                                                            value={editForm.entryTime?.substring(0, 5) || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, entryTime: e.target.value + ':00' })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="time"
                                                            step="1"
                                                            value={editForm.exitTime?.substring(0, 5) || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, exitTime: e.target.value + ':00' })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={editForm.scheduledHours || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, scheduledHours: parseInt(e.target.value) })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={saveEdit}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-sm">{schedule.id}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{schedule.name}</td>
                                                    <td className="px-6 py-4 text-sm">{schedule.department}</td>
                                                    <td className="px-6 py-4 text-sm">{schedule.entryTime}</td>
                                                    <td className="px-6 py-4 text-sm">{schedule.exitTime}</td>
                                                    <td className="px-6 py-4 text-sm">{schedule.scheduledHours}h</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {permissions.canEdit && (
                                                            <button
                                                                onClick={() => startEdit(schedule)}
                                                                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                        {permissions.canDelete && (
                                                            <button
                                                                onClick={() => deleteSchedule(schedule.id)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                        {!permissions.canEdit && !permissions.canDelete && (
                                                            <span className="text-gray-400 italic text-xs">Sin permisos</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>

                            <div className="flex gap-2">
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`px-4 py-2 rounded-lg ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}