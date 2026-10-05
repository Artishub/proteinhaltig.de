import { type NextRequest, NextResponse } from "next/server";
import { productRedirectFor } from "@/lib/product-redirects";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === "proteinhaltig.de") {
    const pathname = request.nextUrl.pathname === "/" ? "/de" : request.nextUrl.pathname;
    return NextResponse.redirect(`https://www.proteinhaltig.de${pathname}${request.nextUrl.search}`, 308);
  }

  const productTarget = productRedirectFor(request.nextUrl.pathname);
  if (productTarget) return NextResponse.redirect(new URL(productTarget, request.url), 308);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon|icon|opengraph-image|images/).*)"],
};
