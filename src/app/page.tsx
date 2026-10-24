'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [couple, setCouple] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [inputCode, setInputCode] = useState('')
  const [coins, setCoins] = useState(0)
  const [myCoupons, setMyCoupons] = useState<any[]>([])
  const [notification, setNotification] = useState<string | null>(null)

  // 1. Oturum & Kullanıcı Bilgisi
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadUserData(user.id)
      }
    }
    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserData(session.user.id)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  // 2. Kullanıcı & Eşleşme Verilerini Yükleme
  const loadUserData = async (userId: string) => {
    // Profil / Bakiye Bilgisi
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!profile) {
      const { data: newProfile } = await supabase.from('profiles').insert([{ id: userId, coins: 15 }]).select().single()
      profile = newProfile
    }
    setCoins(profile?.coins || 0)

    // Eşleşme Durumu Kontrolü
    const { data: coupleData } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single()

    if (coupleData) {
      setCouple(coupleData)
      const partnerId = coupleData.user1_id === userId ? coupleData.user2_id : coupleData.user1_id
      const { data: partnerProfile } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
      setPartner(partnerProfile)
      listenToRealtime(coupleData.id)
    }
  }

  // 3. Realtime Bildirim / Titreşim Dinleyicisi
  const listenToRealtime = (coupleId: string) => {
    supabase
      .channel(`couple-${coupleId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotification(payload.new.message)
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
      })
      .subscribe()
  }

  // 4. Google ile Giriş
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` }
    })
  }

  // 5. Kod ile Eşleşme
  const handlePair = async () => {
    if (!inputCode || inputCode === user.id) return alert('Geçersiz Kod!')
    
    const { data, error } = await supabase.from('couples').insert([
      { user1_id: user.id, user2_id: inputCode, created_at: new Date().toISOString() }
    ]).select().single()

    if (error) {
      alert('Eşleşme başarısız veya zaten bir eşleşmeniz var!')
    } else {
      // Ödül: +15 Coin
      await supabase.from('profiles').update({ coins: coins + 15 }).eq('id', user.id)
      setCoins(coins + 15)
      loadUserData(user.id)
      alert('Tebrikler! Başarıyla Eşleştiniz 💕 (+15 Coin kazandınız)')
    }
  }

  // 6. Kupon Satın Alma
  const buyCoupon = async (title: string, cost: number) => {
    if (coins < cost) return alert('Yeterli Coin bakiyeniz yok!')

    const newCoins = coins - cost
    await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id)
    setCoins(newCoins)

    const { data: newCoupon } = await supabase.from('coupons').insert([
      { user_id: user.id, title, is_used: false }
    ]).select().single()

    setMyCoupons([...myCoupons, newCoupon])
    alert(`"${title}" kuponu başarıyla alındı!`)
  }

  // 7. Kupon Kullanma & Eşe Bildirim Gönderme
  const useCoupon = async (couponId: string, title: string) => {
    await supabase.from('coupons').update({ is_used: true }).eq('id', couponId)
    setMyCoupons(myCoupons.filter(c => c.id !== couponId))

    if (couple) {
      await supabase.from('notifications').insert([
        { couple_id: couple.id, sender_id: user.id, message: `💕 Eşin senin için "${title}" kuponunu kullandı!` }
      ])
    }
    alert('Kupon kullanıldı ve eşine bildirim gönderildi!')
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <h1 className="text-3xl font-bold mb-6 text-rose-500">Manitalar 💕</h1>
        <button 
          onClick={handleGoogleLogin} 
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition"
        >
          Google ile Giriş Yap
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-md mx-auto flex flex-col gap-6">
      {/* Üst Bar / Bakiye */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <p className="text-xs text-slate-400">Bakiyen</p>
          <p className="text-xl font-bold text-amber-400">{coins} 🪙 Coin</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 underline">Çıkış Yap</button>
      </div>

      {/* Anlık Bildirim Kutusu */}
      {notification && (
        <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-4 rounded-2xl animate-pulse">
          {notification}
        </div>
      )}

      {/* Eşleşme Alanı / Eş Detayı */}
      {!couple ? (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-rose-400">Eşinle Bağlan</h2>
          <p className="text-xs text-slate-400">Senin Davet Kodun (Kopyala ve Eşine Gönder):</p>
          <code className="bg-slate-950 p-2 rounded text-xs select-all text-rose-300">{user.id}</code>

          <div className="flex flex-col gap-2 mt-2">
            <input 
              type="text" 
              placeholder="Eşinin Kodunu Yapıştır" 
              value={inputCode} 
              onChange={e => setInputCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-rose-500"
            />
            <button onClick={handlePair} className="bg-rose-600 hover:bg-rose-700 p-3 rounded-xl font-bold text-sm">
              Eşleş ve +15 Coin Kazan 💕
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-rose-400">Eşleşme Tamamlandı 💕</h2>
          <p className="text-sm">Eşinin ID: <span className="text-slate-400 text-xs">{partner?.id || 'Yükleniyor...'}</span></p>
          <p className="text-xs text-slate-400 mt-2">
            Eşleşme Tarihi: {new Date(couple.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
      )}

      {/* Kupon Mağazası */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-amber-400">Kupon Mağazası 🛒</h2>
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <p className="font-semibold text-sm">Ayağa Masaj Kuponu 🦶</p>
            <p className="text-xs text-slate-400">10 Coin</p>
          </div>
          <button onClick={() => buyCoupon('Ayağa Masaj', 10)} className="bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold text-black">Satın Al</button>
        </div>
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <p className="font-semibold text-sm">Kahve / Tatlı Ismarlama ☕</p>
            <p className="text-xs text-slate-400">20 Coin</p>
          </div>
          <button onClick={() => buyCoupon('Kahve Ismarlama', 20)} className="bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold text-black">Satın Al</button>
        </div>
      </div>

      {/* Kuponlarım */}
      {myCoupons.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-rose-400">Kuponlarım 🎟️</h2>
          {myCoupons.map((coupon) => (
            <div key={coupon.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p className="font-semibold text-sm">{coupon.title}</p>
              <button onClick={() => useCoupon(coupon.id, coupon.title)} className="bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold">Kullan</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}