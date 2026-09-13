import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAF7F2',
};

export const metadata: Metadata = {
  title: 'Geo.io — Défi de Géographie & Classement Promo L1',
  description: 'Affronte ta promo de L1 en géographie française : 101 départements, quiz interactifs, carte de maîtrise et podium olympique 3D.',
  applicationName: 'Geo.io',
  keywords: ['géographie', 'france', 'quiz', 'départements', 'étudiants', 'L1', 'classement', 'podium'],
  authors: [{ name: 'Geo.io University Team' }],
  openGraph: {
    title: 'Geo.io — Défi de Géographie & Classement Promo L1',
    description: 'Rejoins le défi cartographique de ta promo : 101 départements, quiz de culture territoriale et podium olympique 3D.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Geo.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geo.io — Défi de Géographie & Classement Promo L1',
    description: 'Rejoins le défi cartographique de ta promo : 101 départements, quiz de culture territoriale et podium olympique 3D.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#FAF7F2] text-[#2C2623] font-sans">
        {children}
      </body>
    </html>
  );
}
