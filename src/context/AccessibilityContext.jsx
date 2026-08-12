import { createContext, useContext, useEffect, useState } from 'react'

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('bes_contrast') === 'high')
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('bes_font_scale')) || 1)
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('bes_motion') === 'reduced')

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal')
    localStorage.setItem('bes_contrast', highContrast ? 'high' : 'normal')
  }, [highContrast])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale))
    localStorage.setItem('bes_font_scale', String(fontScale))
  }, [fontScale])

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', reducedMotion ? 'reduced' : 'normal')
    localStorage.setItem('bes_motion', reducedMotion ? 'reduced' : 'normal')
  }, [reducedMotion])

  const value = {
    highContrast,
    toggleContrast: () => setHighContrast((v) => !v),
    fontScale,
    increaseFont: () => setFontScale((v) => Math.min(1.4, +(v + 0.1).toFixed(1))),
    decreaseFont: () => setFontScale((v) => Math.max(0.9, +(v - 0.1).toFixed(1))),
    resetFont: () => setFontScale(1),
    reducedMotion,
    toggleMotion: () => setReducedMotion((v) => !v),
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  return ctx
}
