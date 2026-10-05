import nextConfig from "../next.config.ts";

const expectedRedirects = new Map([
  ["/de/test/:path*", "/de"],
  ["/produkte", "/de/produkte"],
  ["/produkte/:productId", "/de/produkte/:productId"],
  ["/getraenke", "/de/produkte"],
  ["/getraenke/:productId", "/de/produkte/:productId"],
  ["/marken", "/de/marken"],
  ["/kategorien", "/de/kategorien"],
  ["/wissen", "/de/wissen"],
  ["/wissen/:slug", "/de/wissen/:slug"],
  ["/faq", "/de/faq"],
  ["/datenschutz", "/de/datenschutz"],
  ["/impressum", "/de/impressum"],
  ["/nutzungsbedingungen", "/de/nutzungsbedingungen"],
  ["/de/getraenke", "/de/produkte"],
  ["/de/getraenke/:productId", "/de/produkte/:productId"],
  ["/de/produkte/ehrmann-high-protein-joghurt-vanille-200", "/de/produkte?brand=ehrmann&category=protein-yogurt"],
]);

const redirects = await nextConfig.redirects();
const actual = new Map(redirects.map((redirect) => [redirect.source, redirect]));
const errors = [];

for (const [source, destination] of expectedRedirects) {
  const redirect = actual.get(source);
  if (!redirect) {
    errors.push(`${source}: missing redirect`);
    continue;
  }
  if (redirect.destination !== destination) errors.push(`${source}: expected ${destination}, got ${redirect.destination}`);
  if (redirect.permanent !== true) errors.push(`${source}: redirect must be permanent`);
}

if (errors.length) {
  console.error(`Redirect validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Redirect validation passed: ${expectedRedirects.size} redirects`);
