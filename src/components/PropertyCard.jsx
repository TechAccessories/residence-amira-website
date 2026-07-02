// Purpose: Render a compact property preview card used across the home and listings pages.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PropertyImageCarousel from '../components/PropertyImageCarousel'
import '../styles/PropertyCard.css'

const placeholderImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'

export function PropertyCard({ property }) {
  const imageList = Array.isArray(property?.images) && property.images.length > 0
    ? property.images.map((image) => (typeof image === 'string' ? image : image?.image_url)).filter(Boolean)
    : property?.image_url
      ? [property.image_url]
      : []

  const title = property?.publication_title || property?.name || property?.title || 'Untitled Property'
  const { t } = useTranslation()

  const priceLabel = property?.price_per_night != null
    ? `${Number(property.price_per_night).toFixed(2)} TND / night`
    : t('propertyCard.priceUnavailable')

  return (
    <article className="property-card">
      <PropertyImageCarousel
        images={imageList}
        title={title}
        className="h-72 w-full rounded-t-xl"
        imageClassName="rounded-t-xl"
        autoAdvance
      />
      <div className="property-card-body">
        <h3>{title}</h3>
        <p className="property-price">{priceLabel}</p>
        <p className="property-description">{property?.description}</p>
        <Link
          to={`/properties/${property.id}`}
          className="property-card-button"
        >
          {t('propertyCard.viewDetails')}
        </Link>
      </div>
    </article>
  )
}
