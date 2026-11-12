import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GENOIX VFX | Premium VFX & Digital Products Marketplace",
  description: "Download 4K CC packs, After Effects, Premiere Pro, Alight Motion & CapCut presets, thumbnail PSDs, and VFX assets.",
  icons: {
    icon: "/logo-tight.png",
    shortcut: "/logo-tight.png",
    apple: "/logo-tight.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="icon" type="image/png" href="/logo-tight.png" />
        <link rel="shortcut icon" type="image/png" href="/logo-tight.png" />
        <link rel="apple-touch-icon" href="/logo-tight.png" />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased selection:bg-[#A855F7] selection:text-white`}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <AIChatWidget />
      </body>
    </html>
  );
}
