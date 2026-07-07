import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isDateBooked, toDateOnly } from '../lib/bookingAvailability'
import AnimatedModal from './AnimatedModal'

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function formatDateLabel(date, locale) {
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// PropertyCalendar — per-property availability calendar.
// Desktop: hover a booked day to see who booked it (tooltip), same as the
// dashboard's overview calendar.
// Mobile/touch: hovering isn't possible, so tapping a booked day opens a
// small modal with the same guest info instead.
function PropertyCalendar({ bookings = [], isOwner = false }) {
  const { t, i18n } = useTranslation()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(null) // { date, booking }

  const weekdayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' })
    const referenceSunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(referenceSunday.getFullYear(), referenceSunday.getMonth(), referenceSunday.getDate() + index)))
  }, [i18n.language])

  const monthYearLabel = useMemo(() => {
    return new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(currentMonth)
  }, [currentMonth, i18n.language])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    const days = []
    for (let i = 0; i < startDay; i += 1) days.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) days.push(new Date(year, month, day))
    return days
  }, [currentMonth])

  const getBookingForDay = (date) =>
    bookings.find((booking) => isDateBooked(date, booking.check_in, booking.check_out))

  const moveMonth = (direction) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

  const handleDayInteraction = (day, booking) => {
    if (!booking) return
    setSelectedDay({ date: day, booking })
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">←</button>
        <h4 className="text-sm font-semibold text-slate-800">
          {monthYearLabel}
        </h4>
        <button type="button" onClick={() => moveMonth(1)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">→</button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {weekdayNames.map((day) => <div key={day} className="py-1 font-medium">{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-10 rounded-md bg-slate-50" />

          const booking = getBookingForDay(day)
          const booked = !!booking
          const isToday = isSameDay(day, today)

          return (
            <div
              key={toDateOnly(day)}
              role={booked ? 'button' : undefined}
              tabIndex={booked ? 0 : undefined}
              onClick={() => handleDayInteraction(day, booking)}
              onKeyDown={(e) => {
                if (booked && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handleDayInteraction(day, booking)
                }
              }}
                  title={
                          booking
                            ? isOwner
                              ? `${t('propertyCalendar.booked')} — ${booking.customer_name}`
                              : t('propertyCalendar.occupied')
                            : t('propertyCalendar.available')
                        }
              className={`group relative flex h-10 items-center justify-center rounded-md text-sm outline-none ${
                booked
                  ? 'cursor-pointer bg-red-100 text-red-700 focus-visible:ring-2 focus-visible:ring-red-400'
                  : isToday
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-50 text-slate-700'
              }`}
            >
              {day.getDate()}

              {booking && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-44 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-left text-xs text-white shadow-xl group-hover:block">
                  <p className="font-semibold text-rose-300">{t('propertyCalendar.booked')}</p>
                  <p className="mt-0.5 truncate">
                    {isOwner ? booking.customer_name : t('propertyCalendar.occupied')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block aspect-square h-3 w-3 shrink-0 rounded-full bg-red-100" />
          {t('propertyCalendar.booked')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block aspect-square h-3 w-3 shrink-0 rounded-full bg-emerald-100" />
          {t('propertyCalendar.available')}
        </span>
      </div>

      <AnimatedModal open={!!selectedDay} onClose={() => setSelectedDay(null)} panelClassName="max-w-sm p-5">
        {selectedDay && (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{t('propertyCalendar.booked')}</p>
            <h4 className="mt-1 text-lg font-black text-slate-900">{formatDateLabel(selectedDay.date, i18n.language)}</h4>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">{isOwner ? t('propertyCalendar.guest') : t('propertyCalendar.status')}</span>
                <span className="font-medium">{isOwner ? selectedDay.booking.customer_name : t('propertyCalendar.occupied')}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">{t('propertyCalendar.checkIn')}</span><span className="font-medium">{selectedDay.booking.check_in}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('propertyCalendar.checkOut')}</span><span className="font-medium">{selectedDay.booking.check_out}</span></div>
            </div>
            <button type="button" onClick={() => setSelectedDay(null)}
              className="mt-5 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {t('common.close')}
            </button>
          </>
        )}
      </AnimatedModal>
    </div>
  )
}

export default PropertyCalendar
