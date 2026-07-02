// Purpose: Provide a contact page with a simple local form placeholder.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/Contact.css'

export function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Contact form submitted', form)
    // TODO: wire this to an email service or contact endpoint.
  }

  return (
    <div className="contact-page">
      <section className="page-section">
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.lead')}</p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            {t('contact.name')}
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            {t('contact.email')}
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            {t('contact.message')}
            <textarea
              rows="5"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              required
            />
          </label>
          <button className="button primary" type="submit">
            {t('contact.sendMessage')}
          </button>
        </form>
      </section>
    </div>
  )
}
