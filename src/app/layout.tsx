import type { Metadata } from "next";
import { Neucha, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const neucha = Neucha({ 
  weight: '400',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-neucha',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Офигенные истории",
  description: "Генератор уникальных историй",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`${neucha.variable} ${jetbrainsMono.variable} antialiased bg-[#fffdf0] text-[#171717]`}
      >
        {children}
        <Script
          strategy="afterInteractive"
          data-id="101462949"
          src="//static.getclicky.com/js"
        />
      </body>
    </html>
  );
}
