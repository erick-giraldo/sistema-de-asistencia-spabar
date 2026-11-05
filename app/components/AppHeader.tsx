import Image from 'next/image'
import Link from 'next/link'
import { Role } from '@/app/types'

const ROLE_LABELS: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    moderator: 'Moderador',
    viewer: 'Visualizador',
}

type AppHeaderProps = {
    current: 'asistencia' | 'horarios' | 'usuarios'
    user?: { name: string; role: Role }
    canManageUsers?: boolean
    onLogout?: () => void
}

export default function AppHeader({ current, user, canManageUsers = false, onLogout }: AppHeaderProps) {
    const navLink = (href: string, label: string, isCurrent: boolean) => (
        <Link
            href={href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav-link ${isCurrent ? 'nav-link-current' : ''}`}
        >
            {label}
        </Link>
    )

    return (
        <header className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <Link href="/" className="inline-block">
                    <Image
                        src="/spabar-logo.png"
                        alt="Spabar, ir a Asistencia"
                        width={123}
                        height={48}
                        priority
                        className="logo-on-dark h-12 w-auto"
                    />
                </Link>
                {user && (
                    <nav aria-label="Panel" className="flex flex-wrap items-center gap-1">
                        {navLink('/admin', 'Horarios', current === 'horarios')}
                        {canManageUsers && navLink('/admin/users', 'Usuarios', current === 'usuarios')}
                        {navLink('/', 'Inicio', false)}
                    </nav>
                )}
            </div>

            {user ? (
                <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm text-spa-muted">
                        {user.name} · <span className="text-spa-text">{ROLE_LABELS[user.role] ?? ROLE_LABELS.viewer}</span>
                    </p>
                    <button type="button" onClick={onLogout} className="btn-ghost">
                        Cerrar sesión
                    </button>
                </div>
            ) : (
                <nav aria-label="Principal" className="flex flex-wrap items-center gap-2">
                    {navLink('/', 'Asistencia', current === 'asistencia')}
                    <Link href="/admin" className="btn-ghost">
                        Panel Admin
                    </Link>
                </nav>
            )}
        </header>
    )
}
