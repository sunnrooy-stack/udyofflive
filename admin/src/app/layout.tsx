import type { Metadata } from "next";
import "./globals.css";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "GEONIX VFX | Admin Control Center",
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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/logo-tight.png" />
        <link rel="shortcut icon" type="image/png" href="/logo-tight.png" />
        <link rel="apple-touch-icon" href="/logo-tight.png" />
      </head>
      <body>
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
