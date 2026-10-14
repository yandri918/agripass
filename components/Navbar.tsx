"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Lock, Eye, LogOut, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const isSellerArea = pathname?.startsWith("/seller");
  const isBuyerArea =
    pathname?.startsWith("/toko") ||
    pathname?.startsWith("/produk") ||
    pathname?.startsWith("/batch");

  const [activeRole, setActiveRole] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = sessionStorage.getItem("agripass_role") || localStorage.getItem("agripass_role");
      if (role === "buyer" || isBuyerArea) {
        setActiveRole("buyer");
      } else if (sessionStorage.getItem("agripass_seller_auth") === "true") {
        setActiveRole("seller");
      } else {
        setActiveRole(null);
      }
    }
  }, [pathname, isBuyerArea]);

  const handleExitBuyerSession = () => {
    if (confirm(t.navExitSessionConfirm)) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("agripass_role");
        localStorage.removeItem("agripass_role");
        sessionStorage.removeItem("agripass_seller_auth");
        setActiveRole(null);
        window.location.href = "/";
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-emerald-950/95 text-white backdrop-blur border-b border-emerald-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-emerald-950 shadow-md font-black text-xl">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5">
              AgriPass <span className="text-xs bg-lime-400/20 text-lime-300 font-semibold px-2 py-0.5 rounded-full border border-lime-400/30">AI</span>
            </span>
            <span className="text-[10px] text-emerald-300/80 font-normal">{t.brandTagline}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-emerald-900/90 rounded-lg p-0.5 border border-emerald-700/80 text-xs font-semibold shrink-0" title={t.langSwitchTitle}>
            <button
              id="btn-lang-id"
              type="button"
              onClick={() => setLang("id")}
              className={`px-2 py-0.5 rounded-md transition text-[11px] sm:text-xs cursor-pointer ${
                lang === "id"
                  ? "bg-lime-400 text-emerald-950 shadow-xs font-bold"
                  : "text-emerald-300 hover:text-white"
              }`}
            >
              ID
            </button>
            <button
              id="btn-lang-en"
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded-md transition text-[11px] sm:text-xs cursor-pointer ${
                lang === "en"
                  ? "bg-lime-400 text-emerald-950 shadow-xs font-bold"
                  : "text-emerald-300 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            {isSellerArea ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-lime-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                  {t.navSellerMode}
                </div>
                <Link
                  href="/toko/berkah-mandiri?mode=seller_preview"
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 transition text-emerald-100"
                  title="Preview public storefront"
                >
                  <Eye className="w-3.5 h-3.5 text-lime-400" />
                  <span className="hidden sm:inline">{t.navViewStore}</span>
                </Link>
              </>
            ) : activeRole === "buyer" || isBuyerArea ? (
              <>
                <Link
                  href="/toko/berkah-mandiri"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500 text-emerald-950 font-bold hover:bg-lime-400 shadow-sm transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.navShopCatalog}</span>
                </Link>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/90 border border-emerald-700 text-lime-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-lime-400"></span>
                  {t.navBuyerSession}
                </div>
                <button
                  onClick={handleExitBuyerSession}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-300/70 hover:text-red-200 hover:bg-red-950/60 transition text-xs border border-transparent hover:border-red-800"
                  title={t.navExitSession}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.navExitSession}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/toko/berkah-mandiri"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-700 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-lime-400" />
                  <span>{t.navBuyerCatalog}</span>
                </Link>
                <Link
                  href="/seller"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500 text-emerald-950 font-bold hover:bg-lime-400 shadow-sm transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.navSellerDashboard}</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
