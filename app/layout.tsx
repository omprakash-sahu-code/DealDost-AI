import type { Metadata } from 'next';
import { Inter, Playfair_Display, Syne } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';

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
  title: 'Deal-Dost AI | Legal Contracts at the Speed of Chat',
  description: 'Transform informal Hinglish conversations into bulletproof legal assets. Instant NDAs, Freelance Contracts, and Secure Escrow for the modern Indian creator economy.',
  keywords: ['Legal AI', 'Smart Contracts India', 'Hinglish Legal Bot', 'Freelance Agreements', 'Deal-Dost'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${syne.variable}`}>
      <body className="bg-deal-onyx text-deal-silk antialiased selection:bg-deal-gold selection:text-black">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
