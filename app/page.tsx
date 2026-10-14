"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Database,
  Store,
  Users,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function HomePage() {
  const { t, isEn } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header with Dual Gateway Concept */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/90 border border-emerald-600/60 text-xs font-semibold text-lime-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            {t.heroBadge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {t.heroTitle1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-200">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* DUAL PORTAL GATEWAY CARDS (Ultra-Contrast Hero Showcase) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* ======================================================== */}
          {/* PORTAL 1: PEMBELI & KONSUMEN (Fresh Emerald / Consumer) */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xl overflow-hidden flex flex-col justify-between hover:border-emerald-400 transition-all duration-300 group">
            {/* Top Ribbon */}
            <div className="bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-400 p-1"></div>
            
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Badge & Role Title */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-emerald-900 text-xs font-black uppercase tracking-wider border border-lime-300">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                    {t.portalBuyerBadge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {t.portalBuyerAccess}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-800 transition">
                    {t.portalBuyerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {t.portalBuyerDesc}
                  </p>
                </div>

                {/* Consumer Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 font-bold block">{t.portalBuyerFeat1Title}</strong>
                      <span className="text-slate-600">
                        {t.portalBuyerFeat1Desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 font-bold block">{t.portalBuyerFeat2Title}</strong>
                      <span className="text-slate-600">
                        {t.portalBuyerFeat2Desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 font-bold block">{t.portalBuyerFeat3Title}</strong>
                      <span className="text-slate-600">
                        {t.portalBuyerFeat3Desc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Actions for Buyer */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <Link
                  href="/toko/berkah-mandiri"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition group-hover:scale-[1.01]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{t.portalBuyerBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {isEn ? "No account registration required" : "Tanpa registrasi akun"}
                  </span>
                  <Link
                    href="/batch/batch-bayam-hijau-today"
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    {isEn ? "Sample QR Passport →" : "Contoh Paspor QR →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PORTAL 2: PENJUAL & OPERASIONAL (Dark Midnight POS / ERP) */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl border-2 border-emerald-800 shadow-xl overflow-hidden flex flex-col justify-between hover:border-lime-400 transition-all duration-300 group">
            {/* Top Ribbon */}
            <div className="bg-gradient-to-r from-amber-400 via-lime-400 to-emerald-500 p-1"></div>

            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Badge & Role Title */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900 text-lime-300 text-xs font-black uppercase tracking-wider border border-emerald-700">
                    <Store className="w-3.5 h-3.5 text-lime-400" />
                    {t.portalSellerBadge}
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> {t.portalSellerAccess}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-lime-300 transition">
                    {t.portalSellerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/75 mt-2 leading-relaxed">
                    {t.portalSellerDesc}
                  </p>
                </div>

                {/* Seller Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-lime-400 text-emerald-950 flex items-center justify-center shrink-0 text-[10px] font-black">
                      1
                    </span>
                    <div>
                      <strong className="text-white font-bold block">{t.portalSellerFeat1Title}</strong>
                      <span className="text-emerald-200/80">
                        {t.portalSellerFeat1Desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-lime-400 text-emerald-950 flex items-center justify-center shrink-0 text-[10px] font-black">
                      2
                    </span>
                    <div>
                      <strong className="text-white font-bold block">{t.portalSellerFeat2Title}</strong>
                      <span className="text-emerald-200/80">
                        {t.portalSellerFeat2Desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-lime-400 text-emerald-950 flex items-center justify-center shrink-0 text-[10px] font-black">
                      3
                    </span>
                    <div>
                      <strong className="text-white font-bold block">{t.portalSellerFeat3Title}</strong>
                      <span className="text-emerald-200/80">
                        {t.portalSellerFeat3Desc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Actions for Seller */}
              <div className="space-y-3 pt-6 border-t border-emerald-800/80">
                <Link
                  href="/seller"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-emerald-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-lime-950/30 transition group-hover:scale-[1.01]"
                >
                  <Lock className="w-4 h-4 text-emerald-900" />
                  <span>{t.portalSellerBtn} (PIN: 1234)</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>

                <div className="flex items-center justify-between text-xs text-emerald-300/80 px-1">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Database className="w-3.5 h-3.5 text-lime-400" />
                    {isEn ? "Crash-Proof Database Active" : "Database Anti-Hilang Aktif"}
                  </span>
                  <span className="text-amber-300 font-semibold text-[11px]">
                    {isEn ? "Confidential costs protected 🔒" : "Kerahasiaan modal terlindungi 🔒"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: MENGAPA KEDUA PORTAL HARUS TERPISAH? (Prinsip Arsitektur) */}
      <section className="bg-white py-16 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              {isEn ? "DESIGN PRINCIPLES & DATA PRIVACY" : "PRINSIP DESAIN & PRIVASI DATA"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isEn
                ? "Why are Seller and Buyer Portals Strictly Separated?"
                : "Mengapa Akses Penjual dan Pembeli Dipisahkan?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isEn
                ? "Protecting stall owner trade secrets while delivering maximum transparency to consumers."
                : "Menjaga kerahasiaan bisnis pedagang sembari memberikan transparansi optimal bagi konsumen."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                {isEn ? "Wholesale Cost & Margin Privacy" : "Kerahasiaan Modal & Margin"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Central wholesale market purchase prices, cargo logistics fees, and sortation shrinkage rates are protected trade secrets. Shoppers only see fair retail prices."
                  : "Harga beli kulakan pasar induk, biaya ongkir kargo, dan persentase susut sortasi adalah rahasia dapur pedagang. Konsumen hanya melihat harga jual eceran yang adil."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                {isEn ? "Tailored User Experience (UX)" : "Fokus Pengalaman Pengguna (UX)"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Shoppers need frictionless ordering, vivid produce photos, and chat-based carts without passwords. Sellers need full ERP/POS tooling for weigh-ins and FIFO rotation."
                  : "Pembeli butuh belanja cepat, melihat foto segar, dan mengetik pesanan tanpa login. Pedagang butuh software POS/ERP untuk timbang aktual dan rotasi stok FIFO."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                {isEn ? "Real-Time Inventory Synchronization" : "Sinkronisasi Stok Real-Time"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Despite total UI isolation, both portals share a single atomic database engine. When a new batch arrives at the backroom, shelf availability updates instantaneously."
                  : "Meskipun visualnya terpisah total, kedua portal terhubung ke 1 engine database persisten yang sama. Begitu ada sayur masuk di gudang, stok pembeli langsung terbarui detik itu juga."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ALUR END-TO-END DEMO */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-block px-3 py-1 bg-lime-100 text-lime-900 rounded-full text-xs font-bold">
              {isEn ? "END-TO-END DEMO WALKTHROUGH" : "ALUR SIMULASI DEMO JURI"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isEn ? "How Both Portals Collaborate Daily" : "Bagaimana Kedua Portal Berkolaborasi?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isEn
                ? "A complete daily operational flow from dawn to evening:"
                : "Alur operasional sehari-hari dari subuh hingga sore hari dalam satu siklus utuh:"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                {isEn ? "04:30 Dawn (Seller)" : "04:30 Subuh (Penjual)"}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isEn ? "Produce Intake & HPP Costing" : "Barang Masuk & Hitung HPP"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Farmer delivers fresh produce. Seller logs receipt, Gemini AI inspects quality from photo, and sellable unit HPP is calculated."
                  : "Petani kirim sayur ke kios. Penjual input penerimaan, Gemini AI inspeksi mutu dari foto, dan HPP layak jual terhitung."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-[11px] font-bold text-lime-900 bg-lime-200 px-2.5 py-0.5 rounded-full inline-block">
                {isEn ? "07:00 Morning (Buyer)" : "07:00 Pagi (Pembeli)"}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isEn ? "QR Scan & Natural Language AI Order" : "Scan QR & Pesan via Chat AI"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Shopper scans basket QR, checks origin passport, and types order into chat box. AI extracts cart items directly."
                  : "Pembeli scan QR keranjang sayur, cek paspor panen, dan ketik pesanan di chat box. AI langsung mengekstrak item pesanan."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-[11px] font-bold text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-full inline-block">
                {isEn ? "08:30 Morning (Seller)" : "08:30 Pagi (Penjual)"}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isEn ? "Accept & Actual Weighing" : "Terima & Timbang Aktual"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Seller accepts order (atomic stock reserved), weighs actual pack, and completes order seamlessly."
                  : "Penjual menerima pesanan (stok dicadangkan atomik), timbang berat aktual sayuran, lalu selesaikan pesanan dengan tepat."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                {isEn ? "17:00 Evening (Seller)" : "17:00 Sore (Penjual)"}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isEn ? "Shrinkage Audit & Restock Suggestion" : "Audit Susut & Rekomendasi Restock"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Seller records wilted leaves in stock adjustment. Gemini AI prepares dawn wholesale restock list ready for WhatsApp."
                  : "Penjual catat daun layu di menu penyesuaian stok. AI Gemini menyusun daftar kulakan pasar subuh siap kirim via WhatsApp."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Footnote Banner */}
      <footer className="bg-emerald-950 text-emerald-200 py-8 px-4 text-center border-t border-emerald-900 text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/toko/berkah-mandiri"
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-lime-300 font-bold border border-emerald-700 transition"
          >
            🛒 {t.portalBuyerBtn}
          </Link>
          <Link
            href="/seller"
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold transition"
          >
            🔐 {t.portalSellerBtn} (PIN: 1234)
          </Link>
        </div>
        <p className="text-emerald-400/60 pt-2">
          {t.footerCopyright} {t.footerMotto}
        </p>
      </footer>
    </div>
  );
}
