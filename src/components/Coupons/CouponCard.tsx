'use client'

import React from 'react'
import { Coupon } from '@/types'

interface CouponCardProps {
  coupon: Coupon
  onToggleStatus: (id: string) => void
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onToggleStatus }) => {
  const isRedeemed = coupon.status === 'redeemed'

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-all hover:bg-gray-100/80">
      <div>
        <h3 className="font-semibold text-sm text-gray-800">{coupon.title}</h3>
        <span className="text-xs text-amber-600 font-bold">{coupon.cost} Coin</span>
      </div>
      <button 
        onClick={() => onToggleStatus(coupon.id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isRedeemed 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm'
        }`}
      >
        {isRedeemed ? 'Kullanıldı ✓' : 'Kullan'}
      </button>
    </div>
  )
}