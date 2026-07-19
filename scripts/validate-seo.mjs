import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), ".next/server/app");
const routesManifestPath = path.join(process.cwd(), ".next/routes-manifest.json");
const dataPath = path.join(process.cwd(), "lib/data/drinks.seed.json");
const siteOrigin = "https://www.proteinhaltig.de";
const errors = [];
const warnings = [];

if (!fs.existsSync(appDir)) {
  console.error("SEO validation failed: .next/server/app missing. Run npm run build first.");
  process.exit(1);
}

const htmlFiles = walk(appDir).filter((file) => file.endsWith(".html") && !ignoredHtmlFile(file));
const routes = new Set(htmlFiles.map(routeFromHtmlFile));
const incomingLinks = new Map(Array.from(routes, (route) => [route, new Set()]));
const sitemap = readSitemap();
const sitemapRouteSet = new Set(sitemap.routes);
const productIds = new Set(JSON.parse(fs.readFileSync(dataPath, "utf8")).drinks.map((drink) => drink.id));

for (const file of htmlFiles) {
  const route = routeFromHtmlFile(file);
  const html = fs.readFileSync(file, "utf8");
  const title = textMatch(html, /<title>(.*?)<\/title>/);
  const description = attrMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/);
  const robots = attrMatch(html, /<meta\s+name="robots"\s+content="([^"]*)"/);
  const canonical = attrMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"/);
  const ogTitle = attrMatch(html, /<meta\s+property="og:title"\s+content="([^"]*)"/);
  const ogDescription = attrMatch(html, /<meta\s+property="og:description"\s+content="([^"]*)"/);
  const ogUrl = attrMatch(html, /<meta\s+property="og:url"\s+content="([^"]*)"/);
  const ogImage = attrMatch(html, /<meta\s+property="og:image"\s+content="([^"]*)"/);

  if (!title) errors.push(`${route}: missing title`);
  if (title && decodeHtml(title).length > 60) errors.push(`${route}: title too long (${decodeHtml(title).length})`);

  if (!description) errors.push(`${route}: missing meta description`);
  if (description && decodeHtml(description).length < 70) warnings.push(`${route}: meta description short (${decodeHtml(description).length})`);
  if (description && decodeHtml(description).length > 170) warnings.push(`${route}: meta description long (${decodeHtml(description).length})`);

  if (route.startsWith("/de/produkte/") && !robots) errors.push(`${route}: missing robots directive`);
  if (/\bnoindex\b/i.test(robots)) errors.push(`${route}: contains noindex`);

  if (route !== "/" && !canonical) errors.push(`${route}: missing canonical`);
  if (route !== "/" && canonical && canonical !== `${siteOrigin}${route}`) errors.push(`${route}: canonical does not match route`);
  if (route !== "/" && canonical && ogUrl && canonical !== ogUrl) errors.push(`${route}: og:url does not match canonical`);

  for (const [name, value] of [
    ["og:title", ogTitle],
    ["og:description", ogDescription],
    ["og:url", ogUrl],
    ["og:image", ogImage],
  ]) {
    if (route !== "/" && !value) errors.push(`${route}: missing ${name}`);
  }

  for (const href of internalHrefs(html)) {
    const target = normalizeInternalRoute(href);
    if (!target || ignoredTarget(target)) continue;
    if (!routes.has(target)) errors.push(`${route}: broken internal link ${href}`);
    else if (target !== route) incomingLinks.get(target)?.add(route);
  }
}

if (sitemap.urls.length !== sitemapRouteSet.size) errors.push(`sitemap.xml: contains ${sitemap.urls.length - sitemapRouteSet.size} duplicate URL(s)`);

for (const route of sitemap.routes) {
  if (!routes.has(route)) errors.push(`${route}: sitemap route missing generated HTML`);
  if (route !== "/de" && !incomingLinks.get(route)?.size) errors.push(`${route}: sitemap route has no incoming internal links`);
}

const expectedProductRoutes = new Set(Array.from(productIds, (id) => `/de/produkte/${id}`));
const sitemapProductRoutes = new Set(
  sitemap.routes.filter((route) => productIds.has(route.split("/").at(-1))),
);

for (const route of expectedProductRoutes) {
  if (!sitemapProductRoutes.has(route)) errors.push(`${route}: canonical product missing from sitemap`);
}

for (const route of sitemapProductRoutes) {
  if (!expectedProductRoutes.has(route)) errors.push(`${route}: non-canonical product present in sitemap`);
}

for (const alias of productRedirectAliases()) {
  if (sitemapRouteSet.has(alias)) errors.push(`${alias}: redirect alias present in sitemap`);
}

if (errors.length) {
  console.error(`SEO validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn(`SEO validation warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 25)) console.warn(`- ${warning}`);
  if (warnings.length > 25) console.warn(`- ... ${warnings.length - 25} more`);
}

console.log(`SEO validation passed: ${htmlFiles.length} HTML pages, ${routes.size} routes, ${sitemap.urls.length} sitemap URLs, ${sitemapProductRoutes.size} canonical products`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function routeFromHtmlFile(file) {
  const relative = path.relative(appDir, file);
  const withoutExt = relative.replace(/\.html$/, "");
  if (withoutExt === "index") return "/";
  return `/${withoutExt.replace(/\/index$/, "").split(path.sep).join("/")}`;
}

function ignoredHtmlFile(file) {
  const route = routeFromHtmlFile(file);
  return route === "/_not-found";
}

function textMatch(value, pattern) {
  return value.match(pattern)?.[1] ?? "";
}

function attrMatch(value, pattern) {
  return value.match(pattern)?.[1] ?? "";
}

function internalHrefs(html) {
  return Array.from(html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g), (match) => match[1]);
}

function normalizeInternalRoute(href) {
  if (!href.startsWith("/") || href.startsWith("//")) return "";
  const [withoutHash] = href.split("#");
  const [pathname] = withoutHash.split("?");
  return pathname.replace(/\/$/, "") || "/";
}

function ignoredTarget(target) {
  return target.startsWith("/_next/") || target.startsWith("/api/") || target === "/opengraph-image";
}

function readSitemap() {
  const sitemapPath = path.join(appDir, "sitemap.xml.body");
  if (!fs.existsSync(sitemapPath)) {
    errors.push("sitemap.xml: missing generated sitemap body");
    return { urls: [], routes: [] };
  }

  const xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  const routes = urls.map((url) => normalizeInternalRoute(new URL(url).pathname));
  return { urls, routes };
}

function productRedirectAliases() {
  if (!fs.existsSync(routesManifestPath)) {
    errors.push("routes-manifest.json: missing generated routes manifest");
    return [];
  }

  const manifest = JSON.parse(fs.readFileSync(routesManifestPath, "utf8"));
  return manifest.redirects
    .map((redirect) => redirect.source)
    .filter((source) => source.startsWith("/de/produkte/") && !source.includes(":"));
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
