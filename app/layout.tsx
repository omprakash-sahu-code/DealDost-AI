import type { Metadata } from 'next';
import { Inter, Playfair_Display, Syne } from 'next/font/google';
import './globals.css';
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DealDost AI | Legal Contracts at the Speed of Chat',
    template: '%s | DealDost AI',
  },
  description: 'Transform informal Hinglish conversations into bulletproof legal assets. Instant NDAs, Freelance Contracts, and Secure Escrow for the modern Indian creator economy.',
  keywords: ['Legal AI', 'Smart Contracts India', 'Hinglish Legal Bot', 'Freelance Agreements', 'Deal-Dost', 'Contract Builder', 'Indian Law AI'],
  authors: [{ name: 'DealDost AI' }],
  creator: 'DealDost AI',
  metadataBase: new URL('https://dealdost.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dealdost.ai',
    title: 'DealDost AI | Legal Contracts at the Speed of Chat',
    description: 'Transform informal Hinglish conversations into bulletproof legal assets. Instant NDAs, Freelance Contracts, and Secure Escrow.',
    siteName: 'DealDost AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealDost AI | Legal Contracts at the Speed of Chat',
    description: 'Transform informal Hinglish conversations into bulletproof legal assets. Instant NDAs, Freelance Contracts, and Secure Escrow.',
    creator: '@dealdost_ai',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${syne.variable}`}>
      <body className="bg-deal-onyx text-deal-silk antialiased selection:bg-deal-gold selection:text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
