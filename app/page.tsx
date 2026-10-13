import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  QrCode,
  Sparkles,
  Scale,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-xs font-semibold text-lime-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            Hacktoberfest Open-Source AI Challenge Week 2
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Dari Barang Masuk <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-200">
              Hingga Pesanan Siap
            </span>
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Aplikasi operasional penjual sayuran: catat batch & susut, paspor produk QR transparan, dan asisten AI untuk mengubah pesan sehari-hari menjadi pesanan siap antar.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/seller"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-lime-400 text-emerald-950 font-bold hover:bg-lime-300 shadow-lg shadow-lime-950/20 transition group"
            >
              <LayoutDashboard className="w-5 h-5" />
              Buka Dashboard Penjual
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/toko/berkah-mandiri"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold border border-emerald-600/60 shadow transition"
            >
              <ShoppingBag className="w-5 h-5 text-lime-400" />
              Coba Katalog & Chat AI
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-300/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime-400" /> 18 Sayuran Ter-seed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime-400" /> Reservasi Stok Atomik
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime-400" /> Kalkulator Susut Akurat
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-lime-400" /> Privasi Modal Terjamin
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pilar Fitur Sesuai Blueprint */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Pencatatan Batch & Susut</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Catat barang masuk, hitung susut awal sortasi, dan peroleh biaya pokok per unit layak jual secara otomatis.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Ekstraksi Pesanan AI</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pelanggan ketik: &ldquo;tomat 1 kg, cabai 10rb, antar sore&rdquo;. AI langsung menyusun draf pesanan dan mendeteksi ambiguitas jenis cabai.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Reservasi Stok Atomik</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Penerimaan pesanan langsung mencadangkan stok. Timbang ulang jika ada selisih berat dan selesaikan transaksi dengan aman.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Paspor Produk & QR</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cetak QR untuk ditempel di keranjang sayur. Pelanggan scan untuk melihat asal kebun, tanggal panen, dan tanya asisten AI.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Showcase Section */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Coba Langsung Alur AgriPass
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Jalankan demo interaktif dari dua sudut pandang: Penjual dan Pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller Experience */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold mb-3">
                  SUDUT PANDANG PENJUAL
                </div>
                <h3 className="text-xl font-bold text-slate-900">Kios Sayur Berkah Mandiri</h3>
                <p className="text-sm text-slate-600 mt-2 mb-4">
                  Kelola 18 sayuran aktif, input penerimaan barang masuk harian, hitung susut, cetak label QR, dan proses pesanan yang masuk.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Simulasi intake: 25 kg tomat, 1.5 kg sortasi rusak
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Alur pesanan: Diterima → Timbang → Selesai
                  </li>
                </ul>
              </div>

              <Link
                href="/seller"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 text-white font-semibold text-center hover:bg-emerald-900 transition flex items-center justify-center gap-2"
              >
                Masuk Dashboard Penjual <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Customer Experience */}
            <div className="bg-white rounded-2xl p-6 border border-lime-300 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 bg-lime-100 text-lime-900 rounded-lg text-xs font-bold mb-3">
                  SUDUT PANDANG PELANGGAN
                </div>
                <h3 className="text-xl font-bold text-slate-900">Katalog Publik & AI Assistant</h3>
                <p className="text-sm text-slate-600 mt-2 mb-4">
                  Buka katalog sayuran segar tanpa perlu login, scan QR produk untuk cek asal & tanggal panen, serta pesan cukup dengan mengetik pesan biasa.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-600"></span>
                    Coba ketik: &ldquo;bayam 2 ikat, cabai 10 ribu tolong antar sore&rdquo;
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-600"></span>
                    Tanya AI: &ldquo;Tomat ini dipanen kapan dan berapa 1/2 kg?&rdquo;
                  </li>
                </ul>
              </div>

              <Link
                href="/toko/berkah-mandiri"
                className="w-full py-2.5 px-4 rounded-xl bg-lime-500 text-emerald-950 font-bold text-center hover:bg-lime-400 transition flex items-center justify-center gap-2"
              >
                Buka Katalog Pelanggan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
