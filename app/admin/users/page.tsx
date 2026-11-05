'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
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
        try {
            const response = await fetch('/api/auth')

            if (!response.ok) {
                sessionStorage.removeItem('user')
                router.push('/admin')
                return
            }

            const { user: userData } = await response.json()
            sessionStorage.setItem('user', JSON.stringify(userData))

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

            if (response.status === 401) {
                sessionStorage.removeItem('user')
                router.push('/admin')
                return
            }

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

    if (isLoading) {
        return (
            // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
            // <div className="text-white text-2xl">Cargando...</div>
            < SpabarLoader />
            // </div>
        )
    }

    if (!currentUser) {
        return null
    }

    const activeCount = users.filter((user) => user.is_active).length

    return (
        <div className="page-shell">
            <AppHeader
                current="usuarios"
                user={{ name: currentUser.fullName || currentUser.username, role: currentUser.role }}
                canManageUsers
                onLogout={async () => {
                    await fetch('/api/auth', { method: 'DELETE' }).catch((error) => {
                        console.error('Error cerrando sesión:', error)
                    })
                    sessionStorage.removeItem('user')
                    router.push('/admin')
                }}
            />

            <main className="page-main">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <h1 className="page-title">Usuarios</h1>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                        {showAddForm ? 'Cerrar' : 'Agregar usuario'}
                    </button>
                </div>

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

                <section aria-label="Lista de usuarios" className="mt-14">
                    <div className="border-b border-spa-line pb-4">
                        <p className="text-sm text-spa-muted">
                            <span className="font-mono text-spa-text">{activeCount}</span> activo{activeCount !== 1 ? 's' : ''} de{' '}
                            <span className="font-mono text-spa-text">{users.length}</span> usuario{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>

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
                </section>

                <section aria-labelledby="roles" className="mt-14 border-t border-spa-line pt-6">
                    <h2 id="roles" className="text-sm text-spa-text">Roles</h2>
                    <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <dt>Visualizador</dt>
                            <dd className="mt-1 text-spa-muted">Solo puede ver los horarios.</dd>
                        </div>
                        <div>
                            <dt>Moderador</dt>
                            <dd className="mt-1 text-spa-muted">Gestión moderada del sistema.</dd>
                        </div>
                        <div>
                            <dt>Administrador</dt>
                            <dd className="mt-1 text-spa-muted">Puede agregar y editar horarios y usuarios.</dd>
                        </div>
                        <div>
                            <dt>Super Admin</dt>
                            <dd className="mt-1 text-spa-muted">Control total, incluido eliminar.</dd>
                        </div>
                    </dl>
                </section>
            </main>
        </div>
    )
}
