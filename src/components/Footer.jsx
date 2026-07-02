// Purpose: Render the shared footer for the public website.
import { useTranslation } from 'react-i18next'
import '../styles/Footer.css'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>{t('footer.copy', { year })}</p>
    </footer>
  )
}
