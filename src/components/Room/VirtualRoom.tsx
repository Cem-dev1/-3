import React from 'react'
import { Sparkles } from 'lucide-react'

export function VirtualRoom() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
      <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-500 shadow-inner">
        <Sparkles size={40} />
      </div>
      <h2 className="font-bold text-lg text-gray-700 mb-1">Ortak Oda 🏡</h2>
      <p className="text-xs text-gray-400 max-w-xs">
        Burası senin ve sevgilinin ortak dijital evi. Yakında mobilyalar ve evcil hayvanlar buraya eklenecek!
      </p>
    </div>
  )
}