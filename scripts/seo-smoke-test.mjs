import { spawn } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const port = process.env.SEO_CHECK_PORT ?? "3210";
const baseUrl = `http://127.0.0.1:${port}`;
const serverPath = ".next/standalone/server.js";
const requestHeaders = { "user-agent": "proteinhaltig-seo-smoke-test" };
const siteHost = "www.proteinhaltig.de";

if (!fs.existsSync(serverPath)) {
  throw new Error(`Missing ${serverPath}; run npm run build first.`);
}

const indexed = JSON.parse(fs.readFileSync("lib/data/indexed-products.json", "utf8"));
const searchConsole = JSON.parse(fs.readFileSync("lib/data/search-console-pages.json", "utf8"));

const server = spawn(process.execPath, [serverPath], {
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
let passed = false;
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

try {
  await waitForServer();

  const robots = await getText("/robots.txt");
  assert(robots.includes(`Sitemap: https://${siteHost}/sitemap.xml`), "robots.txt points to the wrong sitemap");
  assert(robots.includes("Allow: /"), "robots.txt does not allow crawling");

  const sitemapXml = await getText("/sitemap.xml");
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert(sitemapUrls.length > 0, "sitemap.xml contains no URLs");
  for (const sitemapUrl of sitemapUrls) {
    const parsed = new URL(sitemapUrl);
    assert(parsed.protocol === "https:" && parsed.hostname === siteHost, `non-canonical sitemap URL: ${sitemapUrl}`);
  }
  const sitemapProducts = sitemapUrls.filter((url) => /\/de\/produkte\/(?!vergleich$)[^/]+$/.test(url));
  assert(sitemapProducts.length <= indexed.ids.length, `sitemap lists ${sitemapProducts.length} products, allowlist has ${indexed.ids.length}`);

  const results = await mapWithLimit(sitemapUrls, 8, async (sitemapUrl) => {
    const parsed = new URL(sitemapUrl);
    const response = await fetch(`${baseUrl}${parsed.pathname}`, { headers: requestHeaders, redirect: "manual" });
    const html = await response.text();
    assert(response.status === 200, `${sitemapUrl} returned ${response.status}`);

    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    assert(canonical === sitemapUrl, `${sitemapUrl} has canonical ${canonical ?? "none"}`);

    const robotsMeta = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? "";
    assert(!/noindex/i.test(robotsMeta), `${sitemapUrl} is listed in the sitemap but has noindex`);
    if (parsed.pathname.startsWith("/de/produkte/")) assert(!html.includes('"@type":"FAQPage"'), `${sitemapUrl} still emits generated FAQPage data`);
    assert(!/zuckerhaltig\.de|aivergleich\.de/i.test(html), `${sitemapUrl} links to a sister project`);
    assert(!html.includes("googletagmanager.com/gtag/js"), `${sitemapUrl} loads Google Analytics before consent`);
    return sitemapUrl;
  });

  // Every product URL with impressions answers 200 or a single permanent redirect to a 200 page.
  const productPaths = Object.keys(searchConsole.impressionsByPath).filter((path) => /^\/de\/produkte\/[^/]+$/.test(path));
  await mapWithLimit(productPaths, 8, async (path) => {
    const response = await fetch(`${baseUrl}${path}`, { headers: requestHeaders, redirect: "manual" });
    if (response.status === 200) return;
    assert([301, 308].includes(response.status), `${path} returned ${response.status}`);
    const location = new URL(response.headers.get("location") ?? "", baseUrl);
    const target = await fetch(`${baseUrl}${location.pathname}${location.search}`, { headers: requestHeaders, redirect: "manual" });
    assert(target.status === 200, `${path} redirects to ${location.pathname} which returned ${target.status}`);
  });

  const notFound = await fetch(`${baseUrl}/de/produkte/gibt-es-nicht`, { headers: requestHeaders });
  const notFoundHtml = await notFound.text();
  assert(notFound.status === 404, `unknown product returned ${notFound.status}`);
  const notFoundRobots = [...notFoundHtml.matchAll(/<meta name="robots" content="([^"]+)"/gi)].map((match) => match[1]);
  assert(notFoundRobots.length > 0 && notFoundRobots.every((value) => /noindex/i.test(value)), `404 robots meta: ${notFoundRobots.join(" | ") || "none"}`);

  const explorerHtml = await getText("/de/produkte");
  const productLinks = new Set([...explorerHtml.matchAll(/href="(\/de\/produkte\/[^"?#]+)"/g)].map((match) => match[1]).filter((href) => href !== "/de/produkte/vergleich"));
  assert(productLinks.size >= 5, `product explorer exposes only ${productLinks.size} crawlable product links`);

  const rootResponse = await fetch(`${baseUrl}/`, { headers: requestHeaders, redirect: "manual" });
  assert([301, 308].includes(rootResponse.status), `root route returned ${rootResponse.status} instead of a permanent redirect`);
  assert(rootResponse.headers.get("location")?.endsWith("/de"), "root route does not redirect to /de");

  const permanentRedirects = [
    ["/de/produkte/esn-isoclear-whey-protein-isolate-green-apple-300", "/de/produkte/esn-isoclear-whey-protein-isolate-green-apple-908#groesse-300-g"],
    ["/de/produkte/esn-designer-bar-crunchy-fudge-45", "/de/produkte/esn-designer-bar-fudge-brownie#groesse-45-g"],
    ["/de/getraenke", "/de/produkte"],
  ];
  for (const [pathname, target] of permanentRedirects) {
    const response = await fetch(`${baseUrl}${pathname}`, { headers: requestHeaders, redirect: "manual" });
    assert([301, 308].includes(response.status), `${pathname} returned ${response.status} instead of a permanent redirect`);
    const location = response.headers.get("location") ?? "";
    assert(location.endsWith(target), `${pathname} redirects to ${location} instead of ${target}`);
  }

  passed = true;
  console.log(`SEO smoke test passed: ${results.length} sitemap URLs, ${productPaths.length} Search Console product URLs, ${productLinks.size} crawlable explorer links`);
} finally {
  await stopServer();
  if (!passed && serverOutput) console.error(serverOutput);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { headers: requestHeaders });
      if (response.status === 200) return;
    } catch {
      // The standalone server may need a moment to start.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Production server did not become ready within 15 seconds.");
}

async function getText(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, { headers: requestHeaders });
  const text = await response.text();
  assert(response.status === 200, `${pathname} returned ${response.status}`);
  return text;
}

async function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return;
  await new Promise((resolve) => {
    server.once("exit", resolve);
    server.kill("SIGTERM");
  });
}

async function mapWithLimit(items, limit, callback) {
  const results = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
