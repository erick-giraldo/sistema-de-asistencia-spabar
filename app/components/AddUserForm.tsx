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
        <form onSubmit={onSubmit} aria-label="Nuevo usuario" className="panel mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label htmlFor="usuario-nombre-usuario" className="field-label">Usuario</label>
                    <input
                        id="usuario-nombre-usuario"
                        type="text"
                        autoComplete="off"
                        value={newUser.username || ''}
                        onChange={(e) => onChange({ ...newUser, username: e.target.value })}
                        className="field"
                        placeholder="juan.perez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="usuario-nombre-completo" className="field-label">Nombre completo</label>
                    <input
                        id="usuario-nombre-completo"
                        type="text"
                        autoComplete="off"
                        value={newUser.full_name || newUser.fullName || ''}
                        onChange={(e) => onChange({ ...newUser, full_name: e.target.value, fullName: e.target.value })}
                        className="field"
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="usuario-contrasena" className="field-label">Contraseña</label>
                    <input
                        id="usuario-contrasena"
                        type="password"
                        autoComplete="new-password"
                        value={newUser.password || ''}
                        onChange={(e) => onChange({ ...newUser, password: e.target.value })}
                        className="field"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                    />
                </div>

                <div>
                    <label htmlFor="usuario-rol" className="field-label">Rol</label>
                    <select
                        id="usuario-rol"
                        value={newUser.role || 'viewer'}
                        onChange={(e) => onChange({ ...newUser, role: e.target.value as Role })}
                        className="field"
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

            <div className="mt-7 flex flex-wrap gap-3">
                <button type="submit" className="btn-solid">Crear usuario</button>
                <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
            </div>
        </form>
    )
}
