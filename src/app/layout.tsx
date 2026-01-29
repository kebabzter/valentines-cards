import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HeartsBackground } from "@/components/HeartsBackground";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Fonts via link (next/font not working in env) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-hearts">
        <HeartsBackground />
        {children}
      </body>
    </html>
  );
}
