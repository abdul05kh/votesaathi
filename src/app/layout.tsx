import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { VoiceoverProvider } from "@/context/VoiceoverContext";
import VoiceoverToggle from "@/components/VoiceoverToggle";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoteSaathi | AI Election Assistant for India",
  description: "Har Vote Ki Awaaz — India's premier AI-powered election platform. Understand voting processes, simulate EVMs, find polling booths, and consult election lawyers in 13+ languages.",
  applicationName: "VoteSaathi",
  authors: [{ name: "VoteSaathi Team" }],
  generator: "Next.js",
  keywords: ["Election", "India", "Vote", "EVM Simulator", "Polling Booth", "ECI", "Democracy", "AI Assistant"],
  referrer: "origin-when-cross-origin",
  creator: "VoteSaathi",
  publisher: "VoteSaathi",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://votesaathi.vercel.app",
    title: "VoteSaathi | Har Vote Ki Awaaz",
    description: "Empowering every Indian voter with AI-driven election education and accessibility tools.",
    siteName: "VoteSaathi",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "VoteSaathi - AI Election Assistant",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoteSaathi | AI Election Assistant",
    description: "Understanding India's elections through futuristic AI interaction.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ff9933",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOccupationalProgram",
              "name": "VoteSaathi",
              "description": "AI Election Assistant for India - Empowering voters with knowledge of the Representation of the People Act 1951.",
              "provider": {
                "@type": "Organization",
                "name": "VoteSaathi",
                "url": "https://votesaathi-1f229.web.app"
              },
              "educationalCredentialAwarded": "Election Literacy",
              "programPrerequisites": "None",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <LanguageProvider>
            <VoiceoverProvider>
              <header className="sticky top-0 z-50 w-full glass"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 0,
                }}>
                {/* Glowing accent bar at very top */}
                <div className="h-[2px] w-full"
                  style={{ background: 'linear-gradient(90deg, #f97316 0%, #1d6ded 50%, #00d4aa 100%)' }} />
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                  {/* Logo */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                      style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                      VS
                    </div>
                    <span className="text-xl font-black tracking-tight"
                      style={{ background: 'linear-gradient(135deg,#f97316 0%,#fb923c 45%,#00d4aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      VoteSaathi
                    </span>
                  </div>

                  {/* Center tagline */}
                  <span className="hidden md:block text-xs font-semibold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(138,155,184,0.7)' }}>
                    Har Vote Ki Awaaz
                  </span>

                  {/* Nav right */}
                  <nav className="flex items-center gap-3 shrink-0">
                    <VoiceoverToggle />
                    <div id="google_translate_element" className="translate-widget" />
                  </nav>
                </div>
              </header>
              <main className="flex-1 container mx-auto px-4 sm:px-6 flex flex-col">
                {children}
              </main>
            </VoiceoverProvider>
          </LanguageProvider>


        {/* Google Translate Script */}
        <Script
          id="google-translate-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,te,ta,bn,mr,gu,kn,ml,pa,or,as,ur,sa',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
