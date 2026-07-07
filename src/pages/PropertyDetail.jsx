import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import AnimatedModal from '../components/AnimatedModal'
import PropertyCalendar from '../components/PropertyCalendar'
import { supabase } from '../lib/supabase'
import { fetchPublicBookingRanges, rangesOverlap } from '../lib/bookingAvailability'
import '../styles/PropertyDetail.css'

const AMENITY_MAP = {
  wifi: { icon: '📶' },
  pool: { icon: '🏊' },
  ac: { icon: '❄️' },
  parking: { icon: '🚗' },
  kitchen: { icon: '🍳' },
  washer: { icon: '🫧' },
  tv: { icon: '📺' },
  gym: { icon: '🏋️' },
  balcony: { icon: '🌅' },
  pets: { icon: '🐾' },
}

function getTodayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getNextDayValue(dateStr) {
  if (!dateStr) return getTodayInputValue()
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  const diffMs = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
}

export function PropertyDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [form, setForm] = useState({
    customer_name: '',
    customer_contact: '',
    check_in: '',
    check_out: '',
    guest_count: '1',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let ignore = false

    const loadProperty = async () => {
      if (!id) {
        if (!ignore) setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const { data, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .eq('is_public', true)
          .single()

        if (propertyError) {
          throw propertyError
        }

        if (!ignore) {
          setProperty(data)
        }

        const bookingRanges = await fetchPublicBookingRanges(id)
        if (!ignore) {
          setBookings(bookingRanges)
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

  const imageList = useMemo(() => {
    if (Array.isArray(property?.images) && property.images.length > 0) {
      return property.images
        .map((image) => (typeof image === 'string' ? image : image?.image_url))
        .filter(Boolean)
    }

    if (property?.image_url) {
      return [property.image_url]
    }

    return []
  }, [property])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [imageList.length])

  const displayTitle = property?.publication_title || property?.name || property?.title || t('propertyDetail.untitled')
  const nights = calculateNights(form.check_in, form.check_out)
  const totalPrice = nights * Number(property?.price_per_night || 0)

  const hasDateOverlap = (checkIn, checkOut) =>
    bookings.some((booking) => rangesOverlap(checkIn, checkOut, booking.check_in, booking.check_out))

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'check_in' && value && form.check_out && value >= form.check_out) {
      setError(t('propertyDetail.errors.checkOutAfterCheckIn'))
      setForm((prev) => ({
        ...prev,
        check_in: value,
        check_out: '',
      }))
      return
    }

    if (name === 'check_out' && value && form.check_in && value <= form.check_in) {
      setError(t('propertyDetail.errors.checkOutAfterCheckIn'))
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
      return
    }

    setError('')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!property) {
      return t('propertyDetail.errors.chooseDates')
    }

    if (!form.check_in || !form.check_out) {
      return t('propertyDetail.errors.chooseDates')
    }

    if (form.check_in >= form.check_out) {
      return t('propertyDetail.errors.checkOutAfterCheckIn')
    }

    const guestCount = Number(form.guest_count)
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      return t('propertyDetail.errors.validGuests')
    }

    if (hasDateOverlap(form.check_in, form.check_out)) {
      return t('propertyDetail.errors.datesUnavailable')
    }

    return ''
  }

  const handleReviewBooking = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const validationError = validateForm()
      if (validationError) {
        throw new Error(validationError)
      }

      const guestCount = Number(form.guest_count)
      const payload = {
        property_id: property.id,
        owner_id: property.owner_id,
        customer_name: form.customer_name,
        customer_contact: form.customer_contact,
        check_in: form.check_in,
        check_out: form.check_out,
        note: form.note,
        status: 'pending',
        num_guests: guestCount,
        guest_count: guestCount,
      }

      const { error: insertError } = await supabase.from('booking_requests').insert([payload])
      if (insertError) {
        throw insertError
      }

      setSuccess(t('propertyDetail.submitted'))
      setForm({
        customer_name: '',
        customer_contact: '',
        check_in: '',
        check_out: '',
        guest_count: '1',
        note: '',
      })
      setShowConfirm(false)
      setShowForm(false)
    } catch (err) {
      setError(err.message || t('propertyDetail.submitError'))
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
        >
          ← {t('propertyDetail.backToProperties')}
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {/* ---------- Gallery: big main image + thumbnail strip ---------- */}
          <section className="space-y-3">
            <div
              className="aspect-[4/3] sm:aspect-[16/9] max-h-[520px] w-full cursor-pointer overflow-hidden rounded-2xl bg-slate-100"
              onClick={() => {
                setLightboxImageIndex(currentImageIndex)
                setShowLightbox(true)
              }}
            >
              {imageList.length > 0 ? (
                <img
                  src={imageList[currentImageIndex]}
                  alt={displayTitle}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 text-sm font-semibold text-slate-600">
                  {t('common.noImage')}
                </div>
              )}
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageList.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200 hover:scale-105 ${
                      index === currentImageIndex ? 'ring-2 ring-emerald-500' : 'ring-1 ring-slate-200'
                    }`}
                  >
                    <img src={image} alt={`${displayTitle} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ---------- Title row ---------- */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">{t('propertyDetail.eyebrow')}</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{displayTitle}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <span>📍</span> {property?.location}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-emerald-700 lg:hidden"
            >
              {t('propertyDetail.requestBooking')}
            </button>
          </div>

          {/* ---------- Content + sticky booking sidebar ---------- */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl">🛏️</p>
                  <p className="mt-1 text-sm text-slate-500">{t('propertyDetail.beds')}</p>
                  <p className="text-lg font-semibold text-slate-900">{property?.num_beds ?? '—'}</p>
                </div>
                {property?.max_guests != null && (
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl">👥</p>
                    <p className="mt-1 text-sm text-slate-500">{t('propertyDetail.maxGuests')}</p>
                    <p className="text-lg font-semibold text-slate-900">{property.max_guests}</p>
                  </div>
                )}
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl">📅</p>
                  <p className="mt-1 text-sm text-slate-500">{t('propertyDetail.availability')}</p>
                  <p className="text-sm font-semibold text-slate-900">{t('propertyDetail.checkCalendar')}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('propertyDetail.descriptionTitle')}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{property?.description}</p>
              </div>

              {Array.isArray(property?.amenities) && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{t('propertyDetail.amenitiesTitle')}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.amenities.map((key) => {
                      const amenity = AMENITY_MAP[key]
                      if (!amenity) return null
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          <span>{amenity.icon}</span>
                          {t(`amenities.${key}`)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {property?.house_rules?.trim() && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{t('propertyDetail.houseRules')}</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{property.house_rules}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('propertyDetail.location')}</h2>
                <p className="mt-1 text-sm text-slate-500">{property?.location}</p>
                {property?.location?.trim() && (
                  <div className="mt-4 overflow-hidden rounded-3xl bg-slate-100">
                    <iframe
                      title={t('propertyDetail.mapTitle')}
                      width="100%"
                      height="280"
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed&z=13`}
                    />
                    <div className="p-4">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700"
                      >
                        📍 {t('common.viewOnGoogleMaps')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('propertyDetail.availability')}</h2>
                <PropertyCalendar bookings={bookings} isOwner={false} />
              </div>
            </div>

            {/* ---------- Sticky booking sidebar (desktop) ---------- */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t('propertyDetail.price')}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {property?.price_per_night
                    ? `${Number(property.price_per_night).toFixed(2)} TND`
                    : t('propertyCard.priceUnavailable')}
                  {property?.price_per_night && <span className="text-sm font-normal text-slate-500">{t('propertyDetail.perNightSuffix')}</span>}
                </p>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-emerald-700"
                >
                  {t('propertyDetail.requestBooking')}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">{t('propertyDetail.checkCalendar')}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <AnimatedModal open={showForm} onClose={() => setShowForm(false)} panelClassName="max-w-3xl p-6 sm:p-8">
        <form onSubmit={handleReviewBooking}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">{t('propertyDetail.bookingRequest')}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{t('propertyDetail.bookingModalTitle')}</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              {t('common.close')}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('bookingForm.guestName')}</label>
              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('bookingForm.email')}</label>
              <input
                type="text"
                name="customer_contact"
                value={form.customer_contact}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('bookingForm.checkIn')}</label>
              <input
                type="date"
                name="check_in"
                value={form.check_in}
                min={getTodayInputValue()}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('bookingForm.checkOut')}</label>
              <input
                type="date"
                name="check_out"
                value={form.check_out}
                min={getNextDayValue(form.check_in)}
                onChange={handleChange}
                required
                disabled={!form.check_in}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t('propertyDetail.guestCount')}</label>
              <input
                type="number"
                name="guest_count"
                value={form.guest_count}
                min="1"
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                {t('propertyDetail.totalSummary', { total: totalPrice.toFixed(2), count: nights })}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {t('propertyDetail.priceTimesNights', {
                  price: Number(property?.price_per_night || 0).toFixed(2),
                  count: nights,
                })}
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('propertyDetail.messageOptional')}</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-emerald-500"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-600">{success}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {t('bookingForm.requestBooking')}
            </button>
          </div>
        </form>
      </AnimatedModal>

      <AnimatedModal open={showConfirm} onClose={() => setShowConfirm(false)} panelClassName="max-w-md p-6">
        <h3 className="text-xl font-black text-slate-900">{t('propertyDetail.confirmTitle')}</h3>
        <p className="mt-2 text-sm text-slate-600">{t('propertyDetail.confirmLead')}</p>

        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex justify-between"><span className="text-slate-500">{t('bookingForm.checkIn')}</span><span className="font-medium">{form.check_in}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">{t('bookingForm.checkOut')}</span><span className="font-medium">{form.check_out}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">{t('propertyDetail.guestCount')}</span><span className="font-medium">{form.guest_count}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-semibold text-slate-900">{t('propertyDetail.totalLabel')}</span><span className="font-semibold text-emerald-700">{totalPrice.toFixed(2)} TND</span></div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={submitting}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {submitting ? t('propertyDetail.sending') : t('propertyDetail.confirmAndSend')}
          </button>
        </div>
      </AnimatedModal>

      {showLightbox && imageList.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="absolute right-0 top-0 z-20 rounded-full bg-slate-950/80 p-3 text-2xl text-white"
            >
              ×
            </button>
            <img
              src={imageList[lightboxImageIndex]}
              alt={displayTitle}
              className="max-h-[90vh] w-full object-contain rounded-3xl"
            />
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setLightboxImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))
                  }}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-950/60 p-3 text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setLightboxImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))
                  }}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-950/60 p-3 text-white"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-950/70 px-4 py-2 text-sm text-white">
                  {lightboxImageIndex + 1} / {imageList.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
