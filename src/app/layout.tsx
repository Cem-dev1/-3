import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manitalar 💕',
  description: 'Sevgili takip ve ilişki uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* Tailwind CSS CDN fallback */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-pink-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}