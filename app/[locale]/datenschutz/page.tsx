import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Datenschutz",
  description: "Datenschutzhinweise von Proteinhaltig.de zu Hosting, Cloudflare, Google Analytics mit Einwilligung, Newsletter und Kontakt per E-Mail.",
  path: "/de/datenschutz",
});

const updatedAt = "6. Oktober 2026";
const linkClass = "underline decoration-smoke underline-offset-4 hover:decoration-ink";

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:pt-16">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Datenschutz</h1>
      <p className="mt-4 text-sm text-slate">Stand: {updatedAt}</p>

      <div className="mt-10 space-y-10 leading-7 text-slate [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_p+p]:mt-3">
        <section>
          <h2>Verantwortlicher</h2>
          <p className="mt-3">
            Artjom Gasarov, Wingertshecke 1, 35392 Gießen
            <br />
            E-Mail: <a href={`mailto:${contactEmail}`} className={linkClass}>{contactEmail}</a>
          </p>
        </section>

        <section>
          <h2>Aufruf der Website und Server-Logs</h2>
          <p className="mt-3">
            Die Website läuft auf einem Server der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, verwaltet mit der Software Coolify. Mit Hetzner besteht ein Vertrag zur Auftragsverarbeitung. Beim Aufruf einer Seite verarbeitet der Server technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, übertragene Datenmenge, Referrer sowie Browser und Betriebssystem. Das ist nötig, um die Website auszuliefern und vor Missbrauch zu schützen (Art. 6 Abs. 1 lit. f DSGVO). Die Logs werden nicht mit anderen Daten zusammengeführt und nach kurzer Zeit gelöscht.
          </p>
        </section>

        <section>
          <h2>Cloudflare</h2>
          <p className="mt-3">
            Alle Aufrufe laufen über das Netzwerk der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Cloudflare leitet die Anfragen an unseren Server weiter, liefert Inhalte schneller aus und wehrt Angriffe ab. Dabei verarbeitet Cloudflare die oben genannten Zugriffsdaten einschließlich der IP-Adresse und kann technisch notwendige Cookies zur Abwehr von Bots setzen. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und schnellen Website (Art. 6 Abs. 1 lit. f DSGVO). Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer" className={linkClass}>Datenschutzerklärung von Cloudflare</a>.
          </p>
        </section>

        <section>
          <h2>Speicher im Browser</h2>
          <p className="mt-3">
            Die Website speichert im Local Storage deines Browsers, ob du den hellen oder dunklen Modus gewählt hast und wie du dich beim Cookie-Hinweis entschieden hast. Diese Angaben bleiben auf deinem Gerät und werden nicht an uns übertragen. Sie sind für die von dir gewünschte Funktion erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
          </p>
        </section>

        <section>
          <h2>Google Analytics</h2>
          <p className="mt-3">
            Nur wenn du zustimmst, nutzen wir Google Analytics 4 der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Google Analytics setzt Cookies (_ga und _ga_*, Laufzeit bis zu zwei Jahre) und erfasst, welche Seiten du aufrufst, wie lange du bleibst, welche Funktionen du nutzt (zum Beispiel Suche oder Vergleich), ungefähren Standort, Gerät und Browser. IP-Adressen werden in Google Analytics 4 nicht gespeichert.
          </p>
          <p>
            Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Daten können an Google LLC in den USA übermittelt werden. Google ist unter dem EU-US Data Privacy Framework zertifiziert. Die Analysedaten werden nach der in Google Analytics eingestellten Aufbewahrungsfrist gelöscht.
          </p>
          <p>
            Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: <CookieSettingsButton className="font-semibold text-ink underline decoration-smoke underline-offset-4 hover:decoration-ink" />. Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className={linkClass}>Datenschutzerklärung von Google</a>.
          </p>
        </section>

        <section id="newsletter">
          <h2>Newsletter</h2>
          <p className="mt-3">
            Wenn du den Newsletter bestellst, verarbeiten wir deine E-Mail-Adresse sowie Zeitpunkt der Anmeldung und der Bestätigung. Die Anmeldung läuft im Double-Opt-in-Verfahren: Du bekommst zuerst eine E-Mail mit einem Bestätigungslink und erst nach dem Klick wirst du in die Liste aufgenommen. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit über den Abmeldelink in jeder E-Mail oder per Nachricht an uns widerrufen; danach löschen wir deine Adresse aus der Liste.
          </p>
          <p>
            Für Anmeldung und Versand nutzen wir Brevo der Brevo GmbH, Köpenicker Str. 126, 10179 Berlin, einer Tochtergesellschaft der Sendinblue SAS, 17 rue de Salneuve, 75017 Paris, Frankreich. Mit Brevo besteht ein Vertrag zur Auftragsverarbeitung. Brevo kann für Versandstatistiken erfassen, ob eine E-Mail geöffnet und welche Links darin angeklickt wurden. Weitere Informationen: <a href="https://www.brevo.com/de/legal/privacypolicy/" target="_blank" rel="noreferrer" className={linkClass}>Datenschutzerklärung von Brevo</a>.
          </p>
        </section>

        <section>
          <h2>Kontakt per E-Mail</h2>
          <p className="mt-3">
            Wenn du uns schreibst, etwa um einen falschen Wert zu melden, verarbeiten wir deine E-Mail-Adresse und den Inhalt der Nachricht, um sie zu beantworten (Art. 6 Abs. 1 lit. f DSGVO). E-Mails an {contactEmail} leitet Cloudflare (Email Routing) an unser Postfach bei Google (Gmail, Google Ireland Limited) weiter. Die Nachricht wird gelöscht, wenn sie erledigt ist.
          </p>
        </section>

        <section>
          <h2>Deine Rechte</h2>
          <p className="mt-3">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Eine Einwilligung kannst du jederzeit widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit.
          </p>
        </section>
      </div>
    </main>
  );
}
