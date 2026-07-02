// Purpose: Provide a lightweight loading indicator for async data states.
import { useTranslation } from 'react-i18next'

export function LoadingSpinner() {
  const { t } = useTranslation()
  return <div className="loading-state" aria-live="polite">{t('common.loading')}</div>
}
