import { useCallback, useEffect, useState } from 'react'
import { getEventCount, initPluginEvents, recordEvent } from '../lib/pluginEvents'

export function usePluginEvents(pluginSlug) {
  const [downloadCount, setDownloadCount] = useState(null)
  const [downloadCountReady, setDownloadCountReady] = useState(false)

  useEffect(() => {
    if (!pluginSlug) return undefined

    initPluginEvents()

    let cancelled = false
    getEventCount(pluginSlug, 'download_click').then((count) => {
      if (!cancelled) {
        setDownloadCount(count)
        setDownloadCountReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [pluginSlug])

  const trackDownloadClick = useCallback(
    (meta = {}) => {
      recordEvent('download_click', pluginSlug, meta)
    },
    [pluginSlug],
  )

  const trackModalOpen = useCallback(() => {
    recordEvent('modal_open', pluginSlug)
  }, [pluginSlug])

  const trackSocialClick = useCallback(
    (platform) => {
      recordEvent('social_click', pluginSlug, { platform })
    },
    [pluginSlug],
  )

  const trackModalSkip = useCallback(() => {
    recordEvent('modal_skip', pluginSlug)
  }, [pluginSlug])

  const trackFaqOpen = useCallback(
    (question) => {
      recordEvent('faq_open', pluginSlug, { question })
    },
    [pluginSlug],
  )

  return {
    downloadCount,
    downloadCountReady,
    trackDownloadClick,
    trackModalOpen,
    trackSocialClick,
    trackModalSkip,
    trackFaqOpen,
  }
}
