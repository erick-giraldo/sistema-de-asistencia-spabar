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

    const checkAuth = () => {
        const storedUser = sessionStorage.getItem('user')

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser)
                setUser(userData)
            } catch (error) {
                console.error('Error parsing user data:', error)
                sessionStorage.removeItem('user')
            }
        }

        setIsInitializing(false)
    }

    const handleLoginSuccess = (userData: User) => {
        setUser(userData)
    }

    const handleLogout = () => {
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