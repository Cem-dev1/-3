'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Calendar, Coins, Home, Ticket, Smartphone, BookOpen, Plus, 
  CheckCircle2, Send, Sparkles, LogOut, Bell, ShoppingBag, 
  ShieldCheck, Copy, Users, Heart, Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'room' | 'coupons' | 'widget' | 'memories' | 'shop'>('room')
  const [startedAt] = useState<string>('2024-10-31T00:00:00')
  
  // Çift ve Eşleşme Durumları
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [isPaired, setIsPaired] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inputInviteCode, setInputInviteCode] = useState('')

  // Sayaç & Günlük Altın (+15 Başlangıç, +5 Altın/Gün)
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [coins, setCoins] = useState(15)

  // Titreşim Effect Durumu
  const [isVibrating, setIsVibrating] = useState(false)
  const pressTimer = useRef<any>(null)

  // Veriler & Dükkan Kategorileri (Saatlik vs Haftalık)
  const [coupons, setCoupons] = useState<any[]>([])
  const [shopTab, setShopTab] = useState<'daily' | 'weekly'>('daily')
  
  // 3 Saatlik/Günlük (Ucuz) ve 3 Haftalık (Pahalı) Kuponlar
  const dailyShopItems = [
    { id: 'd1', title: 'Tatlı Hitap Kullanımı 💕', price: 10, category: 'Saatlik / Günlük', description: 'Günün geri kalanında bana en tatlı lakaplarla seslenmek zorundasın.' },
    { id: 'd2', title: 'Tribi Anında Durdur! 🛑', price: 15, category: 'Saatlik / Günlük', description: 'O anki ufak gerginliği ve tribi tek tıkla pas geçme hakkı.' },
    { id: 'd3', title: 'Anlık Foto/Video At 📸', price: 8, category: 'Saatlik / Günlük', description: 'Hemen ne yaptığını gösteren anlık selfie veya video isteme kuponu.' },
  ]

  const weeklyShopItems = [
    { id: 'w1', title: 'Tüm Hafta Yemek Seçimi 🍕', price: 50, category: 'Haftalık', description: 'Bu hafta ne yiyeceğimize tamamen sen karar veriyorsun.' },
    { id: 'w2', title: '1 Haftalık Trip Bağışıklığı 🛡️', price: 80, category: 'Haftalık', description: '7 gün boyunca küçük hatalar affedilir, trip atılamaz.' },
    { id: 'w3', title: 'Hafta Sonu Kaçamağı Planı 🚗', price: 60, category: 'Haftalık', description: 'Hafta sonu planının tüm detaylarını sen belirlersin.' },
  ]

  const [statusMessage, setStatusMessage] = useState<string>('Seni çok özledim ❤️')
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: 'İlk Eşleşme Ödülü: +15 Altın Kazanıldı! 🎉', time: 'Şimdi' }
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const [newCouponTitle, setNewCouponTitle] = useState('')
  const [widgetInput, setWidgetInput] = useState('')

  // 1. OTURUM KONTROLÜ
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setInviteCode(session.user.id.slice(0, 8))
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setInviteCode(session.user.id.slice(0, 8))
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', userId).maybeSingle()
    if (profile && profile.couple_id) {
      setCoupleId(profile.couple_id)
      setIsPaired(true)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handlePairWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputInviteCode.trim()) return

    const targetCoupleId = inputInviteCode.trim()
    await supabase.from('profiles').upsert({ id: user.id, couple_id: targetCoupleId })
    setCoupleId(targetCoupleId)
    setIsPaired(true)
    
    addNotification('Tebrikler! Sevgilinle eşleştiniz ve +15 Altın kazandınız! 💕')
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?code=${inviteCode}`)
    alert('Davet kodu kopyalandı! Sevgiline gönderebilirsin 💌')
  }

  // 2. SAYAÇ & GÜNLÜK ALTIN
  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startedAt).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, now - start)

      const calculatedDays = Math.floor(diff / (1000 * 60 * 60 * 24))

      setDuration({
        days: calculatedDays,
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })

      setCoins(15 + (calculatedDays * 5))
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  // 3. REALTIME VERİ DİNLEME
  useEffect(() => {
    if (!user || !coupleId) return

    const fetchData = async () => {
      const { data: couponsData } = await supabase.from('coupons').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
      if (couponsData) setCoupons(couponsData)

      const { data: statusData } = await supabase.from('widget_statuses').select('message').eq('couple_id', coupleId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (statusData) setStatusMessage(statusData.message)
    }

    fetchData()

    const channel = supabase
      .channel(`couple-${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `couple_id=eq.${coupleId}` }, () => {
        supabase.from('coupons').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setCoupons(data)
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'widget_statuses', filter: `couple_id=eq.${coupleId}` }, (payload: any) => {
        if (payload.new && 'message' in payload.new) {
          setStatusMessage(payload.new.message)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, coupleId])

  const addNotification = (text: string) => {
    setNotifications((prev) => [{ id: Date.now(), text, time: 'Şimdi' }, ...prev])
  }

  // TİTRETME MEKANİZMASI
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setIsVibrating(true)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200])
      addNotification('Sevgiline kalpten titreşim ve dürtme gönderildi! 💓')
      setTimeout(() => setIsVibrating(false), 1500)
    }, 500)
  }

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  // KUPON EKLEME & KULLANMA
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponTitle.trim() || !coupleId) return

    const { data } = await supabase
      .from('coupons')
      .insert([{ couple_id: coupleId, title: newCouponTitle, cost: 10, status: 'available', is_custom: true }])
      .select()

    if (data) {
      setCoupons((prev) => [data[0], ...prev])
      setNewCouponTitle('')
      addNotification(`Yeni özel kupon eklendi: "${newCouponTitle}" 🎟️`)
    }
  }

  const handleToggleCoupon = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'redeemed' : 'available'
    await supabase.from('coupons').update({ status: newStatus }).eq('id', id)
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
  }

  const handleUpdateWidget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!widgetInput.trim() || !coupleId) return

    setStatusMessage(widgetInput)
    await supabase.from('widget_statuses').insert([{ couple_id: coupleId, message: widgetInput }])
    setWidgetInput('')
    addNotification('Anlık widget durumu güncellendi! 📱')
  }

  // DÜKKANDAN SATIN ALMA (AL KULLAN MANTIĞI - KUPONLARIMA EKLENİR)
  const handleBuyItem = async (item: any) => {
    if (coins < item.price) {
      alert('Yetersiz Altın! Birlikte gün geçirdikçe altınların birikecek ❤️')
      return
    }

    setCoins((prev) => prev - item.price)

    if (coupleId) {
      const { data } = await supabase
        .from('coupons')
        .insert([{ couple_id: coupleId, title: item.title, cost: item.price, status: 'available', is_custom: false }])
        .select()

      if (data) {
        setCoupons((prev) => [data[0], ...prev])
      }
    } else {
      // Offline / Test Modu
      const newLocalCoupon = { id: Date.now().toString(), title: item.title, cost: item.price, status: 'available' }
      setCoupons((prev) => [newLocalCoupon, ...prev])
    }

    addNotification(`Satın Alındı: "${item.title}" (Kuponlarıma Eklendi) 🛍️`)
    alert(`Tebrikler! "${item.title}" satın alındı. İstediğin an "Kuponlar" sekmesinden kullanabilirsin! 🎉`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-purple-100 flex items-center justify-center p-4">
        <div className="p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Manitalar 💕</h1>
          <p className="text-xs text-gray-500 mb-6">Ortak dijital alanınıza erişmek için giriş yapın.</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-700 font-semibold hover:bg-gray-50 transition active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  if (!isPaired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-purple-100 flex items-center justify-center p-4">
        <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Users size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sevgilinle Eşleş 💕</h2>
          <p className="text-xs text-gray-500 mb-4">Eşleştiğiniz an **+15 Altın** kazanacaksınız!</p>

          <button 
            onClick={() => {
              setCoupleId(user?.id || 'demo-couple-id')
              setIsPaired(true)
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl mb-4 transition shadow-sm flex items-center justify-center gap-1.5"
          >
            ⚡ Test Modu: Eşleşmeyi Atla & +15 Altın Al
          </button>

          <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100 mb-4">
            <span className="text-[10px] text-pink-500 font-semibold block mb-1">SENİN DAVET KODUN</span>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-pink-200">
              <span className="font-mono font-bold text-gray-700 text-sm tracking-wider">{inviteCode}</span>
              <button onClick={copyInviteLink} className="text-pink-500 hover:text-pink-600 p-1 rounded-lg">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-gray-400 font-bold uppercase">VEYA</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handlePairWithCode} className="space-y-3">
            <input
              type="text"
              placeholder="Sevgilinin Kodunu Yapıştır..."
              value={inputInviteCode}
              onChange={(e) => setInputInviteCode(e.target.value)}
              className="w-full bg-gray-50 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-pink-300 text-center font-mono"
            />
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-pink-600 transition"
            >
              Eşleş ve Başla ✨
            </button>
          </form>

          <button onClick={handleSignOut} className="mt-4 text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1 mx-auto">
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-purple-100 text-gray-800 flex flex-col items-center p-4 relative ${isVibrating ? 'animate-bounce' : ''}`}>
      
      {/* HEADER */}
      <header className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-3 px-4 shadow-sm border border-pink-100 flex items-center justify-between mb-4 relative z-40">
        <div className="flex items-center gap-2">
          <div className="bg-pink-100 p-2 rounded-xl text-pink-500"><Calendar size={18} /></div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">Birlikte</span>
            <span className="text-xs font-bold text-gray-700">{duration.days} gün {duration.hours} sa</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
            <Coins className="text-amber-500 w-3.5 h-3.5" />
            <span className="text-xs font-bold text-amber-700">{coins} Altın</span>
          </div>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-xl transition relative">
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-pink-100 p-3 z-50">
                <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Bildirimler 🔔</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 bg-pink-50/50 rounded-xl text-xs border border-pink-100/50">
                      <p className="font-medium text-gray-800">{n.text}</p>
                      <span className="text-[9px] text-gray-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-500 transition rounded-xl">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="w-full max-w-md flex-1 bg-white rounded-3xl shadow-lg border border-pink-100 p-5 mb-20 flex flex-col relative overflow-hidden">
        
        {/* ORTAK ODA (TİTREŞİM VE TİTRETME) */}
        {activeTab === 'room' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <p className="text-[11px] text-pink-500 font-bold mb-2 uppercase tracking-wider">Sevgilini Titretmek İçin Basılı Tut 👇</p>
            
            <div 
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className={`w-28 h-28 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer select-none transition transform active:scale-90 mb-6 ${isVibrating ? 'animate-ping' : 'hover:scale-105'}`}
            >
              <Heart size={44} className="fill-white animate-pulse" />
              <span className="text-[9px] font-bold mt-1">DÜRT / TİTRET</span>
            </div>

            <h2 className="font-bold text-lg text-gray-700 mb-1">Ortak Oda 🏡</h2>
            <p className="text-xs text-gray-400 max-w-xs mb-4">Kalbe basılı tutarak sevgilinin telefonunu titretebilirsin!</p>
            
            <div className="w-full bg-pink-50 border border-pink-100 rounded-2xl p-3.5 text-left space-y-2">
              <div className="flex justify-between text-xs"><span className="text-gray-500">Durum:</span><span className="font-bold text-green-600 flex items-center gap-1"><ShieldCheck size={14}/> Eşleşme Aktif</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Kazanılan Günlük Altın:</span><span className="font-bold text-amber-600">+5 Altın / Gün</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Birlikte Geçen Süre:</span><span className="font-bold text-pink-600">{duration.days} Gün {duration.hours} Sa</span></div>
            </div>
          </div>
        )}

        {/* KUPONLARIM SEKME HAREKETİ VE KULLANMA */}
        {activeTab === 'coupons' && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-bold text-lg text-gray-700 mb-1">Aşk Kuponları 🎟️</h2>
            <p className="text-xs text-gray-400 mb-4">Sahip olduğun ve dükkandan aldığın kuponlar.</p>
            
            <form onSubmit={handleAddCoupon} className="flex gap-2 mb-4">
              <input type="text" placeholder="Özel kupon ekle..." value={newCouponTitle} onChange={(e) => setNewCouponTitle(e.target.value)} className="flex-1 bg-gray-50 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-pink-300" />
              <button type="submit" className="bg-pink-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-pink-600 transition"><Plus size={18} /></button>
            </form>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">Henüz kullanılabilir kuponunuz yok. Dükkandan satın alabilirsiniz! 🛍️</div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className={`p-3.5 rounded-2xl border flex items-center justify-between ${coupon.status === 'redeemed' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-pink-50/50 border-pink-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-pink-100 text-pink-500"><Ticket size={18} /></div>
                      <div>
                        <h3 className={`text-sm font-semibold ${coupon.status === 'redeemed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{coupon.title}</h3>
                        <span className="text-[10px] text-gray-400">Bedel: {coupon.cost} Altın</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggleCoupon(coupon.id, coupon.status)} className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${coupon.status === 'redeemed' ? 'bg-gray-200 text-gray-600' : 'bg-pink-500 text-white hover:bg-pink-600'}`}>
                      <CheckCircle2 size={16} /> {coupon.status === 'redeemed' ? 'Kullanıldı' : 'Kullan'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SAATLİK / HAFTALIK VE 3'ERLİ DÜKKAN */}
        {activeTab === 'shop' && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-bold text-lg text-gray-700 mb-1">Aşk Dükkanı 🛍️</h2>
            <p className="text-xs text-gray-400 mb-3">Altınlarınla sürpriz kuponlar satın al.</p>
            
            {/* Saatlik/Günlük ve Haftalık Tab Seçimi */}
            <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setShopTab('daily')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                  shopTab === 'daily' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Clock size={14} /> Saatlik / Günlük (3 Tane)
              </button>
              <button
                onClick={() => setShopTab('weekly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                  shopTab === 'weekly' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Sparkles size={14} /> Haftalık (3 Tane)
              </button>
            </div>

            {/* ÜRÜNLER LİSTESİ */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {(shopTab === 'daily' ? dailyShopItems : weeklyShopItems).map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/80 to-purple-50/80 border border-pink-100 flex flex-col justify-between gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">{item.category}</span>
                      <h3 className="text-sm font-bold text-gray-800 mt-1">{item.title}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <Coins size={12}/> {item.price}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleBuyItem(item)} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-xl shadow transition flex items-center justify-center gap-1"
                  >
                    Satın Al (Kuponlarıma Ekle)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDGET */}
        {activeTab === 'widget' && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-bold text-lg text-gray-700 mb-1">Anlık Widget Durumu 📱</h2>
            <p className="text-xs text-gray-400 mb-4">Sevgilinin telefon ekranındaki mesajı güncelle.</p>
            <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-3xl p-5 text-white shadow-md mb-6 flex flex-col justify-between h-36">
              <span className="text-xs font-medium uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full w-fit">Manitalar Widget</span>
              <div>
                <p className="text-sm font-medium text-white/90">Anlık Durum:</p>
                <p className="text-lg font-bold truncate mt-0.5">“{statusMessage}”</p>
              </div>
            </div>
            <form onSubmit={handleUpdateWidget} className="flex gap-2">
              <input type="text" placeholder="Yeni durum mesajı yaz..." value={widgetInput} onChange={(e) => setWidgetInput(e.target.value)} className="flex-1 bg-gray-50 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-pink-300" />
              <button type="submit" className="bg-pink-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-pink-600 transition"><Send size={18} /></button>
            </form>
          </div>
        )}

        {/* ANILAR */}
        {activeTab === 'memories' && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-bold text-lg text-gray-700 mb-1">Aşk Zaman Tüneli 📖</h2>
            <p className="text-xs text-gray-400 mb-4">Birlikte yazdığınız anı defteri.</p>
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
              <span className="text-xs text-pink-600 font-bold">31 Ekim 2024</span>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">İlişkinin Başlangıcı 💕</p>
            </div>
          </div>
        )}
      </main>

      {/* ALT MENÜ */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/90 backdrop-blur-md border border-pink-100 rounded-2xl shadow-lg p-2 flex justify-around items-center z-50">
        {[
          { id: 'room', label: 'Odamız', icon: Home },
          { id: 'coupons', label: 'Kuponlar', icon: Ticket },
          { id: 'shop', label: 'Dükkan', icon: ShoppingBag },
          { id: 'widget', label: 'Widget', icon: Smartphone },
          { id: 'memories', label: 'Anılar', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${isActive ? 'bg-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon size={18} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}