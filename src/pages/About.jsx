// Purpose: Provide a simple about page for the public-facing brand.
import { useTranslation } from 'react-i18next'
import '../styles/About.css'

export function About() {
  const { t } = useTranslation()

  return (
    <div className="about-page">
      <section className="page-section">
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h1>{t('about.title')}</h1>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
      </section>
    </div>
  )
}
