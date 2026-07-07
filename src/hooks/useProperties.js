// Purpose: Fetch properties for the family account from Supabase.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAMILY_OWNER_ID } from '../lib/constants'

export function useProperties() {
  const { t } = useTranslation()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadProperties = async () => {
      setLoading(true)
      setError(null)

      try {
        const { supabase } = await import('../lib/supabase')
        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', FAMILY_OWNER_ID)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (supabaseError) {
          throw supabaseError
        }

        if (!ignore) {
          setProperties(data ?? [])
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || t('common.errors.loadProperties'))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProperties()

    return () => {
      ignore = true
    }
  }, [])

  return { properties, loading, error }
}
