// Purpose: Submit a booking request to the shared Supabase bookings table.
import { useState } from 'react'
import i18n from 'i18next'

export function useCreateBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const createBooking = async ({ property_id, guest_name, guest_email, check_in, check_out }) => {
    if (!property_id || !guest_name || !guest_email || !check_in || !check_out) {
      const message = i18n.t('bookingForm.fillRequired')
      setError(message)
      return { ok: false, message }
    }

    if (check_out <= check_in) {
      const message = i18n.t('bookingForm.checkOutLater')
      setError(message)
      return { ok: false, message }
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { supabase } = await import('../lib/supabase')
      const { data: existingBookings, error: lookupError } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', property_id)

      if (lookupError) {
        throw lookupError
      }

      const hasOverlap = (existingBookings ?? []).some((booking) => {
        return check_in < booking.check_out && check_out > booking.check_in
      })

      if (hasOverlap) {
        const message = i18n.t('bookingForm.overlapError')
        setError(message)
        return { ok: false, message }
      }

      const { error: insertError } = await supabase.from('bookings').insert([
        {
          property_id,
          guest_name,
          guest_email,
          check_in,
          check_out,
          status: 'pending',
        },
      ])

      if (insertError) {
        throw insertError
      }

      const message = i18n.t('bookingForm.submittedSuccess')
      setSuccess(message)
      return { ok: true, message }
    } catch (err) {
      const message = err.message || i18n.t('bookingForm.submitError')
      setError(message)
      return { ok: false, message }
    } finally {
      setLoading(false)
    }
  }

  return { createBooking, loading, error, success }
}
