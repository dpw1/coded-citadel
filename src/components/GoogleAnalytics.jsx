import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const GA_MEASUREMENT_ID = 'G-E0D1EJTW08'

export default function GoogleAnalytics() {
  const { pathname, search } = useLocation()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname + search,
    })
  }, [pathname, search])

  return null
}
