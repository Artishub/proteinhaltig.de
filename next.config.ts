import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      {
        source: "/de/test/:path*",
        destination: "/de",
        permanent: true,
      },
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
        source: "/de/produkte/ehrmann-high-protein-joghurt-vanille-200",
        destination: "/de/produkte?brand=ehrmann&category=protein-yogurt",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
