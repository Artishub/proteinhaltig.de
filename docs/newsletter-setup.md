# Kontakt-Postfach und Newsletter einrichten

> **Stand 07.10.2026: Newsletter auf proteinhaltig.de pausiert.** Formular, Datenschutz-Abschnitt und API hängen an `newsletterEnabled` in `lib/site.ts` (aktuell `false`). Zum Einschalten: Schritte 2 und 3 unten, dann `newsletterEnabled = true` setzen und die Bestätigungsseite `app/[locale]/newsletter/bestaetigt/page.tsx` aus Commit `e113c87` wiederherstellen (`git checkout e113c87 -- 'app/[locale]/newsletter/bestaetigt'`).

Gilt für proteinhaltig.de, zuckerhaltig.de und ai-vergleich.de. Pro Domain einmal durchgehen; ein Brevo-Konto reicht für alle drei.

## 1. kontakt@… per Cloudflare Email Routing (kostenlos)

1. Cloudflare → Domain wählen → **Email** → **Email Routing** → **Get started / Aktivieren**.
2. Cloudflare legt die MX-Einträge und einen SPF-TXT-Eintrag an. Bestätigen.
3. **Routing rules** → **Custom address**: `kontakt` → Aktion „Send to an email“ → eigenes Gmail. Beim ersten Mal bestätigt Gmail die Zieladresse per Link.
4. Testmail an kontakt@… schicken.

Antworten *als* kontakt@… aus Gmail (optional): Gmail → Einstellungen → Konten → „Weitere E-Mail-Adresse hinzufügen“ → SMTP-Server `smtp-relay.brevo.com`, Port 587, Login und SMTP-Schlüssel aus Brevo (**SMTP & API** → **SMTP**). Das funktioniert erst, wenn die Domain in Brevo authentifiziert ist (Schritt 2.3).

## 2. Brevo (Free: 300 Mails pro Tag, bis 100.000 Kontakte)

1. Konto auf brevo.com anlegen, Firmendaten mit der Impressumsadresse.
2. **Kontakte → Listen**: je Projekt eine Liste, z. B. „Newsletter proteinhaltig“. Die Listen-ID steht in der Übersicht.
3. **Absender, Domains & dedizierte IPs → Domains → Domain hinzufügen**: Domain eintragen, Brevo zeigt DNS-Einträge (brevo-code, DKIM, DMARC). In Cloudflare unter DNS anlegen, Proxy **aus** (graue Wolke). Dann „Authentifizieren“.
   - Nur **ein** SPF-Eintrag pro Domain. Wenn Email Routing schon einen hat und Brevo ein SPF verlangt, zusammenführen: `v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all`
4. **Absender** anlegen: `newsletter@<domain>` oder `kontakt@<domain>`, Name z. B. „Proteinhaltig.de“.
5. **Kampagnen → Vorlagen → Neue Vorlage** für die Bestätigungsmail:
   - Betreff z. B. „Bitte bestätige deine Anmeldung“.
   - Button mit Link **`{{ doubleoptin }}`**.
   - In den Vorlageneinstellungen das Tag **`optin`** setzen.
   - Speichern und aktivieren. Die Vorlagen-ID steht in der URL beim Bearbeiten.
6. **SMTP & API → API-Schlüssel → Neuen Schlüssel erzeugen** (je Projekt einen, dann lässt sich einer allein sperren).
7. **Sicherheit → Autorisierte IPs**: Brevo sperrt nach 30 Tagen unbekannte IPs. Die IP des Hetzner-Servers eintragen, sonst bricht die Anmeldung später ohne Vorwarnung ab.

## 3. Coolify

Pro Projekt unter **Environment Variables** (Laufzeit, nicht „Build Variable“ nötig):

```
BREVO_API_KEY=xkeysib-…
BREVO_LIST_ID=<Listen-ID>
BREVO_DOI_TEMPLATE_ID=<Vorlagen-ID>
```

Danach **Redeploy**. Test: Formular im Footer ausfüllen → Bestätigungsmail kommt → Klick → Weiterleitung auf `/de/newsletter/bestaetigt` → Kontakt steht in der Liste.

Ohne diese Variablen zeigt das Formular „Der Newsletter ist noch nicht eingerichtet.“ und es wird nichts gesendet.

## 4. Versand

Kampagne in Brevo anlegen, Liste wählen, senden. Der Abmeldelink wird von Brevo automatisch eingefügt. Höchstens einmal im Monat, so steht es auf der Seite.
