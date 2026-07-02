# TODO: French translation review

The JSON format doesn't support inline comments. Below are keys in `src/locales/fr.json` that may need a human review for more natural phrasing or local context. Please review and adjust as needed.

- `home.title` — current: "Résidence Amira vous accueille avec confort et convivialité." (okay, but consider shorter marketing phrasing)
- `home.lead` — current: "Découvrez des logements sélectionnés..." (check tone)
- `properties.lead` — current: "Parcourez notre sélection de maisons confortables pour un séjour relaxant." (consider "locations" vs "maisons")
- `propertyDetail.bookingModalTitle` — current: "Envoyez votre demande" (maybe "Envoyer la demande" or "Envoyer votre demande")
- `propertyDetail.checkCalendar` — current: "Consultez le calendrier ci-dessous" (ok)
- `propertyDetail.amenitiesTitle` — current: "Équipements" (ok)
- `propertyCard.perNight` — pattern: "{price} TND / nuit" (verify formatting)
- `bookingForm.submittedMessage` — placeholder uses `n°{propertyId}`; confirm preferred phrasing.

If you'd like, I can add these as `_TODO_` keys inside `fr.json` instead of this file, or proceed to implement any changes you suggest.
