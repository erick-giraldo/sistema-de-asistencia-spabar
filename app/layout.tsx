import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spabar - Sistema de Asistencia',
  description: 'Sistema de control de asistencia para empleados de Spabar',
  icons: {
    icon: '/icons/favicon.ico',        // o '/favicon.png'
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Geist no está disponible en next/font/google de Next 14.2 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&family=Geist+Mono:wght@300;400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
