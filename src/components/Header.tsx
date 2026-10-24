import React from 'react'
import { Heart, Coins, Calendar } from 'lucide-react'

interface HeaderProps {
  days: number
  hours: number
  minutes: number
  coins: number
}

export function Header({ days, hours, minutes, coins }: HeaderProps) {
  return (
    <header className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-pink-100 flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
          <Calendar size={20} />
        </div>
        <div>
          <span className="text-xs text-gray-400 block font-medium">Birlikte</span>
          <span className="text-sm font-bold text-gray-700">
            {days} gün {hours} sa
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
        <Coins className="text-amber-500 w-4 h-4" />
        <span className="text-sm font-bold text-amber-700">{coins}</span>
      </div>
    </header>
  )
}