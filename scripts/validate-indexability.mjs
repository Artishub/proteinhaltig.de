const baseUrl = process.env.INDEXABILITY_BASE_URL ?? "http://127.0.0.1:3100";
const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, { redirect: "manual" });

if (sitemapResponse.status !== 200) {
  console.error(`Indexability validation failed: sitemap returned ${sitemapResponse.status}`);
  process.exit(1);
}

const sitemapXml = await sitemapResponse.text();
const sitemapUrls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
const errors = [];
let cursor = 0;

await Promise.all(Array.from({ length: Math.min(20, sitemapUrls.length) }, validateWorker));

if (errors.length) {
  console.error(`Indexability validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const productCount = sitemapUrls.filter((url) => {
  const path = new URL(url).pathname;
  return path.startsWith("/de/produkte/") && path !== "/de/produkte/vergleich";
}).length;
console.log(`Indexability validation passed: ${sitemapUrls.length} sitemap URLs, ${productCount} canonical products`);

async function validateWorker() {
  while (cursor < sitemapUrls.length) {
    const sitemapUrl = sitemapUrls[cursor++];
    const expectedCanonical = normalizeUrl(sitemapUrl);
    const target = new URL(new URL(sitemapUrl).pathname, baseUrl);

    try {
      const response = await fetch(target, { redirect: "manual" });
      if (response.status !== 200) {
        errors.push(`${sitemapUrl}: expected 200, got ${response.status}`);
        continue;
      }

      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      const html = await response.text();
      const robots = attribute(html, "meta", "name", "robots", "content");
      const canonical = attribute(html, "link", "rel", "canonical", "href");

      if (/\bnoindex\b/i.test(`${xRobotsTag},${robots}`)) errors.push(`${sitemapUrl}: contains noindex`);
      if (!canonical) errors.push(`${sitemapUrl}: missing canonical`);
      else if (normalizeUrl(canonical) !== expectedCanonical) errors.push(`${sitemapUrl}: canonical is ${canonical}`);
    } catch (error) {
      errors.push(`${sitemapUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function attribute(html, tag, key, keyValue, wanted) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) ?? [];
  const matchingTag = tags.find((value) => new RegExp(`\\b${key}=["']${keyValue}["']`, "i").test(value));
  return matchingTag?.match(new RegExp(`\\b${wanted}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}
