import { useEffect, useCallback } from 'react'
import { useTheme } from './useTheme'

export function useAppFavicon(lightUrl: string | null, darkUrl: string | null) {
  const { theme } = useTheme()

  const applyFavicon = useCallback(
    (isDark: boolean) => {
      const url = isDark && darkUrl ? darkUrl : lightUrl
      const link =
        (document.querySelector('link[rel="icon"]') as HTMLLinkElement | null) ??
        (() => {
          const el = document.createElement('link')
          el.rel = 'icon'
          document.head.appendChild(el)
          return el
        })()

      if (url) {
        link.type = 'image/png'
        link.href = url
      } else {
        link.type = 'image/svg+xml'
        link.href = '/vite.svg'
      }
    },
    [lightUrl, darkUrl]
  )

  // React to app theme toggle
  useEffect(() => {
    applyFavicon(theme === 'dark')
  }, [theme, applyFavicon])

  // Also react to OS-level color scheme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => applyFavicon(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [applyFavicon])

  // Reset to default favicon when component unmounts
  useEffect(() => {
    return () => {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
      if (link) {
        link.type = 'image/svg+xml'
        link.href = '/vite.svg'
      }
    }
  }, [])
}
