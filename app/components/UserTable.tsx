import { User } from '@/app/types'

type UserTableProps = {
    users: User[]
    editingId: number | null
    editForm: Partial<User>
    onEdit: (user: User) => void
    onSave: () => void
    onCancel: () => void
    onDelete: (id: number) => void
    onEditFormChange: (form: Partial<User>) => void
    currentUser: User | null
}

export default function UserTable({
    users,
    editingId,
    editForm,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onEditFormChange,
    currentUser
}: UserTableProps) {
    const getRoleBadge = (role: string) => {
        const badges = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-600 text-white' },
            admin: { text: 'Administrador', color: 'bg-blue-600 text-white' },
            viewer: { text: 'Visualizador', color: 'bg-gray-600 text-white' }
        }
        const badge = badges[role as keyof typeof badges] || badges.viewer
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre Completo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No hay usuarios registrados
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                {editingId === user.id ? (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {user.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.username || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, username: e.target.value })}
                                                className="w-full min-w-[120px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.fullName || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, fullName: e.target.value })}
                                                className="w-full min-w-[150px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={editForm.role || 'viewer'}
                                                onChange={(e) => onEditFormChange({ ...editForm, role: e.target.value as User['role'] })}
                                                className="w-full min-w-[140px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="viewer">Visualizador</option>
                                                <option value="admin">Administrador</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
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
                                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {user.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                            {user.username}
                                            {currentUser?.id === user.id && (
                                                <span className="ml-2 text-xs text-green-600 font-semibold">(Tú)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {user.fullName}
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEdit(user)}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 whitespace-nowrap"
                                                >
                                                    Editar
                                                </button>
                                                {currentUser?.id !== user.id && (
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