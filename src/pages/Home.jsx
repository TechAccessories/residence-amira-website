// Purpose: Display the public landing page for Residence Amira.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProperties } from '../hooks/useProperties'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import '../styles/Home.css'
import '../styles/Properties.css'

export function Home() {
  const { t } = useTranslation()
  const { properties, loading, error } = useProperties()

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p className="hero-text">{t('home.lead')}</p>
          <div className="hero-actions">
            <Link className="button secondary" to="/about">
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      <section id="properties" className="section-block">
        <div className="section-heading">
          <p className="eyebrow">{t('home.featuredEyebrow')}</p>
          <h2>{t('home.ourProperties')}</h2>
          <p className="page-intro">{t('properties.lead')}</p>
        </div>

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
      </section>
    </div>
  )
}
