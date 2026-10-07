"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const storageKey = "cookie-consent";
const openEvent = "cookie-consent:open";
const googleAnalyticsId = "G-QF7C7P291E";

type Consent = "granted" | "denied";

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

// Removes Google Analytics cookies after consent was withdrawn (_ga and _ga_<id>).
function clearAnalyticsCookies() {
  const domains = ["", window.location.hostname, `.${window.location.hostname.replace(/^www\./, "")}`];
  document.cookie.split(";").map((item) => item.split("=")[0].trim()).filter((name) => name.startsWith("_ga")).forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    });
  });
}

// Google Analytics loads only after the visitor agreed. The footer link reopens the banner.
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setOpen(stored === null);
    const reopen = () => setOpen(true);
    window.addEventListener(openEvent, reopen);
    return () => window.removeEventListener(openEvent, reopen);
  }, []);

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Without storage the choice only holds for this page view.
    }
    const withdrawn = consent === "granted" && value === "denied";
    setConsent(value);
    setOpen(false);
    if (withdrawn) {
      clearAnalyticsCookies();
      window.location.reload();
    }
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
      {open && (
        <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-lg border border-ash bg-mist p-5 text-ink shadow-[0_30px_60px_-20px_rgba(23,32,29,0.45)] sm:bottom-5">
          <p id="cookie-title" className="font-semibold">Statistik-Cookies</p>
          <p className="mt-1.5 text-sm leading-6 text-slate">
            Mit deiner Zustimmung messen wir mit Google Analytics, welche Seiten genutzt werden. Ohne Zustimmung werden keine Statistik-Cookies gesetzt.{" "}
            <Link href="/de/datenschutz" className="underline decoration-smoke underline-offset-4 hover:decoration-ink">Datenschutz</Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => decide("denied")} className="focus-ring h-10 rounded-full border border-ash bg-paper text-sm font-semibold hover:border-ink">
              Ablehnen
            </button>
            <button type="button" onClick={() => decide("granted")} className="focus-ring h-10 rounded-full border border-ink bg-ink text-sm font-semibold text-paper hover:opacity-90">
              Zustimmen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(openEvent))} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
