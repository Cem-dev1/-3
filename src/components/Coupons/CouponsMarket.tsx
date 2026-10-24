import React, { useState } from 'react'
import { Ticket, Plus, CheckCircle2 } from 'lucide-react'
import { Coupon } from '@/types'

interface CouponsMarketProps {
  coupons: Coupon[]
  onAddCoupon: (title: string) => void
  onToggleCouponStatus: (id: string) => void
}

export function CouponsMarket({ coupons, onAddCoupon, onToggleCouponStatus }: CouponsMarketProps) {
  const [newTitle, setNewTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddCoupon(newTitle.trim())
    setNewTitle('')
  }

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="font-bold text-lg text-gray-700 mb-1">Aşk Kuponları 🎟️</h2>
      <p className="text-xs text-gray-400 mb-4">Birbirinize sürpriz kuponlar tanımlayın ve kullanın.</p>

      {/* Kupon Ekleme Formu */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Yeni kupon yaz (Örn: Masaj hakkı)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-gray-50 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Kupon Listesi */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {coupons.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-8">Henüz kupon eklenmemiş.</p>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                coupon.status === 'redeemed'
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : 'bg-pink-50/50 border-pink-100 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${coupon.status === 'redeemed' ? 'bg-gray-200 text-gray-500' : 'bg-pink-100 text-pink-500'}`}>
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${coupon.status === 'redeemed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {coupon.title}
                  </h3>
                  <span className="text-[10px] text-gray-400">Bedel: {coupon.cost} Coin</span>
                </div>
              </div>

              <button
                onClick={() => onToggleCouponStatus(coupon.id)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                  coupon.status === 'redeemed'
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                <CheckCircle2 size={16} />
                {coupon.status === 'redeemed' ? 'Kullanıldı' : 'Kullan'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}