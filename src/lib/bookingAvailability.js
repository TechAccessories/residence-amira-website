// bookingAvailability.js
//
// Single source of truth for booking date-range logic used by every
// calendar / availability component (PropertyCalendar, Properties
// dashboard, PublicProperty page, Dashboard overview, and booking
// conflict checks).
//
// Convention used everywhere: a stay occupies [check_in, check_out).
// The checkout day itself is NOT booked — it's free for a new guest
// to check in that same day. This must stay consistent everywhere or
// calendars will disagree with the actual booking validation logic.

import { supabase } from '../lib/supabase'

export function toDateOnly(date) {
  if (typeof date === 'string') return date.slice(0, 10)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Is `date` occupied by a stay running [checkIn, checkOut)?
export function isDateBooked(date, checkIn, checkOut) {
  if (!checkIn || !checkOut) return false
  const dayStr = toDateOnly(date)
  const d = new Date(`${dayStr}T00:00:00`)
  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  return d >= start && d < end
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  return Math.max(0, Math.round((end - start) / 86400000))
}

// True if [aStart, aEnd) overlaps [bStart, bEnd). Checkout day is free,
// so back-to-back stays do NOT count as overlapping.
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false
  const s1 = new Date(`${aStart}T00:00:00`)
  const e1 = new Date(`${aEnd}T00:00:00`)
  const s2 = new Date(`${bStart}T00:00:00`)
  const e2 = new Date(`${bEnd}T00:00:00`)
  return s1 < e2 && e1 > s2
}

// ── Data fetchers ──────────────────────────────────────────────────

// Owner-authenticated fetch for a single property (dashboard use).
// Returns full rows (incl. guest name/contact) — safe only behind RLS
// restricting these rows to the property's owner.
export async function fetchBookingsForProperty(propertyId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
  if (error) throw error
  return data || []
}

// Owner-authenticated batch fetch across every property owned by the
// current user — used by the dashboard Overview calendar so it issues
// one query instead of one-per-property.
export async function fetchBookingsForProperties(propertyIds) {
  const ids = (propertyIds || []).filter(Boolean)
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .in('property_id', ids)
  if (error) throw error
  return data || []
}

// Public-safe fetch for the public property page. Anonymous visitors
// must NOT be permitted to SELECT directly from `bookings` (it holds
// guest names/contacts), so this calls a SECURITY DEFINER RPC that
// returns only check_in/check_out for the requested property. This is
// the actual root-cause fix for the public calendar not updating: the
// previous direct table query silently returned zero rows for
// anonymous users once RLS correctly restricts the bookings table to
// the owner.
export async function fetchPublicBookingRanges(propertyId) {
  const { data, error } = await supabase.rpc('get_property_booking_ranges', {
    p_property_id: propertyId,
  })
  if (error) throw error
  return data || []
}
