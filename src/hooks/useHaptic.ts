import { useState } from 'react'

export function useHaptic() {
  const [isActivating, setIsActivating] = useState(false)

  const triggerTouch = (onComplete?: () => void) => {
    setIsActivating(true)

    // Mobil cihazlarda titreşim desteği
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 80, 150])
    }

    setTimeout(() => {
      setIsActivating(false)
      if (onComplete) onComplete()
    }, 1200)
  }

  return { isActivating, triggerTouch }
}