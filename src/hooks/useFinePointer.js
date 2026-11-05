import { useEffect, useState } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

export function useFinePointer() {
  const [finePointer, setFinePointer] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const sync = () => setFinePointer(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return finePointer
}
