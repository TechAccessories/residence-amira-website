// Purpose: Collect booking details and submit them to the shared bookings table.
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/BookingForm.css'

export function BookingForm({ propertyId, onSubmit, unavailableDates, loading, bookingError, success, submitted }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ guestName: '', guestEmail: '', checkIn: '', checkOut: '' })

  const dateRanges = useMemo(() => {
    return (unavailableDates || []).map((range) => ({
      start: range.check_in,
      end: range.check_out,
    }))
  }, [unavailableDates])

  const isDateBlocked = (date, type) => {
    if (!date) {
      return false
    }

    return dateRanges.some((range) => {
      const current = new Date(date)
      const start = new Date(range.start)
      const end = new Date(range.end)

      if (type === 'checkIn') {
        return current >= start && current < end
      }

      return current > start && current <= end
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>{t('bookingForm.title')}</h2>
      <p className="booking-caption">{t('bookingForm.caption')}</p>

      <label>
        {t('bookingForm.guestName')}
        <input
          type="text"
          value={form.guestName}
          onChange={(event) => setForm({ ...form, guestName: event.target.value })}
          required
        />
      </label>

      <label>
        {t('bookingForm.email')}
        <input
          type="email"
          value={form.guestEmail}
          onChange={(event) => setForm({ ...form, guestEmail: event.target.value })}
          required
        />
      </label>

      <label>
        {t('bookingForm.checkIn')}
        <input
          type="date"
          value={form.checkIn}
          min={new Date().toISOString().split('T')[0]}
          onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
          required
          onBlur={() => {
            if (form.checkOut && form.checkIn && form.checkIn >= form.checkOut) {
              setForm({ ...form, checkOut: '' })
            }
          }}
        />
      </label>

      <label>
        {t('bookingForm.checkOut')}
        <input
          type="date"
          value={form.checkOut}
          min={form.checkIn || new Date().toISOString().split('T')[0]}
          onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
          required
        />
      </label>

      <div className="date-help">
        <p>{t('bookingForm.dateHelp')}</p>
      </div>

      <button className="button primary" type="submit" disabled={loading}>
        {loading ? t('bookingForm.submitting') : t('bookingForm.requestBooking')}
      </button>

      {bookingError && <p className="form-message error">{bookingError}</p>}
      {success && <p className="form-message success">{success}</p>}
      {submitted && <p className="form-message success">{t('bookingForm.submittedMessage', { propertyId })}</p>}
    </form>
  )
}
