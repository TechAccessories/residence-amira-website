import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'
import '../styles/Navbar.css'

export function Navbar() {
  const { t, i18n } = useTranslation()

  return (
    <header className="site-header">
      <NavLink className="brand" to="/">
        <img src={logo} alt="Résidence Amira" className="brand-logo" />
        Résidence Amira
      </NavLink>

      <nav className="site-nav" aria-label={t('nav.primaryNavigation')}>
        <NavLink to="/#properties">{t('nav.properties')}</NavLink>
        <NavLink to="/contact">{t('nav.contact')}</NavLink>

        <div className="lang-toggle" style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('fr')}
            style={{ fontWeight: i18n.language === 'fr' ? 700 : 400 }}
          >
            FR
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            style={{ fontWeight: i18n.language === 'en' ? 700 : 400 }}
          >
            EN
          </button>
        </div>
      </nav>
    </header>
  )
}