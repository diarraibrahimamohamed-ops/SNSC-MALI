import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaccin-Track",
  description: "Système de suivi de vaccination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head />
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
