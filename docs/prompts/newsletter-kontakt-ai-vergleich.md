# Prompt: Kontakt-E-Mail und Newsletter für ai-vergleich.de

Kopiere alles unter der Linie in eine neue Claude-Code-Sitzung im Repo von ai-vergleich.de.

---

Bitte setze in diesem Projekt (ai-vergleich.de) zwei Dinge um. Erst lesen, dann umsetzen, am Ende alle Checks des Projekts laufen lassen, committen, Branch pushen und einen PR öffnen. **Nicht mergen**, bis ich „mergen“ sage. Zusammenfassung auf Deutsch.

## 1. Kontakt-E-Mail

- Die Kontakt-Adresse ist ab jetzt **kontakt@ai-vergleich.de**.
- Suche alle Stellen mit E-Mail-Adressen (`rg -n "@" --glob '!node_modules' --glob '!*.lock'`, vor allem Impressum, Datenschutz, Nutzungsbedingungen, Footer, „Wert falsch melden“-Links, strukturierte Daten). Ersetze die alte Adresse überall.
- Wenn es keine zentrale Konstante gibt, lege eine an (z. B. `contactEmail` in `lib/site.ts`) und nutze sie überall.

## 2. Newsletter mit Brevo (Double-Opt-in)

Referenz-Umsetzung: Repo `Artishub/proteinhaltig.de` (lesbar mit `gh api repos/Artishub/proteinhaltig.de/contents/<pfad>`, Branch `main` bzw. `polish/site-audit`, falls noch nicht gemergt):
`app/api/newsletter/route.ts`, `components/newsletter-form.tsx`, `app/[locale]/newsletter/bestaetigt/page.tsx`, Footer in `app/[locale]/layout.tsx`, Abschnitt „Newsletter“ in `app/[locale]/datenschutz/page.tsx`.
Übernimm das Prinzip, passe Pfade, Design und Texte an dieses Projekt an (nicht pixelgleich kopieren).

**Server-Route** `POST /api/newsletter`:
- Body `{ email, consent, website }`. `website` ist ein Honeypot: gefüllt → still `{ ok: true }` zurückgeben.
- E-Mail prüfen (Format, max. 254 Zeichen), `consent === true` verlangen.
- Brevo aufrufen: `POST https://api.brevo.com/v3/contacts/doubleOptinConfirmation`, Header `api-key`, Body `{ email, includeListIds: [BREVO_LIST_ID], templateId: BREVO_DOI_TEMPLATE_ID, redirectionUrl: "https://www.ai-vergleich.de/<bestätigt-seite>" }` (Domain prüfen: mit oder ohne www, je nach Canonical des Projekts).
- Umgebungsvariablen zur Laufzeit lesen: `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`. Fehlt eine → 503 mit „Der Newsletter ist noch nicht eingerichtet.“ Der API-Key darf nie im Client-Bundle landen.
- Brevo-Fehler loggen, dem Nutzer eine neutrale Meldung geben (502).

**Formular** (Client-Komponente) im Footer:
- E-Mail-Feld, Button „Anmelden“, Pflicht-Checkbox: „Ich möchte den Newsletter per E-Mail erhalten. Abmeldung jederzeit über den Link in jeder Mail. Details in der Datenschutzerklärung.“ (Link auf `#newsletter` der Datenschutzseite). Checkbox nicht vorausgewählt.
- Nach Erfolg: „Fast geschafft: Bitte bestätige deine Anmeldung über den Link in der E-Mail …“
- Kurzer Text darüber, ohne Slogan, z. B.: „Neue KI-Tools, Preisänderungen und Vergleiche, höchstens einmal im Monat.“

**Seiten:**
- Bestätigungsseite (z. B. `/de/newsletter/bestaetigt` bzw. passend zur Routenstruktur): `noindex, follow`, nicht in die Sitemap, mit Canonical, falls die SEO-Checks des Projekts das verlangen.
- Keine weiteren indexierbaren Seiten anlegen. Indexierung, robots, Sitemap und Allowlists sonst nicht anfassen.

**Datenschutz:** Abschnitt mit `id="newsletter"`:
- Verarbeitete Daten: E-Mail-Adresse, Zeitpunkt von Anmeldung und Bestätigung; Double-Opt-in-Verfahren.
- Rechtsgrundlage Einwilligung, Art. 6 Abs. 1 lit. a DSGVO; Widerruf jederzeit über den Abmeldelink oder per Mail, danach Löschung aus der Liste.
- Dienstleister: Brevo GmbH, Köpenicker Str. 126, 10179 Berlin, Tochtergesellschaft der Sendinblue SAS, 17 rue de Salneuve, 75017 Paris, Frankreich; Vertrag zur Auftragsverarbeitung; Brevo kann Öffnungen und Klicks für Versandstatistiken erfassen; Link https://www.brevo.com/de/legal/privacypolicy/
- „Stand“-Datum der Datenschutzerklärung aktualisieren.

**Kontakt per E-Mail im Datenschutz:** Falls kontakt@ai-vergleich.de über Cloudflare Email Routing an ein Gmail-Postfach weitergeleitet wird, das kurz erwähnen (Cloudflare leitet weiter, Google speichert das Postfach).

## Regeln

- Keine Eyebrows, keine Slogans, keine Badges, kein generierter Fülltext.
- Keine Links zu Schwesterprojekten (proteinhaltig, zuckerhaltig, ai-vergleich) im Footer oder seitenweit.
- Vor dem Commit alle Checks des Projekts (typecheck, lint, test, build, SEO-Checks, falls vorhanden).
- Am Ende kurz auflisten, welche Umgebungsvariablen ich in Coolify setzen muss.
