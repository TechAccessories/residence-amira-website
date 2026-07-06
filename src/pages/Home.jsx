// Purpose: Display the public landing page for Résidence Amira with a richer,
// more visual layout — hero image, trust/feature strip, properties grid, and
// an ambience gallery — leading naturally into the contact page.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProperties } from '../hooks/useProperties'
import { PropertyCard } from '../components/PropertyCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import '../styles/Home.css'
import '../styles/Properties.css'
import gallery1 from '../assets/gallery/beach1.jpeg'
import gallery2 from '../assets/gallery/beach2.jpeg'
import gallery3 from '../assets/gallery/rue1.jpeg'
import gallery4 from '../assets/gallery/rue2.jpeg'
import gallery5 from '../assets/gallery/rue3.jpeg'


const GALLERY_IMAGES = [gallery1, gallery2, gallery3, gallery4, gallery5]

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80'

const FEATURES = [
  {
    icon: '🛋️',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    titleKey: 'home.features.comfort.title',
    textKey: 'home.features.comfort.text',
  },
  {
    icon: '📍',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',
    titleKey: 'home.features.location.title',
    textKey: 'home.features.location.text',
  },
  {
    icon: '🤝',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    titleKey: 'home.features.service.title',
    textKey: 'home.features.service.text',
  },
]



export function Home() {
  const { t } = useTranslation()
  const { properties, loading, error } = useProperties()

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p className="hero-text">{t('home.lead')}</p>
          <div className="hero-actions">
            <a className="button primary" href="#properties">
              {t('home.viewProperties')}
            </a>
          </div>
        </div>
      </section>

      

      {/* Properties */}
      <section id="properties" className="section-block">
        <div className="section-heading">
          
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

      {/* Ambience gallery */}
      <section className="section-block gallery-section">
        <div className="section-heading">
          <p className="eyebrow">{t('home.galleryEyebrow')}</p>
          <h2>{t('home.galleryTitle')}</h2>
        </div>
        <div className="ambience-gallery">
            {GALLERY_IMAGES.map((src, index) => (
              <button
                type="button"
                className={`ambience-gallery-item ${index === 0 ? 'featured' : ''}`}
                key={src}
                onClick={() => setLightboxIndex(index)}
              >
                <img src={src} alt={`${t('home.galleryTitle')} ${index + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
      </section>

      {/* CTA banner into contact */}
      <section className="section-block cta-section">
        <div className="cta-card">
          <div>
            <p className="eyebrow">{t('home.ctaEyebrow')}</p>
            <h2>{t('home.ctaTitle')}</h2>
            <p>{t('home.ctaText')}</p>
          </div>
          <Link className="button primary" to="/contact">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  )
}
