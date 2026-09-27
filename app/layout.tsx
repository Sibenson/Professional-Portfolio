import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

// Uses your custom URL if set; on Vercel falls back to the production domain automatically.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const title = "Sibenson Gautam | PM + QA | Software Quality & Project Coordination";
const description =
  "Sibenson Gautam is a PM + QA professional in Kathmandu combining hands-on software testing — functional, regression, UI and API — with issue investigation, developer coordination, UAT and delivery.";

// Structured data so search engines understand who this page is about.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sibenson Gautam",
  jobTitle: "PM + QA",
  description: "PM + QA professional combining hands-on software quality work with project and stakeholder coordination.",
  knowsAbout: ["Software Testing", "Quality Assurance", "API Testing", "Regression Testing", "UAT", "Project Coordination"],
  worksFor: { "@type": "Organization", name: "Hazesoft Pvt. Ltd." },
  address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
  email: "mailto:sibensongautam@gmail.com",
  url: siteUrl,
  sameAs: ["https://www.linkedin.com/in/sibenson-gautam-5630b4325"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Sibenson Gautam",
  keywords: ["Sibenson Gautam", "PM + QA", "QA", "Software Testing", "API Testing", "Project Coordination", "Kathmandu", "Hazesoft"],
  authors: [{ name: "Sibenson Gautam" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    siteName: "Sibenson Gautam",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Applies the saved theme before paint to avoid a flash, and marks JS as available
// so reveal animations only hide content when they can also show it. Dark is the default.
const themeScript = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
