'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type LoginFormProps = {
    onLoginSuccess: (userData: any) => void
}

function DayClock() {
    // Se calcula solo en el navegador para no generar diferencias con el HTML del servidor.
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setNow(new Date())
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const pad = (value: number) => String(value).padStart(2, '0')
    const clock = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : '--:--'
    const progress = now
        ? ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100
        : 0

    return (
        <section aria-label="Hora actual" className="min-w-0 flex-[999_1_480px]">
            <p className="font-mono text-[clamp(72px,13vw,176px)] font-light leading-none tracking-[-0.06em]">
                {clock}
            </p>
            <div aria-hidden="true" className="relative mt-10 h-px max-w-[640px] bg-spa-strong">
                {now && (
                    <div
                        className="absolute -top-1 -ml-1 h-[9px] w-[9px] rounded-full bg-spa-accent"
                        style={{ left: `${progress}%` }}
                    />
                )}
            </div>
            <div aria-hidden="true" className="mt-3 flex max-w-[640px] justify-between font-mono text-xs text-spa-muted">
                <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </div>
        </section>
    )
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
                sessionStorage.setItem('user', JSON.stringify(data.user))
                onLoginSuccess(data.user)
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

    return (
        <div className="page-shell flex flex-col">
            <header className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-8">
                <Link href="/" className="inline-block">
                    <Image
                        src="/spabar-logo.png"
                        alt="Spabar, volver al inicio"
                        width={123}
                        height={48}
                        priority
                        className="logo-on-dark h-12 w-auto"
                    />
                </Link>
            </header>

            <main className="mx-auto flex w-full max-w-[1320px] flex-auto flex-wrap items-center justify-between gap-16 px-4 py-8 sm:px-8">
                <DayClock />

                <section aria-labelledby="acceso" className="min-w-0 max-w-[420px] flex-[1_1_360px]">
                    <h1 id="acceso" className="mb-10 text-[32px] font-light tracking-[-0.02em]">
                        Panel de Administración
                    </h1>

                    <form onSubmit={handleLogin} className="flex flex-col gap-7">
                        <div>
                            <label htmlFor="usuario" className="field-label">Usuario</label>
                            <input
                                id="usuario"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="field min-h-12 text-lg"
                                placeholder="usuario"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="contrasena" className="field-label">Contraseña</label>
                            <input
                                id="contrasena"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="field min-h-12 text-lg"
                                placeholder="••••••••"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {loginError && (
                            <p role="alert" className="text-sm text-spa-alert">{loginError}</p>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            size="xl"
                            variant="primary"
                            loading={isLoading}
                            loadingText="Iniciando sesión..."
                            className="mt-2"
                        >
                            Iniciar sesión
                        </Button>
                        <Link href="/" className="nav-link self-center">
                            Volver al inicio
                        </Link>
                    </form>
                </section>
            </main>
        </div>
    )
}
