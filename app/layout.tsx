import type {Metadata} from 'next';
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PassForge // Professional Security Engine',
  description: 'Professional high-entropy password generator and security matrix. Dark, minimal, and secure.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark bg-[#040404]" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#040404]`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
