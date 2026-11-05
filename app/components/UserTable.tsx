import { User, CurrentUser, Role } from '@/app/types'
import { DeleteIcon, EditIcon } from '@/components/ScheduleTable'

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

const compactField = 'field min-h-10 text-sm'

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
    const roleLabel = (role: Role) => roleConfig.find((config) => config.value === role)?.label ?? role

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
            <table className="w-full min-w-[960px] border-collapse text-[15px]">
                <thead>
                    <tr>
                        <th scope="col" className="data-th">ID</th>
                        <th scope="col" className="data-th">Usuario</th>
                        <th scope="col" className="data-th">Nombre completo</th>
                        <th scope="col" className="data-th">Rol</th>
                        <th scope="col" className="data-th">Estado</th>
                        <th scope="col" className="data-th">Último acceso</th>
                        <th scope="col" className="data-th text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-12 text-center text-[15px] text-spa-muted">
                                No hay usuarios registrados
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="data-row">
                                {editingId === user.id ? (
                                    <>
                                        <td className="data-td data-num text-spa-muted">{user.id}</td>
                                        <td className="data-td font-mono text-sm text-spa-muted">{user.username}</td>
                                        <td className="data-td">
                                            <input
                                                type="text"
                                                aria-label="Nombre completo"
                                                value={editForm.full_name || editForm.fullName || ''}
                                                onChange={(e) => onEditFormChange({ ...editForm, full_name: e.target.value, fullName: e.target.value })}
                                                className={`${compactField} min-w-[150px]`}
                                            />
                                        </td>
                                        <td className="data-td">
                                            <select
                                                aria-label="Rol"
                                                value={editForm.role || 'viewer'}
                                                onChange={(e) => onEditFormChange({ ...editForm, role: e.target.value as Role })}
                                                className={`${compactField} min-w-[120px]`}
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
                                        <td className="data-td">
                                            <select
                                                aria-label="Estado"
                                                value={editForm.is_active ? 'true' : 'false'}
                                                onChange={(e) => onEditFormChange({ ...editForm, is_active: e.target.value === 'true' })}
                                                className={`${compactField} min-w-[100px]`}
                                            >
                                                <option value="true">Activo</option>
                                                <option value="false">Inactivo</option>
                                            </select>
                                        </td>
                                        <td className="data-td data-num text-spa-muted">{formatDate(user.last_login)}</td>
                                        <td className="data-td">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={onSave} className="btn-solid px-4">Guardar</button>
                                                <button onClick={onCancel} className="btn-ghost px-4">Cancelar</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="data-td data-num text-spa-muted">{user.id}</td>
                                        <td className="data-td font-mono text-sm">
                                            {user.username}
                                            {currentUser?.id === user.id && (
                                                <span className="ml-2 font-sans text-xs text-spa-accent">Tú</span>
                                            )}
                                        </td>
                                        <td className="data-td">{user.full_name || user.fullName || '-'}</td>
                                        <td className={`data-td text-sm ${user.role === 'super_admin' ? 'text-spa-accent' : user.role === 'viewer' ? 'text-spa-muted' : ''}`}>
                                            {roleLabel(user.role)}
                                        </td>
                                        <td className="data-td">
                                            <span className={`inline-flex items-center gap-2 text-sm ${user.is_active ? '' : 'text-spa-muted'}`}>
                                                <span
                                                    aria-hidden="true"
                                                    className={`h-[7px] w-[7px] rounded-full border ${user.is_active ? 'border-spa-accent bg-spa-accent' : 'border-spa-muted'}`}
                                                />
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="data-td data-num text-spa-muted">{formatDate(user.last_login)}</td>
                                        <td className="data-td py-1">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => onEdit(user)}
                                                    aria-label={`Editar a ${user.username}`}
                                                    className="icon-btn"
                                                >
                                                    <EditIcon />
                                                </button>
                                                {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => onToggleStatus(user.id, user.is_active || false)}
                                                        aria-label={`${user.is_active ? 'Desactivar' : 'Activar'} a ${user.username}`}
                                                        className="icon-btn"
                                                    >
                                                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M8 1.5v6M4.2 3.8a5.5 5.5 0 1 0 7.6 0" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {currentUser?.role === 'super_admin' && user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => onDelete(user.id)}
                                                        aria-label={`Eliminar a ${user.username}`}
                                                        className="icon-btn"
                                                    >
                                                        <DeleteIcon />
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
