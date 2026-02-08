'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserTable from '@/components/UserTable'
import AddUserForm from '@/components/AddUserForm'
import { User, CurrentUser, Role } from '@/app/types'
import { SpabarLoader } from '@/app/components/SpabarLoader'

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
    const [newUser, setNewUser] = useState<Partial<User> & { password?: string }>({
        username: '',
        password: '',
        full_name: '',
        fullName: '',
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

        if (!newUser.username || !newUser.password || (!newUser.full_name && !newUser.fullName)) {
            alert('Por favor completa todos los campos')
            return
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUser,
                    full_name: newUser.full_name || newUser.fullName
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                await loadUsers()
                setShowAddForm(false)
                setNewUser({
                    username: '',
                    password: '',
                    full_name: '',
                    fullName: '',
                    role: 'viewer'
                })
                alert('Usuario creado correctamente')
            } else {
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
            full_name: user.full_name || user.fullName,
            fullName: user.full_name || user.fullName,
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
                body: JSON.stringify({
                    id: editingId,
                    ...editForm,
                    full_name: editForm.full_name || editForm.fullName
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                await loadUsers()
                setEditingId(null)
                setEditForm({})
                alert('Usuario actualizado correctamente')

                // Si el usuario editó su propio rol, actualizar sessionStorage
                if (editingId === currentUser?.id) {
                    const updatedUser = { ...currentUser, ...editForm }
                    setCurrentUser(updatedUser)
                    sessionStorage.setItem('user', JSON.stringify(updatedUser))
                }
            } else {
                alert(data.error || 'Error al actualizar usuario')
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

            const data = await response.json()

            if (response.ok && data.success) {
                await loadUsers()
                alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
            } else {
                alert(data.error || 'Error al cambiar estado')
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

            if (response.ok && data.success) {
                await loadUsers()
                alert('Usuario eliminado correctamente')
            } else {
                alert(data.error || 'Error al eliminar usuario')
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error)
            alert('Error al eliminar usuario')
        }
    }

    const getRoleBadge = (role: Role) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            moderator: { text: 'Moderador', color: 'bg-indigo-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role] || badges.viewer
        return (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    // if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
            {/* <div className="text-white text-2xl">Cargando...</div> */}
            <SpabarLoader ring={false} />
        </div>
    )
    // }

    if (!currentUser) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                Gestión de Usuarios
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <p className="text-sm sm:text-base text-gray-600">
                                    Administrado por <span className="font-semibold">{currentUser.fullName || currentUser.username}</span>
                                </p>
                                {getRoleBadge(currentUser.role)}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => router.push('/admin')}
                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            >
                                ← Volver a Horarios
                            </button>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('user')
                                    router.push('/admin')
                                }}
                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Alerta informativa */}
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
                        <p className="font-semibold text-sm">ℹ️ Información sobre gestión de usuarios</p>
                        <p className="text-xs mt-1">
                            Los usuarios pueden tener diferentes niveles de acceso. Solo los Super Administradores pueden eliminar usuarios.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                Usuarios del Sistema
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                            {showAddForm ? 'Cancelar' : '+ Agregar Usuario'}
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <AddUserForm
                            newUser={newUser}
                            onChange={setNewUser}
                            onSubmit={addUser}
                            onCancel={() => setShowAddForm(false)}
                            roleConfig={roleConfig}
                            currentUser={currentUser}
                        />
                    )}

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <UserTable
                            users={users}
                            editingId={editingId}
                            editForm={editForm}
                            onEdit={startEdit}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            onDelete={deleteUser}
                            onToggleStatus={toggleUserStatus}
                            onEditFormChange={setEditForm}
                            currentUser={currentUser}
                            roleConfig={roleConfig}
                        />
                    </div>

                    {/* Info adicional */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">📝 Información sobre Roles</h3>
                        <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• <strong>Visualizador:</strong> Solo puede ver los horarios, sin permisos de edición</li>
                            <li>• <strong>Administrador:</strong> Puede ver, agregar y editar horarios y usuarios</li>
                            {roleConfig.find(r => r.value === 'moderator') && (
                                <li>• <strong>Moderador:</strong> Permisos de gestión moderada del sistema</li>
                            )}
                            <li>• <strong>Super Admin:</strong> Control total incluido eliminar horarios y gestionar usuarios</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-yellow-900 mb-2">🔐 Notas de Seguridad</h3>
                        <ul className="text-xs text-yellow-800 space-y-1 ml-4">
                            <li>• Las contraseñas deben tener al menos 6 caracteres</li>
                            <li>• No puedes eliminar tu propio usuario</li>
                            <li>• Solo Super Administradores pueden eliminar usuarios</li>
                            <li>• Los usuarios inactivos no pueden iniciar sesión</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}