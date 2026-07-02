// Purpose: Display the public landing page for Residence Amira.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProperties } from '../hooks/useProperties'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import '../styles/Home.css'

export function Home() {
  const { t } = useTranslation()
  const { properties, loading, error } = useProperties()
  const featured = properties.slice(0, 4)

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p className="hero-text">{t('home.lead')}</p>
          <div className="hero-actions">
            <Link className="button primary" to="/properties">
              {t('home.viewProperties')}
            </Link>
            <Link className="button secondary" to="/about">
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">{t('home.featuredEyebrow')}</p>
          <h2>{t('home.featuredTitle')}</h2>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && featured.length === 0 && (
          <p className="empty-state">{t('home.emptyFeatured')}</p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
