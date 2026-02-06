'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type User = {
    id: number
    username: string
    password?: string
    full_name: string
    role: Role
    is_active: boolean
    last_login: string | null
    created_at: string
}

type CurrentUser = {
    id: number
    username: string
    fullName: string
    role: 'admin' | 'viewer' | 'super_admin'
}

// En tus tipos
type Role = 'admin' | 'viewer' | 'super_admin' | 'moderator'

// Configuración de roles
const roleConfig: { value: Role; label: string; description: string; requiresSuperAdmin?: boolean }[] = [
    { value: 'viewer', label: 'Visualizador', description: 'solo ver' },
    { value: 'admin', label: 'Administrador', description: 'editar' },
    { value: 'moderator', label: 'Moderador', description: 'gestión moderada' },
    { value: 'super_admin', label: 'Super Admin', description: 'todo', requiresSuperAdmin: true },
]

export default function UsersPage() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<Partial<User>>({})
    const [showAddForm, setShowAddForm] = useState(false)
    const [newUser, setNewUser] = useState<{
        username: string
        password: string
        full_name: string
        role: Role
    }>({
        username: '',
        password: '',
        full_name: '',
        role: 'viewer'
    })

    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const storedUser = sessionStorage.getItem('user')

        if (!storedUser) {
            router.push('/admin')
            return
        }

        try {
            const userData = JSON.parse(storedUser)

            // Solo admin y super_admin pueden acceder
            if (userData.role !== 'admin' && userData.role !== 'super_admin') {
                alert('No tienes permisos para acceder a esta página')
                router.push('/admin')
                return
            }

            setCurrentUser(userData)
            await loadUsers()
        } catch (error) {
            console.error('Error:', error)
            router.push('/admin')
        } finally {
            setIsLoading(false)
        }
    }

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/users')
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        }
    }

    const addUser = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newUser.username || !newUser.password || !newUser.full_name) {
            alert('Por favor completa todos los campos')
            return
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })

            if (response.ok) {
                await loadUsers()
                setShowAddForm(false)
                setNewUser({ username: '', password: '', full_name: '', role: 'viewer' })
                alert('Usuario creado correctamente')
            } else {
                const data = await response.json()
                alert(data.error || 'Error al crear usuario')
            }
        } catch (error) {
            console.error('Error creando usuario:', error)
            alert('Error al crear usuario')
        }
    }

    const startEdit = (user: User) => {
        setEditingId(user.id)
        setEditForm({
            full_name: user.full_name,
            role: user.role,
            is_active: user.is_active
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const saveEdit = async () => {
        if (!editingId) return

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, ...editForm })
            })

            if (response.ok) {
                await loadUsers()
                setEditingId(null)
                setEditForm({})
                alert('Usuario actualizado correctamente')
            }
        } catch (error) {
            console.error('Error actualizando usuario:', error)
            alert('Error al actualizar usuario')
        }
    }

    const toggleUserStatus = async (id: number, currentStatus: boolean) => {
        if (!confirm(`¿Estás seguro de ${currentStatus ? 'desactivar' : 'activar'} este usuario?`)) return

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus })
            })

            if (response.ok) {
                await loadUsers()
                alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
            }
        } catch (error) {
            console.error('Error cambiando estado:', error)
            alert('Error al cambiar estado del usuario')
        }
    }

    const deleteUser = async (id: number) => {
        if (currentUser?.role !== 'super_admin') {
            alert('Solo los Super Administradores pueden eliminar usuarios')
            return
        }

        if (id === currentUser?.id) {
            alert('No puedes eliminar tu propio usuario')
            return
        }

        if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return

        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            const data = await response.json()

            if (response.ok) {
                await loadUsers()
                alert('Usuario eliminado correctamente')
            } else {
                console.error('Error del servidor:', data)
                alert(`Error al eliminar usuario: ${data.error || 'Error desconocido'}`)
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error)
            alert(`Error al eliminar usuario: ${error}`)
        }
    }

    const getRoleBadge = (role: Role) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role as keyof typeof badges] || badges.viewer
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.text}</span>
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-900 text-2xl">Cargando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        {currentUser && (
                            <p className="text-gray-600 mt-2">
                                Administrado por: <span className="font-semibold">{currentUser.fullName}</span>
                            </p>
                        )}
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            Volver a Horarios
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Usuarios del Sistema</h2>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {showAddForm ? 'Cancelar' : 'Agregar Usuario'}
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={addUser} className="mb-8 p-6 bg-green-50 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">Nuevo Usuario</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre de Usuario *</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="juan.perez"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Sin espacios, solo letras y números</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        value={newUser.full_name}
                                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Juan Pérez"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contraseña *</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rol *</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        {roleConfig.map((role) => {
                                            // Solo mostrar super_admin si el usuario actual es super_admin
                                            if (role.requiresSuperAdmin && currentUser?.role !== 'super_admin') {
                                                return null
                                            }
                                            return (
                                                <option key={role.value} value={role.value}>
                                                    {role.label} ({role.description})
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Crear Usuario
                            </button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            {editingId === user.id ? (
                                                <>
                                                    <td className="px-6 py-4 text-sm">{user.id}</td>
                                                    <td className="px-6 py-4 text-sm">{user.username}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editForm.full_name || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={editForm.role || 'viewer'}
                                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        >
                                                            {roleConfig.map((role) => {
                                                                // Solo mostrar super_admin si el usuario actual es super_admin
                                                                if (role.requiresSuperAdmin && currentUser?.role !== 'super_admin') {
                                                                    return null
                                                                }
                                                                return (
                                                                    <option key={role.value} value={role.value}>
                                                                        {role.label}
                                                                    </option>
                                                                )
                                                            })}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={editForm.is_active ? 'true' : 'false'}
                                                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                                                            className="w-full px-2 py-1 border rounded"
                                                        >
                                                            <option value="true">Activo</option>
                                                            <option value="false">Inactivo</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(user.last_login)}</td>
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
                                                    <td className="px-6 py-4 text-sm">{user.id}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{user.username}</td>
                                                    <td className="px-6 py-4 text-sm">{user.full_name}</td>
                                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.last_login)}</td>
                                                    <td className="px-6 py-4 text-sm space-x-2">
                                                        <button
                                                            onClick={() => startEdit(user)}
                                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                            className={`px-3 py-1 rounded text-white ${user.is_active
                                                                ? 'bg-orange-500 hover:bg-orange-600'
                                                                : 'bg-green-500 hover:bg-green-600'
                                                                }`}
                                                        >
                                                            {user.is_active ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                        {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                                                            <button
                                                                onClick={() => deleteUser(user.id)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                            >
                                                                Eliminar
                                                            </button>
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

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">📝 Información sobre Roles:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li><strong>Visualizador:</strong> Solo puede ver los horarios, sin permisos de edición</li>
                            <li><strong>Administrador:</strong> Puede ver, agregar y editar horarios</li>
                            <li><strong>Super Admin:</strong> Puede hacer todo, incluido eliminar horarios y gestionar usuarios</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}