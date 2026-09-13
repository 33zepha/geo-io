import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Geo.io — Quiz de Géographie Française & Culture Territoriale',
  description: 'Deviens incollable en géographie de la France dans un univers convivial, doux et stimulant.',
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
