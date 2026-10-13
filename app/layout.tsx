import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriPass AI — Dari Barang Masuk Hingga Pesanan Siap",
  description:
    "Aplikasi operasional penjual sayuran & paspor produk transparan berbasis QR dan Asisten AI open-weight.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-emerald-950 text-emerald-300/70 border-t border-emerald-900 py-6 text-center text-xs">
          <p>© 2026 AgriPass AI — Hacktoberfest Open-Source AI Challenge Week 2.</p>
          <p className="mt-1 text-emerald-400/60">
            Know your produce. Share its story. Turn questions into orders.
          </p>
        </footer>
      </body>
    </html>
  );
}
