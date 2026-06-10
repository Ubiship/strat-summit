import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/tailwind.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Admin | Strathcona Summit',
  description: 'Strathcona Summit Solutions admin portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-stone-50 antialiased">
        {children}
      </body>
    </html>
  );
}
