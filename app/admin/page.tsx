'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import AdminDashboard from '@/components/AdminDashboard'
import { User } from '@/app/types'
import { SpabarLoader } from '../components/SpabarLoader'

export default function AdminPage() {
    const [isInitializing, setIsInitializing] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth')

            if (response.ok) {
                const data = await response.json()
                sessionStorage.setItem('user', JSON.stringify(data.user))
                setUser(data.user)
            } else {
                sessionStorage.removeItem('user')
            }
        } catch (error) {
            console.error('Error verificando sesión:', error)
            sessionStorage.removeItem('user')
        } finally {
            setIsInitializing(false)
        }
    }

    const handleLoginSuccess = (userData: User) => {
        setUser(userData)
    }

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' }).catch((error) => {
            console.error('Error cerrando sesión:', error)
        })
        setUser(null)
        sessionStorage.removeItem('user')
    }

    // Pantalla de carga inicial
    if (isInitializing) {
        return (
            // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
            <SpabarLoader />
            // </div>
        )
    }

    // Si no hay usuario, mostrar login
    if (!user) {
        return <LoginForm onLoginSuccess={handleLoginSuccess} />
    }

    // Si hay usuario, mostrar dashboard
    return <AdminDashboard user={user} onLogout={handleLogout} />
}