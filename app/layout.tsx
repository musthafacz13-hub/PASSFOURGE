import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PassForge — Security & Entropy Lab',
  description: 'A premium minimalist password generator and live strength analyzer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans bg-[#FFFFFF] dark:bg-[#0B0B0C] text-[#111111] dark:text-[#F3F3F4] antialiased transition-colors duration-200`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
