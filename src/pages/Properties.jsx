// Purpose: List all properties available through the public website.
import { useTranslation } from 'react-i18next'
import { useProperties } from '../hooks/useProperties'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import '../styles/Properties.css'

export function Properties() {
  const { t } = useTranslation()
  const { properties, loading, error } = useProperties()

  return (
    <div className="properties-page">
      <section className="section-heading">
        <p className="eyebrow">{t('properties.eyebrow')}</p>
        <h1>{t('properties.title')}</h1>
        <p className="page-intro">{t('properties.lead')}</p>
      </section>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && properties.length === 0 && (
        <p className="empty-state">{t('properties.empty')}</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
