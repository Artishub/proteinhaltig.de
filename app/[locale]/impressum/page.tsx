import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight">Impressum</h1>
      <section className="mt-6 space-y-6 leading-7 text-slate">
        <div>
          <h2 className="text-lg font-semibold text-ink">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2">
            Artjom Gasarov
            <br />
            Wingertshecke 1
            <br />
            35392 Gießen
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Kontakt</h2>
          <p className="mt-2">
            E-Mail:{" "}
            <a className="underline decoration-ash underline-offset-4 hover:decoration-marigold" href="mailto:artjomgasarov@gmail.com">
              artjomgasarov@gmail.com
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Haftung für Inhalte</h2>
          <p className="mt-2">
            Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Angaben übernehmen wir jedoch keine Gewähr.
          </p>
        </div>
      </section>
    </main>
  );
}
