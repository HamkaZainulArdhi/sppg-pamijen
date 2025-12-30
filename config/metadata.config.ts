import type { Metadata } from 'next';

export const AppMetadata: Metadata = {
  /** Wajib untuk SEO & URL absolut */
  metadataBase: new URL('https://sppg-pamijen-bms.vercel.app'),

  title: {
    default: 'GiziKita | SPPG Pamijen',
    template: '%s | GiziKita',
  },

  description:
    'GiziKita adalah platform AI Scanner yang membantu orang tua memantau menu dan kandungan gizi anak setiap hari agar sesuai dengan standar program Makan Bergizi Gratis.',

  keywords: [
    'MBG',
    'SPPG',
    'Makan Bergizi Gratis',
    'Satuan Pelayanan Pemenuhan Gizi',
    'BGN',
    'Badan Gizi Nasional',
    'Menu MBG',
    'MBG digital',
    'gizi AI',
    'Scan gizi AI',
    'analisis gizi AI',
    'SPPG Pamijen',
    'SPPG Purwokerto',
    'SPPG Banyumas',
  ],

  /** Canonical & robots */
  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  /** Open Graph */
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'GiziKita',
    title: 'GiziKita | SPPG Pamijen',
    description:
      'Platform AI Scanner untuk memantau menu dan kandungan gizi anak sesuai standar program Makan Bergizi Gratis.',
    images: [
      {
        url: '/media/collab/BGN_lOGO.png',
        width: 1100,
        height: 600,
        alt: 'GiziKita – SPPG Pamijen',
      },
    ],
  },
};
