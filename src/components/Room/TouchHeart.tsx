'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useHaptic } from '@/hooks/useHaptic'

export const TouchHeart: React.FC = () => {
  const { isActivating, triggerTouch } = useHaptic()

  return (
    <div className="w-full mt-4">
      <button 
        onMouseDown={() => triggerTouch()}
        onTouchStart={() => triggerTouch()}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
          isActivating 
            ? 'bg-red-600 scale-95 ring-4 ring-pink-300' 
            : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
        }`}
      >
        <Heart size={20} className={isActivating ? 'animate-ping' : ''} />
        {isActivating ? '❤️ Titreşim Gönderildi!' : 'Basılı Tut (Canlı Dokunuş)'}
      </button>
    </div>
  )
}