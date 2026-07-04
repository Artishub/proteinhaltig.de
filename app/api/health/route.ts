export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      ok: true,
      service: "proteinhaltig.de",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
