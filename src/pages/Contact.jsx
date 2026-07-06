// Purpose: Provide a contact page that actually sends an email via a
// Supabase Edge Function (send-contact-email), matching the pattern already
// used for booking notification emails.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import '../styles/Contact.css'

const CONTACT_IMAGE =
  'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=900&q=80'

const initialForm = { name: '', email: '', message: '' }

export function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: form.name,
          email: form.email,
          message: form.message,
        },
      })

      if (error) {
        throw error
      }

      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || t('contact.errors.submitError'))
    }
  }

  return (
    <div className="contact-page">
      <section className="page-section contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.lead')}</p>

          <div className="contact-image-wrap">
            <img src={CONTACT_IMAGE} alt={t('contact.title')} loading="lazy" />
          </div>

        <ul className="contact-details">
          <li>
            <span className="contact-details-icon">📧</span>
            <a href="mailto:contact@residence-amira.tn">
              contact@residence-amira.tn
            </a>
          </li>

          <li>
            <span className="contact-details-icon">📞</span>
            <a href="tel:+21697312641">
              +216 97 312 641
            </a>
          </li>

          <li>
            <FaWhatsapp className="contact-details-icon" />
            <a
              href="https://wa.me/21697312641"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </li>

          <li>
            <FaFacebook className="contact-details-icon" />
            <a
              href="https://www.facebook.com/residenceamira1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </li>

          <li>
            <span className="contact-details-icon">📍</span>
            <span>Tunisia</span>
          </li>
        </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            {t('contact.name')}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('contact.email')}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('contact.message')}
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <button className="button primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t('contact.sending') : t('contact.sendMessage')}
          </button>

          {status === 'success' && (
            <p className="form-message success">{t('contact.success')}</p>
          )}
          {status === 'error' && (
            <p className="form-message error">{errorMessage}</p>
          )}
        </form>
      </section>
    </div>
  )
}
