import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function ArrowIcon({ direction = 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${direction === 'left' ? 'rotate-180' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function PropertyImageCarousel({
  images,
  title,
  className = '',
  imageClassName = '',
  onClick,
  autoAdvance = true,
}) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    setCurrentIndex(0)
  }, [images.length])

  useEffect(() => {
    if (!autoAdvance || !hasMultipleImages || isHovered) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [autoAdvance, hasMultipleImages, images.length, isHovered])

  const goToPrevious = (event) => {
    event.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = (event) => {
    event.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (event, index) => {
    event.stopPropagation()
    setCurrentIndex(index)
  }

  if (!images.length) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 text-sm font-semibold text-slate-600 ${className}`}>
        {t('common.noImage')}
      </div>
    )
  }

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${title} ${index + 1}`}
            className={`h-full w-full shrink-0 object-cover ${imageClassName}`}
          />
        ))}
      </div>

      {hasMultipleImages && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-80" />
          <button
            type="button"
            aria-label={t('common.previousImage')}
            onClick={goToPrevious}
            className={`absolute left-3 top-1/2 z-10 flex h-9 w-9 min-h-0 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-lg backdrop-blur-sm transition-all duration-200 ${
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
            }`}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label={t('common.nextImage')}
            onClick={goToNext}
            className={`absolute right-3 top-1/2 z-10 flex h-9 w-9 min-h-0 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-lg backdrop-blur-sm transition-all duration-200 ${
              isHovered ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0'
            }`}
          >
            <ArrowIcon />
          </button>
          {/* Dot indicators — min-h-0 + shrink-0 override the global
              `button { min-height: 44px }` rule in index.css, which was
              previously stretching these into vertical pills instead of
              perfect 10px circles. */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t('common.goToImage', { index: index + 1 })}
                onClick={(event) => goToSlide(event, index)}
                className={`no-touch-target h-2.5 w-2.5 p-0 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/55 hover:bg-white/80'
              }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PropertyImageCarousel
