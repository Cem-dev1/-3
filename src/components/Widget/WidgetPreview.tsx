import React, { useState } from 'react'
import { Smartphone, Send } from 'lucide-react'

interface WidgetPreviewProps {
  currentStatus: string
  onUpdateStatus: (message: string) => void
}

export function WidgetPreview({ currentStatus, onUpdateStatus }: WidgetPreviewProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onUpdateStatus(message.trim())
    setMessage('')
  }

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="font-bold text-lg text-gray-700 mb-1">Anlık Widget Durumu 📱</h2>
      <p className="text-xs text-gray-400 mb-4">Sevgilinin telefon ekranında görünecek mesajı güncelle.</p>

      {/* Widget Önizleme Kartı */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-3xl p-5 text-white shadow-md mb-6 relative overflow-hidden flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Manitalar Widget
          </span>
          <Smartphone size={18} className="text-white/80" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/90">Anlık Durum:</p>
          <p className="text-lg font-bold truncate mt-0.5">“{currentStatus}”</p>
        </div>
      </div>

      {/* Mesaj Güncelleme Formu */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Yeni durum mesajı yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-50 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}