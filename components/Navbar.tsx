import Link from "next/link";
import { Store, ShoppingBag, QrCode, LayoutDashboard, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-emerald-950/90 text-white backdrop-blur border-b border-emerald-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-emerald-950 shadow-md font-black text-xl">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5">
              AgriPass <span className="text-xs bg-lime-400/20 text-lime-300 font-semibold px-2 py-0.5 rounded-full border border-lime-400/30">AI</span>
            </span>
            <span className="text-[10px] text-emerald-300/80 font-normal">Dari barang masuk hingga pesanan siap</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
          <Link
            href="/toko/berkah-mandiri"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 transition"
          >
            <ShoppingBag className="w-4 h-4 text-lime-400" />
            <span className="hidden sm:inline">Katalog</span> Publik
          </Link>

          <Link
            href="/seller"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500 text-emerald-950 font-semibold hover:bg-lime-400 shadow-sm transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Penjual
          </Link>
        </nav>
      </div>
    </header>
  );
}
