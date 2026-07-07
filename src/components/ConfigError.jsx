// Purpose: Display a clear error screen when Supabase environment variables are missing.
import { useTranslation } from 'react-i18next'

export function ConfigError() {
  const { t } = useTranslation()

  return (
    <div className="error-state" role="alert">
      <h1>{t('configError.title')}</h1>
      <p>{t('configError.message')}</p>
    </div>
  )
}
