// Supabase Edge Function: send-contact-email
//
// Receives { name, email, message } from the public Contact page and sends
// a notification email to the site owner using Resend, then an optional
// acknowledgement email back to the visitor.
//
// Deploy:
//   supabase functions deploy send-contact-email
//
// Required secrets (set with `supabase secrets set KEY=value`):
//   RESEND_API_KEY   - API key from https://resend.com
//   CONTACT_TO_EMAIL - inbox that should receive contact messages
//   CONTACT_FROM_EMAIL - verified sender address, e.g. "Résidence Amira <noreply@yourdomain.com>"
//
// This mirrors the existing send-booking-emails function so both share the
// same Resend account / verified domain.

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const CONTACT_TO_EMAIL = Deno.env.get('CONTACT_TO_EMAIL')
    const CONTACT_FROM_EMAIL = Deno.env.get('CONTACT_FROM_EMAIL') || 'onboarding@resend.dev'

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Email service is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

    // 1. Notify the owner
    const ownerEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New contact message from ${name}`,
        html: `
          <h2>New message from the website contact form</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      }),
    })

    if (!ownerEmailRes.ok) {
      const errText = await ownerEmailRes.text()
      throw new Error(`Failed to send notification email: ${errText}`)
    }

    // 2. Optional acknowledgement to the visitor (best-effort, ignore failure)
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: [email],
          subject: 'We received your message — Résidence Amira',
          html: `
            <p>Hi ${safeName},</p>
            <p>Thanks for reaching out to Résidence Amira. We received your message and will get back to you shortly.</p>
            <p>— Résidence Amira</p>
          `,
        }),
      })
    } catch (ackError) {
      console.error('Acknowledgement email failed', ackError)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-contact-email error', error)
    return new Response(JSON.stringify({ error: error.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
