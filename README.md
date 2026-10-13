# 🥦 AgriPass AI

> **Dari barang masuk hingga pesanan siap.**  
> *Know your produce. Share its story. Turn questions into orders.*

Aplikasi operasional penjual sayuran open-source yang menggabungkan pencatatan barang masuk, kalkulasi biaya pokok per unit layak jual, paspor produk transparan berbasis QR, dan asisten AI untuk memahami produk serta menyusun pesanan dari bahasa sehari-hari.

Dibuat untuk **Hacktoberfest Open-Source AI Challenge Week 2** (Tema: *Side Hustle*).

---

## 🌟 Fitur Utama (P0 MVP)

1. **📦 Pencatatan Batch & Kalkulator Susut**
   - Catat kuantitas diterima vs kerusakan awal saat sortasi subuh.
   - Formula otomatis: `Kuantitas Layak Jual = Diterima - Rusak`.
   - Hitung biaya pokok per unit layak jual: `Biaya Unit = (Harga Beli + Ongkos + Persiapan) ÷ Layak Jual`.
   - **Privasi Terjamin:** Harga beli internal dan margin keuntungan tidak dibocorkan ke antarmuka publik atau prompt publik AI.

2. **🤖 Asisten AI Ekstraksi Pesanan**
   - Pelanggan mengetik pesanan bahasa sehari-hari: *"bayam 2 ikat, cabai 10 ribu, tomat 1 kg tolong antar sore ke Jl Mawar No 4"*.
   - AI langsung menyusun draf terstruktur (produk, kuantitas, satuan, estimasi budget, dan metode penerimaan).
   - **Deteksi Ambiguitas:** Pesanan *"cabai 10 ribu"* langsung memicu klarifikasi cerdas (*"Apakah Cabai Merah Keriting atau Cabai Rawit Merah?"*).

3. **⚖️ Alur Pesanan & Reservasi Stok Atomik**
   - `SUBMITTED`: Pelanggan mengajukan pesanan.
   - `ACCEPTED`: Penjual menerima dan **stok langsung dicadangkan secara atomik** untuk mencegah overbooking.
   - `PREPARING`: Penjual menimbang sayuran aktual dan memperbarui total harga sebelum serah terima.
   - `COMPLETED`: Transaksi selesai, memotong stok fisik secara permanen dan melepaskan reservasi.
   - `CANCELLED`: Pembatalan melepaskan reservasi stok tanpa memotong fisik.

4. **🏷️ Paspor Produk & Generator QR Code**
   - Transparansi asal kebun/pasar, tanggal panen, tanggal barang masuk, dan klaim kualitas (sortasi daun muda, bebas pestisida).
   - Generasi kode QR instan (`/api/qr`) untuk dicetak ke label keranjang atau kemasan sayur.
   - Pelanggan dapat memindai QR untuk membuka paspor produk dan bertanya langsung ke Asisten AI (*"Kapan dipanen?", "Berapa harga 1/2 kilo?"*).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.4 (App Router) + React 19
- **Bahasa:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Validasi Skema:** Zod
- **Ikon:** Lucide React
- **QR Engine:** QRCode
- **Arsitektur Data:** In-Memory Domain DataStore dengan audit logs & Prisma schema blueprint

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/yandri918/agripass.git
cd agripass

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka peramban di:
- **Portal Utama:** [http://localhost:3000](http://localhost:3000)
- **Dashboard Penjual:** [http://localhost:3000/seller](http://localhost:3000/seller)
- **Katalog Publik Pelanggan:** [http://localhost:3000/toko/berkah-mandiri](http://localhost:3000/toko/berkah-mandiri)
- **Contoh Paspor Produk:** [http://localhost:3000/produk/prod-tomat-buah](http://localhost:3000/produk/prod-tomat-buah)

---

## 📁 Struktur Proyek

```
agripass/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── order-draft/       # Ekstraksi pesanan percakapan
│   │   │   └── product-answer/    # Q&A publik berbasis data paspor
│   │   ├── orders/                # Pembuatan pesanan pelanggan
│   │   ├── public/
│   │   │   ├── batches/[id]/      # Paspor batch publik
│   │   │   ├── products/[id]/     # Detail produk & paspor
│   │   │   └── shops/[slug]/      # Katalog publik toko
│   │   ├── qr/                    # Generator gambar QR dinamis
│   │   └── seller/
│   │       ├── batches/           # Intake barang masuk & biaya
│   │       └── orders/            # Status pesanan & reservasi
│   ├── batch/[id]/                # Halaman paspor batch spesifik
│   ├── produk/[id]/               # Halaman paspor produk & Q&A
│   ├── seller/                    # Dashboard penjual 4 tab
│   ├── toko/[slug]/               # Katalog publik & chat AI drawer
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── components/
│   └── Navbar.tsx                 # Navigasi responsif
├── lib/
│   ├── ai/
│   │   ├── service.ts             # AI Adapter & Rule-based fallback
│   │   └── types.ts               # Skema Zod AI Output Contract
│   └── data/
│       ├── seed-data.ts           # 18 Sayuran Indonesia & pemasok
│       ├── store.ts               # Atomic DataStore & business logic
│       └── types.ts               # TypeScript domain interfaces
├── prisma/
│   └── schema.prisma              # Skema relational database per blueprint
└── docs/
---

## 🌐 Arsitektur Deployment Multi-Platform (Railway + Vercel)

AgriPass dirancang dengan arsitektur **Hybrid Multi-Platform**:
- **Railway (Website Utama & Operasional Penjual):** Menjalankan dashboard penjual `/seller`, pencatatan batch intake, alur reservasi stok atomik, dan seluruh logika backend operasional.
- **Vercel (Paspor Publik & Target Scan QR):** Portal ultra-cepat untuk pelanggan saat memindai kode QR fisik pada kemasan sayuran (`/produk/[id]`, `/batch/[id]`, `/toko/[slug]`).

### 1. Deploy Website Utama ke Railway
1. Buat proyek baru di [Railway.app](https://railway.app) &rarr; **Deploy from GitHub repo** &rarr; Pilih `yandri918/agripass`.
2. Buka tab **Variables**, tambahkan environment variables:
   ```env
   AI_PROVIDER=gemini
   AI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-flash-latest
   ```
3. Buka tab **Settings** &rarr; **Networking**, klik **Generate Domain** (contoh: `https://agripass-production.up.railway.app`).

### 2. Deploy Portal Scan Paspor ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com) &rarr; **Add New Project** &rarr; Import `yandri918/agripass`.
2. Di bagian **Environment Variables**, masukkan:
   ```env
   NEXT_PUBLIC_RAILWAY_URL=https://agripass-production.up.railway.app
   AI_PROVIDER=gemini
   AI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-flash-latest
   ```
3. Klik **Deploy**. Semua pemanggilan data dari portal paspor di Vercel otomatis tersinkronisasi ke backend Railway secara live melalui Next.js rewrites tanpa kendala CORS.

---

## 📜 Lisensi & Atribusi

Proyek ini dikembangkan di bawah lisensi MIT untuk Hacktoberfest Open-Source AI Challenge Week 2.  
Konsep awal dan pengalaman rantai pasok merujuk pada ekosistem [AgriSensa](https://github.com/yandri918/agrisensa-streamlit).
