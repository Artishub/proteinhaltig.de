// Newsletter sign-up with double opt-in via Brevo. Brevo sends the confirmation mail; the address only
// lands on the list after the click. Configure in Coolify: BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID.
export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const redirectionUrl = "https://www.proteinhaltig.de/de/newsletter/bestaetigt";

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || !listId || !templateId) {
    return Response.json({ error: "Der Newsletter ist noch nicht eingerichtet." }, { status: 503 });
  }

  let body: { email?: unknown; consent?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field.
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return Response.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }
  if (body.consent !== true) {
    return Response.json({ error: "Bitte bestätige die Einwilligung." }, { status: 400 });
  }

  const response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, includeListIds: [listId], templateId, redirectionUrl }),
  });

  if (!response.ok && response.status !== 204) {
    console.error("Brevo double opt-in failed", response.status, await response.text().catch(() => ""));
    return Response.json({ error: "Die Anmeldung hat gerade nicht geklappt. Bitte versuch es später noch einmal." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
