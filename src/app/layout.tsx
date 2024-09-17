import type { Metadata } from "next";
import { Neucha, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${neucha.variable} ${jetbrainsMono.variable} antialiased bg-[#fffdf0] text-[#171717]`}
      >
        {children}
      </body>
    </html>
  );
}
