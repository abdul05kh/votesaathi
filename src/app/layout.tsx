import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoteSaathi | Election Education for Every Indian",
  description: "Har Vote Ki Awaaz — An AI-powered election assistant for India. Understand the process, find your booth, and practice with the EVM simulator.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff9933",
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
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <LanguageProvider>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 glass dark:glass-dark">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  VoteSaathi
                </span>
              </div>
              <nav className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">
                  Har Vote Ki Awaaz
                </span>
                <LanguageSelector />
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
