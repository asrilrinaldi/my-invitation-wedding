import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CoupleProvider } from "@/lib/context/CoupleContext";
import { EventProvider } from "@/lib/context/EventContext";
import { MusicProvider } from "@/lib/context/MusicContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "The Wedding of Asril & Sisi",
  description: "Undangan Pernikahan Asril Rinaldi & Sisi Dian Yuriska - Minggu, 20 Juni 2027",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "The Wedding of Asril & Sisi",
    description: "Kami mengundang Anda untuk hadir dalam momen bahagia pernikahan Asril & Sisi.",
    images: [
      {
        url: "/foto-pasangan/DSC_0228-2.jpg",
        width: 600,
        height: 800,
        alt: "The Wedding of Asril & Sisi",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-[#B5AAA0] selection:text-black bg-[#EDE8E1]">
        <CoupleProvider>
          <EventProvider>
            <MusicProvider>
              {children}
            </MusicProvider>
          </EventProvider>
        </CoupleProvider>
      </body>
    </html>
  );
}
