import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { business, localBusinessSchema, websiteSchema } from "@/app/data";
import { Footer, Header, JsonLd } from "@/components/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "Optometric Cafe | Beverly Hills Eyewear & Fittings",
    template: "%s | Optometric Cafe",
  },
  description:
    "Family-owned Beverly Hills optical atelier for owner-led fittings, prescription glasses, repairs, designer eyewear, children's glasses, and eye exams by appointment.",
  openGraph: {
    title: "Optometric Cafe",
    description:
      "Owner-led eyewear fittings by Morteza Talebi in Beverly Hills. Family-owned since 2005.",
    url: business.url,
    siteName: business.name,
    images: [
      {
        url: "/images/optometric-cafe-showroom-prescription-sunglasses-beverly-hills.jpg",
        width: 1200,
        height: 800,
        alt: "Optometric Cafe eyewear showroom in Beverly Hills",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${business.gtmId}');
          `}
        </Script>
        <JsonLd data={websiteSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${business.gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
