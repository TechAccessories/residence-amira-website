import { useEffect, useState } from 'react'

function AnimatedModal({ open, onClose, children, panelClassName = '' }) {
  const [isMounted, setIsMounted] = useState(open)
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setIsMounted(true)
      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true)
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    setIsVisible(false)
    const timeoutId = window.setTimeout(() => {
      setIsMounted(false)
    }, 220)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  useEffect(() => {
    if (!isMounted) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMounted, onClose])

  if (!isMounted) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center px-4 py-8">
        <div
          className={`w-full rounded-3xl bg-white shadow-2xl transition-all duration-200 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } ${panelClassName}`}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default AnimatedModal
