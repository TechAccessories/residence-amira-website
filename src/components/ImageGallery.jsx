// Purpose: Render a lightweight image gallery for a property detail page.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/ImageGallery.css'

const placeholderImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'

export function ImageGallery({ images, title }) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const galleryImages = (images?.length ? images : [{ image_url: placeholderImage }]).map((image) => image.image_url)

  if (!galleryImages.length) {
    galleryImages.push(placeholderImage)
  }

  const activeImage = galleryImages[activeIndex] || placeholderImage

  return (
    <div className="image-gallery">
      <img src={activeImage} alt={title} className="gallery-main-image" />
      <div className="gallery-thumbs" aria-label={t('common.propertyImages')}>
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={`gallery-thumb ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <img src={image} alt={t('common.imagePreview', { title, index: index + 1 })} />
          </button>
        ))}
      </div>
    </div>
  )
}
