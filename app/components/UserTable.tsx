import { User, CurrentUser, Role } from '@/app/types'

type UserTableProps = {
    users: User[]
    editingId: number | null
    editForm: Partial<User>
    onEdit: (user: User) => void
    onSave: () => void
    onCancel: () => void
    onDelete: (id: number) => void
    onToggleStatus: (id: number, currentStatus: boolean) => void
    onEditFormChange: (form: Partial<User>) => void
    currentUser: CurrentUser | null
    roleConfig: { value: Role; label: string; description: string; requiresSuperAdmin?: boolean }[]
}

export default function UserTable({
    users,
    editingId,
    editForm,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onToggleStatus,
    onEditFormChange,
    currentUser,
    roleConfig
}: UserTableProps) {
    const getRoleBadge = (role: Role) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            moderator: { text: 'Moderador', color: 'bg-indigo-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role] || badges.viewer
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            ID
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Usuario
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Nombre Completo
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Rol
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Estado
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Último Login
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No hay usuarios registrados
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                {editingId === user.id ? (
                                    <>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                            {user.id}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                            {user.username}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.full_name || editForm.fullName || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, full_name: e.target.value, fullName: e.target.value })}
                                                className="w-full min-w-[150px] px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <select
                                                value={editForm.role || 'viewer'}
                                                onChange={(e) => onEditFormChange({ ...editForm, role: e.target.value as Role })}
                                                className="w-full min-w-[120px] px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {roleConfig.map((role) => {
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
                                        <td className="px-3 sm:px-4 py-3">
                                            <select
                                                value={editForm.is_active ? 'true' : 'false'}
                                                onChange={(e) => onEditFormChange({ ...editForm, is_active: e.target.value === 'true' })}
                                                className="w-full min-w-[100px] px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="true">Activo</option>
                                                <option value="false">Inactivo</option>
                                            </select>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(user.last_login)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={onSave}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={onCancel}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-400 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 whitespace-nowrap"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                                            {user.id}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                                            {user.username}
                                            {currentUser?.id === user.id && (
                                                <span className="ml-2 text-xs text-green-600 font-semibold">(Tú)</span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                            {user.full_name || user.fullName || '-'}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(user.last_login)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => onEdit(user)}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 whitespace-nowrap"
                                                >
                                                    Editar
                                                </button>
                                                {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => onToggleStatus(user.id, user.is_active || false)}
                                                        className={`px-3 py-1.5 text-xs font-medium text-white rounded focus:outline-none focus:ring-2 whitespace-nowrap ${user.is_active
                                                            ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                                                            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                                                            }`}
                                                    >
                                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                )}
                                                {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => onDelete(user.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}