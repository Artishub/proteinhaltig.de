"use client";

import Link from "next/link";
import { useState } from "react";

type State = { status: "idle" | "sending" | "done" | "error"; message?: string };

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return setState({ status: "error", message: "Bitte bestätige die Einwilligung." });
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setState({ status: "error", message: data.error ?? "Die Anmeldung hat nicht geklappt." });
      else setState({ status: "done" });
    } catch {
      setState({ status: "error", message: "Keine Verbindung. Bitte versuch es noch einmal." });
    }
  }

  if (state.status === "done") {
    return <p className="text-sm leading-6" role="status">Fast geschafft: Bitte bestätige deine Anmeldung über den Link in der E-Mail, die wir dir gerade geschickt haben.</p>;
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={compact ? "newsletter-email-footer" : "newsletter-email"}>E-Mail-Adresse</label>
        <input
          id={compact ? "newsletter-email-footer" : "newsletter-email"}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="deine@email.de"
          className="focus-ring h-11 min-w-0 flex-1 rounded-full border border-ash bg-paper px-4 text-sm text-ink outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="focus-ring h-11 shrink-0 rounded-full bg-ink px-5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-60"
        >
          {state.status === "sending" ? "Wird gesendet …" : "Anmelden"}
        </button>
      </div>
      <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2 text-xs leading-5 text-slate">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5" />
        <span>
          Ich möchte den Newsletter per E-Mail erhalten. Abmeldung jederzeit über den Link in jeder Mail. Details in der{" "}
          <Link href="/de/datenschutz#newsletter" className="underline underline-offset-2">Datenschutzerklärung</Link>.
        </span>
      </label>
      {state.status === "error" && <p className="text-sm text-[var(--accent-strong)]" role="alert">{state.message}</p>}
    </form>
  );
}
