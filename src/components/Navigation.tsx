'use client'

import React from 'react'
import { Home, Gift, MessageCircle, Clock } from 'lucide-react'

export type TabType = 'room' | 'coupons' | 'widget' | 'memories'

interface NavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-4 w-[90%] max-w-sm bg-white/90 backdrop-blur-md border border-pink-100 shadow-xl rounded-2xl p-2 flex justify-around items-center z-50">
      <button 
        onClick={() => setActiveTab('room')}
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'room' ? 'text-pink-600 bg-pink-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Home size={20} />
        <span className="text-[10px] font-bold mt-1">Oda</span>
      </button>

      <button 
        onClick={() => setActiveTab('coupons')}
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'coupons' ? 'text-pink-600 bg-pink-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Gift size={20} />
        <span className="text-[10px] font-bold mt-1">Kuponlar</span>
      </button>

      <button 
        onClick={() => setActiveTab('widget')}
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'widget' ? 'text-pink-600 bg-pink-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <MessageCircle size={20} />
        <span className="text-[10px] font-bold mt-1">Widget</span>
      </button>

      <button 
        onClick={() => setActiveTab('memories')}
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'memories' ? 'text-pink-600 bg-pink-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Clock size={20} />
        <span className="text-[10px] font-bold mt-1">Anılar</span>
      </button>
    </nav>
  )
}