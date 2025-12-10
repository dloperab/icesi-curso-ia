import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SWRProvider } from '@/components/providers/SWRProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema de Seguimiento de Hábitos',
  description:
    'Aplicación web para seguimiento de hábitos diarios y semanales. Rastrea tu progreso, visualiza tus rachas y alcanza tus metas con nuestro sistema intuitivo de seguimiento.',
  keywords: [
    'hábitos',
    'seguimiento de hábitos',
    'productividad',
    'metas',
    'racha',
    'habit tracker',
    'desarrollo personal',
  ],
  authors: [{ name: 'ICESI Curso IA' }],
  creator: 'ICESI Curso IA',
  publisher: 'ICESI Curso IA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://icesi-curso-ia.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://icesi-curso-ia.vercel.app',
    title: 'Sistema de Seguimiento de Hábitos',
    description:
      'Aplicación web para seguimiento de hábitos diarios y semanales. Rastrea tu progreso, visualiza tus rachas y alcanza tus metas.',
    siteName: 'Sistema de Seguimiento de Hábitos',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Sistema de Seguimiento de Hábitos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Seguimiento de Hábitos',
    description:
      'Aplicación web para seguimiento de hábitos diarios y semanales. Rastrea tu progreso, visualiza tus rachas y alcanza tus metas.',
    images: ['/opengraph-image.png'],
    creator: '@icesi',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
