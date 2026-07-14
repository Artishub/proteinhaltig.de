import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      {
        source: "/produkte",
        destination: "/de/produkte",
        permanent: true,
      },
      {
        source: "/produkte/:productId",
        destination: "/de/produkte/:productId",
        permanent: true,
      },
      {
        source: "/getraenke",
        destination: "/de/produkte",
        permanent: true,
      },
      {
        source: "/getraenke/:productId",
        destination: "/de/produkte/:productId",
        permanent: true,
      },
      {
        source: "/marken",
        destination: "/de/marken",
        permanent: true,
      },
      {
        source: "/kategorien",
        destination: "/de/kategorien",
        permanent: true,
      },
      {
        source: "/wissen",
        destination: "/de/wissen",
        permanent: true,
      },
      {
        source: "/wissen/:slug",
        destination: "/de/wissen/:slug",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/de/faq",
        permanent: true,
      },
      {
        source: "/datenschutz",
        destination: "/de/datenschutz",
        permanent: true,
      },
      {
        source: "/impressum",
        destination: "/de/impressum",
        permanent: true,
      },
      {
        source: "/nutzungsbedingungen",
        destination: "/de/nutzungsbedingungen",
        permanent: true,
      },
      {
        source: "/de/getraenke",
        destination: "/de/produkte",
        permanent: true,
      },
      {
        source: "/de/getraenke/:productId",
        destination: "/de/produkte/:productId",
        permanent: true,
      },
      {
        source: "/de/produkte/more-total-protein-sahne-1000",
        destination: "/de/produkte/more-saucen-back-protein-sahne-50",
        permanent: true,
      },
      {
        source: "/de/produkte/yfood-high-protein-drink-chocolate-500",
        destination: "/de/produkte/yfood-ready-to-drink-classic-choco-500",
        permanent: true,
      },
      {
        source: "/de/produkte/powerbar-protein-plus-52-chocolate-55",
        destination: "/de/produkte/powerbar-protein-plus-52-chocolate-nut-50",
        permanent: true,
      },
      {
        source: "/de/produkte/esn-designer-bar-crunchy-fudge-45",
        destination: "/de/produkte/esn-designer-bar-fudge-brownie-45",
        permanent: true,
      },
      {
        source: "/de/produkte/foodspring-protein-bar-extra-chocolate-60",
        destination: "/de/produkte/foodspring-protein-bar-extra-chocolate-crispy-coconut-45",
        permanent: true,
      },
      {
        source: "/de/produkte/dm-sportness-protein-muesli-schoko-60",
        destination: "/de/produkte/dm-sportness-protein-waffel-60",
        permanent: true,
      },
      {
        source: "/de/produkte/optimum-nutrition-clear-protein-dark-berry-280",
        destination: "/de/produkte/optimum-nutrition-clear-protein-dark-berry-240",
        permanent: true,
      },
      {
        source: "/de/produkte/optimum-nutrition-clear-protein-mango-passionfruit-280",
        destination: "/de/produkte/optimum-nutrition-clear-protein-mango-passionfruit-240",
        permanent: true,
      },
      {
        source: "/de/produkte/optimum-nutrition-clear-protein-peach-iced-tea-280",
        destination: "/de/produkte/optimum-nutrition-clear-protein-peach-240",
        permanent: true,
      },
      {
        source: "/de/produkte/optimum-nutrition-protein-water-tropical-500",
        destination: "/de/produkte/optimum-nutrition-protein-water-tropical-350",
        permanent: true,
      },
      {
        source: "/de/produkte/optimum-nutrition-protein-water-apple-raspberry-500",
        destination: "/de/produkte/optimum-nutrition-protein-water-apple-raspberry-350",
        permanent: true,
      },
      {
        source: "/de/produkte/grenade-creme-egg-protein-bar-60",
        destination: "/de/produkte/grenade-creme-egg-protein-bar-45",
        permanent: true,
      },
      {
        source: "/de/produkte/ehrmann-high-protein-joghurt-vanille-200",
        destination: "/de/produkte?brand=ehrmann&category=protein-yogurt",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
