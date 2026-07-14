import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../lib/data/drinks.seed.json", import.meta.url), "utf8"));
const urls = Array.from(new Set(data.drinks.map((drink) => drink.sourceUrl).filter(Boolean)));
const errors = [];
const redirects = [];
const protectedUrls = [];

const results = await runPool(urls, 4, checkUrl);

for (const result of results) {
  if (result.error) errors.push(`${result.url}: ${result.error}`);
  else if (result.status === 401 || result.status === 403) protectedUrls.push(`${result.url}: ${result.status}`);
  else if (result.status >= 300 && result.status < 400) redirects.push(`${result.url}: ${result.status} -> ${result.location}`);
  else if (result.status >= 400) errors.push(`${result.url}: ${result.status}`);
}

if (errors.length || redirects.length) {
  console.error(`Source URL validation failed: ${errors.length} broken, ${redirects.length} redirecting`);
  for (const item of errors) console.error(`- ${item}`);
  for (const item of redirects) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Source URL validation passed: ${urls.length} unique URLs (${protectedUrls.length} bot-protected)`);
process.exit(0);

async function checkUrl(url) {
  let latest;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    latest = await requestUrl(url);
    if (latest.error || latest.status >= 500) {
      await delay(attempt * 500);
      continue;
    }
    return latest;
  }

  return latest;
}

async function requestUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 ProteinhaltigSeoAudit/1.0",
      },
    });
    const location = response.headers.get("location");
    return {
      url,
      status: response.status,
      location: location ? new URL(location, url).href : "",
    };
  } catch (error) {
    return {
      url,
      error: error.name === "AbortError" ? "timeout" : String(error.message ?? error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPool(items, concurrency, worker) {
  const results = [];
  let index = 0;

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    }),
  );

  return results;
}
