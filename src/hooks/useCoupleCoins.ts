import { useState, useEffect } from 'react'

export function useCoupleCoins(startedAt: string) {
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [coins, setCoins] = useState(0)

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startedAt).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, now - start)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setDuration({ days, hours, minutes, seconds })
      
      const totalMinutes = Math.floor(diff / (1000 * 60))
      setCoins(totalMinutes)
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return { duration, coins }
}

// Her ihtimale karşı default export da ekliyoruz
export default useCoupleCoins