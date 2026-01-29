import type { Metadata, Viewport } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HeartsBackground } from "@/components/HeartsBackground";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valentine's Cards",
  description: "Collect and reveal Valentine's Day messages.",
  icons: {
    icon: "./favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${jetbrainsMono.variable} antialiased bg-hearts`}
      >
        <HeartsBackground />
        {children}
      </body>
    </html>
  );
}
