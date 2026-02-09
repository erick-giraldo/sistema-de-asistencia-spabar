import { User, Role, CurrentUser } from '@/app/types'

type AddUserFormProps = {
    newUser: Partial<User> & { password?: string }
    onChange: (user: Partial<User> & { password?: string }) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    roleConfig: { value: Role; label: string; description: string; requiresSuperAdmin?: boolean }[]
    currentUser: CurrentUser | null
}

export default function AddUserForm({
    newUser,
    onChange,
    onSubmit,
    onCancel,
    roleConfig,
    currentUser
}: AddUserFormProps) {
    return (
        <form onSubmit={onSubmit} className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Nuevo Usuario</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newUser.username || ''}
                        onChange={(e) => onChange({ ...newUser, username: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="juan.perez"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Sin espacios, solo letras y números</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newUser.full_name || newUser.fullName || ''}
                        onChange={(e) => onChange({ ...newUser, full_name: e.target.value, fullName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={newUser.password || ''}
                        onChange={(e) => onChange({ ...newUser, password: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={newUser.role || 'viewer'}
                        onChange={(e) => onChange({ ...newUser, role: e.target.value as Role })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
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

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                    <strong>💡 Permisos por rol:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 ml-4 space-y-1">
                    <li><strong>Visualizador:</strong> Solo puede ver información</li>
                    <li><strong>Administrador:</strong> Puede agregar y editar horarios y usuarios</li>
                    {roleConfig.find(r => r.value === 'moderator') && (
                        <li><strong>Moderador:</strong> Gestión moderada del sistema</li>
                    )}
                    <li><strong>Super Admin:</strong> Tiene control total incluyendo eliminar</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                    Crear Usuario
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}