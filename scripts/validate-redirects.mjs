import nextConfig from "../next.config.ts";

const expectedRedirects = new Map([
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
  ["/de/produkte/more-total-protein-sahne-1000", "/de/produkte/more-saucen-back-protein-sahne-50"],
  ["/de/produkte/yfood-high-protein-drink-chocolate-500", "/de/produkte/yfood-ready-to-drink-classic-choco-500"],
  ["/de/produkte/powerbar-protein-plus-52-chocolate-55", "/de/produkte/powerbar-protein-plus-52-chocolate-nut-50"],
  ["/de/produkte/esn-designer-bar-crunchy-fudge-45", "/de/produkte/esn-designer-bar-fudge-brownie-45"],
  ["/de/produkte/foodspring-protein-bar-extra-chocolate-60", "/de/produkte/foodspring-protein-bar-extra-chocolate-crispy-coconut-45"],
  ["/de/produkte/dm-sportness-protein-muesli-schoko-60", "/de/produkte/dm-sportness-protein-waffel-60"],
  ["/de/produkte/optimum-nutrition-clear-protein-dark-berry-280", "/de/produkte/optimum-nutrition-clear-protein-dark-berry-240"],
  ["/de/produkte/optimum-nutrition-clear-protein-mango-passionfruit-280", "/de/produkte/optimum-nutrition-clear-protein-mango-passionfruit-240"],
  ["/de/produkte/optimum-nutrition-clear-protein-peach-iced-tea-280", "/de/produkte/optimum-nutrition-clear-protein-peach-240"],
  ["/de/produkte/optimum-nutrition-protein-water-tropical-500", "/de/produkte/optimum-nutrition-protein-water-tropical-350"],
  ["/de/produkte/optimum-nutrition-protein-water-apple-raspberry-500", "/de/produkte/optimum-nutrition-protein-water-apple-raspberry-350"],
  ["/de/produkte/grenade-creme-egg-protein-bar-60", "/de/produkte/grenade-creme-egg-protein-bar-45"],
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
