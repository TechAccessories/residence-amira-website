// Purpose: Fetch a single property, its images, and booking history for availability.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function useProperty(id) {
  const { t } = useTranslation()
  const [property, setProperty] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadProperty = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { supabase } = await import('../lib/supabase')
        const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single()

        if (propertyError) {
          throw propertyError
        }

        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', id)
          .order('check_in', { ascending: true })

        if (bookingError) {
          throw bookingError
        }

        if (!ignore) {
          setProperty(propertyData)
          setBookings(bookingData ?? [])
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || t('common.errors.loadProperty'))
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProperty()

    return () => {
      ignore = true
    }
  }, [id])

  return { property, bookings, loading, error }
}
