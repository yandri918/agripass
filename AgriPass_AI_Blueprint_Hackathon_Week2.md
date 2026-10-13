# AgriPass AI

## Blueprint Produk dan Implementasi — Hacktoberfest Open-Source AI Challenge Week 2

**Pemilik konsep:** Andriyanto — AgriSensa  
**Versi:** 1.0  
**Tanggal:** 13 Oktober 2026, Asia/Tokyo  
**Tema:** Side Hustle  
**Status:** Rancangan pengembangan; bukan pernyataan bahwa fitur sudah dibangun atau diuji.  
**Tagline Indonesia:** Dari barang masuk hingga pesanan siap.  
**Tagline Inggris:** Know your produce. Share its story. Turn questions into orders.

---

## 1. Ringkasan keputusan

AgriPass AI adalah aplikasi untuk penjual sayuran yang menggabungkan pencatatan barang masuk, biaya pengadaan, stok per batch, katalog publik melalui QR, dan asisten AI untuk memahami produk serta menyusun pesanan.

Pengguna pertama adalah satu penjual sayuran nyata yang dapat dihubungi pemilik proyek. Pelanggan rumah tangga menggunakan katalog tanpa berlangganan. Penjual menjadi calon pembayar layanan karena mendapat alat operasional untuk mengurangi pekerjaan pencatatan dan rekap.

Keputusan dasar:

- Bangun proyek dan repository baru selama periode hackathon.
- Gunakan pengalaman modul rantai pasok dan traceability AgriSensa sebagai referensi, dengan atribusi jelas untuk kode yang digunakan kembali.
- MVP melayani satu toko, dengan antarmuka yang nyaman di ponsel.
- Sumber kebenaran adalah database dan catatan yang disetujui penjual.
- AI merupakan pendamping; keputusan harga, kebenaran informasi, dan penerimaan pesanan tetap dikendalikan manusia.
- Model open-weight menjadi inti pemahaman pertanyaan dan ekstraksi pesanan.
- QR digunakan untuk membuka katalog atau paspor produk. QRIS pembayaran belum termasuk MVP.
- Tidak mengklaim blockchain, sertifikasi independen, prediksi keamanan pangan, atau manfaat bisnis yang belum dibuktikan.

## 2. Masalah pengguna dan proposisi nilai

Penjual sayur dapat menerima barang dari beberapa pemasok, menjual dengan satuan berbeda, dan menerima pesanan melalui percakapan. Harga, stok, asal produk, serta rekap pesanan sering berada di tempat yang berbeda.

| Masalah | Solusi yang dirancang | Bukti yang perlu dikumpulkan |
|---|---|---|
| Barang masuk tidak tercatat konsisten | Pencatatan batch dan jumlah layak jual | Waktu input, kelengkapan catatan |
| Ongkos dan susut tidak masuk perhitungan | Kalkulator biaya pengadaan per satuan | Perbandingan dengan perhitungan penjual |
| Pelanggan berulang kali bertanya informasi sama | Katalog QR dan jawaban AI berbasis data | Jenis pertanyaan, ketepatan jawaban |
| Pesanan bahasa sehari-hari perlu direkap ulang | AI menyusun draf item pesanan | Akurasi produk, jumlah, satuan, dan revisi |
| Stok yang ditawarkan tidak sesuai kondisi | Stok per batch dan pencadangan pesanan | Uji penerimaan, pembatalan, penyelesaian |

Hipotesis nilai: penjual bersedia menggunakan atau membayar alat apabila pekerjaan harian menjadi lebih ringan dan kesalahan berkurang. Ini belum merupakan hasil validasi.

## 3. Persona dan batas pengguna

### 3.1 Penjual

- Menjual sayuran kepada rumah tangga.
- Menggunakan ponsel untuk komunikasi dan pencatatan sederhana.
- Membeli dari petani, pengepul, atau pasar; tidak selalu mengetahui kebun asal.
- Memiliki produk timbang, ikat, atau kemasan.
- Menjadi pemilik dashboard dan pengendali data produk.

### 3.2 Pelanggan

- Membuka katalog melalui tautan atau QR tanpa instalasi.
- Melihat harga, satuan, dan ketersediaan.
- Bertanya tentang produk atau menyampaikan pesanan dalam bahasa sehari-hari.
- Memeriksa draf sebelum mengirim pesanan.
- Memberikan kontak seperlunya; alamat hanya diperlukan jika pengiriman dipilih.

### 3.3 Pemasok

Pada MVP pemasok tidak memiliki akun tersendiri. Penjual memasukkan informasi pemasok dan sumber keterangannya. Konfirmasi otomatis atau portal pemasok berada di luar cakupan.

## 4. Dasar dari kode AgriSensa yang ditinjau

Repository referensi: https://github.com/yandri918/agrisensa-streamlit

Tinjauan dilakukan terhadap branch `main` pada 13 Oktober 2026. Tree SHA yang diperoleh: `7c1b55464c4924175ca516c83d39a4c37a594bc5`. Temuan adalah hasil membaca kode, bukan pengujian runtime atau verifikasi deployment.

### 4.1 Modul rantai pasok

File: `pages/48_🚚_Rantai_Pasok_Live.py`  
Blob SHA: `330ab91c1f0517598e841f664d253b03ff92e211`

Implementasi yang ditemukan:

- Kalkulator biaya BBM, sewa armada, sopir, dan biaya perjalanan.
- Estimasi jarak Haversine dengan faktor jalan 1,4.
- Estimasi susut berdasarkan kategori komoditas dan jarak.
- Perhitungan biaya logistik per kg sebelum/sesudah susut.
- Simulasi pembentukan harga jalur tradisional dan modern.
- Jadwal keberangkatan berdasarkan jam pasar yang ditulis dalam kode.
- Form serah terima, ledger sesi, hash, dan QR berisi teks.

Keterbatasan yang relevan:

- Armada dan batas input berorientasi muatan besar; perlu disesuaikan untuk motor, ambil sendiri, dan ongkos aktual.
- Radar pasar tidak mengambil harga real-time; jam dan dampak harga merupakan nilai tetap.
- Persentase bernama margin diterapkan sebagai markup atas biaya.
- Ledger disimpan di `session_state`, dimulai dengan contoh data, dan hash dihitung ulang saat ditampilkan.
- Catatan QC dari form tidak disertakan dalam entri ledger yang disimpan.
- QR serah terima berisi teks, belum menjadi tautan ke catatan batch bersama.

### 4.2 Modul traceability

File: `pages/49_🏷️_Traceability_Produk.py`  
Blob SHA: `64eee62f1580159c70afa0bd9a87960f63e459d7`

Implementasi yang ditemukan:

- Input komoditas, varietas/grade, petani, lokasi, panen, harga, kontak, foto, dan catatan budidaya.
- Pilihan klaim kualitas melalui checkbox.
- Label berukuran berbeda, PNG/PDF, serta cetak.
- QR menuju halaman Vercel dengan parameter data produk.
- Simulasi tampilan konsumen dan tautan WhatsApp.

Keterbatasan yang relevan:

- Satu `batch_data` disimpan di sesi, belum katalog persisten.
- Harga dan informasi tertanam di parameter URL; QR lama tidak otomatis mengikuti pembaruan.
- Tidak semua data form dikirim ke halaman tujuan, termasuk foto dan riwayat budidaya.
- Bobot URL menggunakan default 1 kg jika data berat tidak tersedia.
- ID batch berbasis tanggal dan hash komoditas tidak cukup untuk identitas batch unik yang andal.
- Tombol pembelian dalam simulasi belum menangani transaksi.
- Tampilan menyebut blockchain/terverifikasi, tetapi modul hanya menghasilkan hash lokal.
- Tidak ditemukan pemanggilan model AI pada kedua modul.

### 4.3 Transformasi menjadi produk baru

| Konsep lama | Rancangan baru |
|---|---|
| Dua modul terpisah | Alur bersama dengan product_id dan batch_id |
| Session state | Database permanen |
| Simulasi biaya logistik besar | Ongkos aktual pengadaan skala penjual |
| QR berisi teks/parameter produk | QR berisi tautan tetap ke server |
| Klaim blockchain | Riwayat pencatatan dengan aktor dan waktu |
| Simulasi tombol beli | Pesanan, persetujuan, reservasi, dan penyelesaian |
| Tanpa model AI | Model open-weight untuk Q&A dan ekstraksi pesanan |

## 5. Alur operasional utama

1. Penjual menyiapkan profil toko, produk, satuan, dan opsi penerimaan.
2. Barang masuk dicatat sebagai batch: pemasok, waktu penerimaan, kuantitas, harga beli, dan ongkos.
3. Penjual memeriksa barang serta mencatat kerusakan awal dan kuantitas layak jual.
4. Penjual menerbitkan produk dengan harga jual, foto, serta informasi publik yang dipilih.
5. Pelanggan membuka QR toko, QR produk, atau QR batch.
6. Pelanggan melihat katalog, bertanya kepada AI, atau menyusun pesanan.
7. Aplikasi menampilkan item, satuan, harga, estimasi total, serta hal yang belum jelas.
8. Pelanggan mengonfirmasi dan mengirim; penjual menerima atau menolak.
9. Penerimaan pesanan mencadangkan stok secara atomik.
10. Penjual menimbang dan menyiapkan barang. Perubahan jumlah/harga yang material dikonfirmasi pelanggan.
11. Pesanan selesai mengurangi stok fisik dan melepaskan reservasi terkait.
12. Pembatalan melepaskan reservasi tanpa mengurangi stok fisik.

Pesanan tidak dikirim ke WhatsApp atau pihak lain secara otomatis pada MVP. Penjual dapat menyalin ringkasan untuk dibagikan sendiri.

## 6. Dashboard dan pengalaman pelanggan

### 6.1 Dashboard penjual

| Halaman | Konten utama | Aksi utama |
|---|---|---|
| Hari Ini | Pesanan masuk, pekerjaan persiapan, stok rendah, penjualan tercatat | Tinjau pesanan, tambah barang |
| Barang Masuk & Stok | Batch, pemasok, biaya, jumlah tersedia, penyesuaian | Terima barang, catat susut |
| Produk & QR | Foto, harga, satuan, informasi publik, label | Terbitkan, ubah harga, cetak QR |
| Pesanan | Draf sampai selesai | Terima, timbang, konfirmasi revisi, selesaikan |

Antarmuka memakai bahasa Indonesia, tombol jelas, formulir singkat, dan input numerik yang sesuai ponsel. Pengaturan lanjutan tidak menghalangi pencatatan dasar.

### 6.2 Halaman pelanggan

- Nama toko, metode pengambilan/pengiriman, serta jam layanan yang diisi penjual.
- Daftar produk tersedia, harga, dan satuan.
- Detail produk, asal yang tersedia, tanggal penerimaan/panen, dan foto.
- Indikator sumber informasi: dicatat penjual, keterangan pemasok, atau dokumen pendukung.
- Asisten AI dan pilihan pemesanan manual jika model tidak tersedia.
- Ringkasan pesanan yang dapat diedit sebelum dikirim.
- Pesanan pelanggan lain tidak dapat dilihat.

## 7. Desain QR dan paspor produk

| Jenis | Contoh rute | Fungsi |
|---|---|---|
| QR toko | `/toko/{slug}` | Seluruh katalog |
| QR produk | `/produk/{public_id}` | Penawaran produk terbaru |
| QR batch | `/batch/{public_id}` | Informasi asal batch spesifik |

QR menyimpan URL publik, bukan data pelanggan, harga beli, atau isi dokumen pribadi. Gunakan domain yang stabil dan HTTPS.

Aturan paspor:

- Harga produk dibaca dari katalog terbaru; harga pesanan yang sudah diterima disimpan sebagai snapshot.
- QR batch tidak dialihkan diam-diam ke batch baru ketika stok habis.
- Batch lama tetap menampilkan riwayat dengan status habis/arsip.
- Jika satu produk memiliki beberapa batch, tampilkan pilihan/keterangan yang benar; jangan menempelkan satu asal pada semua stok.
- QR tidak membuktikan kualitas, keaslian, atau sertifikasi tanpa bukti pendukung.
- Label memperlihatkan nama produk, satuan/berat jika diketahui, identitas batch, dan QR yang bisa dipindai.

## 8. Sumber data sayuran

| Jenis data | Sumber kebenaran | Cara memperoleh |
|---|---|---|
| Nama umum dan alias | Katalog awal yang ditinjau | Seed katalog dan koreksi penjual |
| Harga jual | Keputusan penjual | Form dashboard |
| Stok dan kuantitas | Penerimaan, penyesuaian, dan transaksi | Pencatatan aplikasi |
| Harga beli/ongkos | Catatan pembelian penjual | Input nota/manual |
| Asal dan panen | Pemasok/petani, jika diketahui | Keterangan dan bukti pendukung |
| Kondisi barang | Pemeriksaan penjual | Catatan per batch |
| Foto | Foto nyata yang diunggah penjual | Unggahan |
| Pengetahuan umum | Referensi pertanian/pascapanen yang dikurasi | Konten dengan sumber |
| Pesanan | Konfirmasi pelanggan dan penjual | Form serta hasil ekstraksi yang disetujui |

### 8.1 Katalog awal

Siapkan 15–20 nama sayuran sebagai bantuan pengisian. Contoh: bayam, kangkung, sawi, pakcoy, selada, tomat, wortel, kentang, terong, mentimun, kol, buncis, kacang panjang, cabai merah, dan cabai rawit.

Seed tersebut tidak otomatis menetapkan harga, stok, asal, kandungan gizi, sertifikasi, atau umur simpan. Penjual menentukan satuan jual. Nama varietas hanya ditambahkan jika diketahui.

### 8.2 Data minimum

Produk: nama, satuan jual, harga jual, status publikasi.  
Batch: produk, jumlah diterima, waktu penerimaan, pemasok atau penanda tidak diketahui, kondisi, jumlah rusak awal.  
Biaya: opsional untuk mulai menawarkan barang; jika tidak lengkap, kalkulator harus menandai biaya belum lengkap dan tidak menampilkan laba seolah akurat.

Tanggal panen tidak boleh diisi otomatis dari tanggal penerimaan. Asal pasar pembelian tidak boleh diubah menjadi asal kebun.

### 8.3 Provenance informasi

Simpan `source_type`, `recorded_by`, `recorded_at`, `source_note`, dan tautan bukti opsional untuk klaim penting. Bedakan pernyataan pemasok dengan hasil pemeriksaan penjual. Referensi umum menyertakan judul, penerbit, URL, tanggal akses, dan konteks penggunaan.

Pada MVP tidak diperlukan scraping harga pasar. Harga jual toko tetap berasal dari penjual. Materi AgriSensa lama dapat menjadi bahan kurasi setelah sumbernya diperiksa, bukan dianggap otomatis benar.

## 9. Peran AI dan kontrol manusia

### 9.1 Asisten produk

Model menjawab hanya berdasarkan data publik produk/batch dan referensi yang disetujui. Informasi stok dan harga selalu diambil dari fungsi aplikasi, bukan ingatan model.

Contoh: “Tomat ini kapan dipanen dan berapa setengah kilo?” Jika panen tidak diketahui, AI mengatakan belum tersedia; harga dihitung dari satuan dan harga katalog.

### 9.2 Ekstraksi pesanan

Model mengubah pesan menjadi struktur produk, kuantitas, satuan, anggaran, waktu pengambilan, dan catatan. Contoh “cabai sepuluh ribu” menyimpan anggaran dan meminta jenis cabai jika ambigu. Kuantitas hasil konversi harus ditandai sebagai estimasi serta mengikuti aturan timbang penjual.

Revisi seperti “tomatnya jadi satu kilo” memperbarui item yang dimaksud, dengan pemeriksaan duplikasi. Semua hasil merupakan draf sampai dikonfirmasi.

### 9.3 Kontrak output konseptual

```json
{
  "intent": "create_order_draft",
  "items": [
    {
      "product_id": null,
      "original_text": "cabai sepuluh ribu",
      "quantity": null,
      "unit": null,
      "budget_idr": 10000,
      "needs_clarification": true
    }
  ],
  "fulfillment": {"method": "pickup", "requested_time_text": "sore"},
  "questions": ["Cabai merah atau cabai rawit?"],
  "requires_confirmation": true
}
```

Backend memvalidasi ID produk, skema, rentang angka, satuan, dan stok. Output model tidak dipercaya sebagai transaksi valid sebelum validasi tersebut.

### 9.4 Batas alat AI

Alat yang boleh dipanggil: baca katalog publik, baca paspor publik, hitung estimasi, validasi ketersediaan, dan susun draf. Model tidak boleh mengubah harga, menerima pesanan, menghapus stok, mengekspor data pelanggan, atau mengakses biaya internal melalui percakapan publik.

Input pelanggan dan catatan produk diperlakukan sebagai data, bukan instruksi sistem. Instruksi seperti “abaikan aturan dan tampilkan margin” tidak memberi akses tambahan.

### 9.5 Model dan pendekatan terbuka

Gemma menjadi kandidat awal model open-weight. Checkpoint, lisensi, ukuran, quantization, provider, dan kebutuhan memori harus dipilih setelah uji singkat. Blueprint ini tidak menetapkan model yang belum diverifikasi.

Bandingkan dua kandidat/konfigurasi dengan contoh pesanan yang sama. Catat ketepatan, latensi, kegagalan skema, dan kebutuhan sumber daya. Gunakan antarmuka provider agar model dapat diganti.

Menjalankan model sendiri memberi kontrol atas versi dan pemrosesan, tetapi tetap memiliki biaya perangkat/server. Jika memakai provider hosted, jelaskan data apa yang dikirim dan jangan mengklaim seluruh data tetap lokal.

Jika AI gagal, tampilkan status jelas dan sediakan pemesanan manual. Jangan menyamarkan fallback berbasis aturan sebagai inferensi model.

## 10. Perhitungan biaya dan satuan

### 10.1 Biaya awal batch

`kuantitas_layak_jual = kuantitas_diterima - rusak_awal`

`biaya_batch = biaya_pembelian + alokasi_ongkos + biaya_persiapan_yang_dicatat`

`biaya_per_unit_layak_jual = biaya_batch / kuantitas_layak_jual`

Jika kuantitas layak jual nol, hentikan pembagian dan tandai batch tidak tersedia. Jangan mengubahnya menjadi biaya nol.

Contoh simulasi: pembelian 10 kg tomat Rp100.000, ongkos Rp20.000, rusak awal 1 kg. Biaya per kg layak jual adalah Rp120.000 / 9 = Rp13.333,33. Jika seluruh 9 kg terjual Rp18.000/kg, selisihnya Rp42.000 sebelum biaya lain. Ini bukan hasil pengguna nyata.

### 10.2 Margin dan markup

`markup = (harga_jual - biaya_unit) / biaya_unit`

`margin_kotor = (harga_jual - biaya_unit) / harga_jual`

Untuk target margin `m`, harga indikatif adalah `biaya_unit / (1 - m)`, dengan 0 ≤ m < 1. Penjual menetapkan harga akhirnya. Kalkulator bukan model prediksi pasar.

### 10.3 Aturan akuntansi operasional

- Alokasi ongkos harus berjumlah sama dengan total ongkos. MVP memakai input alokasi per item, dengan opsi bantuan berbobot nilai pembelian.
- Jangan memakai berat sebagai pembagi antarproduk ikat/kemasan jika konversi tidak tersedia.
- Susut awal masuk penyebut biaya unit. Susut setelah penerimaan dicatat sebagai kejadian tersendiri; jangan dibebankan dua kali.
- Margin pesanan memakai biaya batch yang dialokasikan dan snapshot harga jual.
- Penjualan hanya dihitung pada status selesai. Status pembayaran dicatat terpisah jika dibutuhkan.
- Mata uang menggunakan decimal atau integer rupiah sesuai aturan pembulatan yang eksplisit; hindari float biner untuk uang.

### 10.4 Satuan

- Massa disimpan dalam gram atau decimal kg dengan konversi konsisten.
- Ikat/buah/kemasan memakai satuan hitung dan batas pecahan yang ditentukan penjual.
- Tidak ada konversi ikat–kg otomatis tanpa rasio yang diisi penjual.
- Tampilan harga selalu menyebut satuannya.
- Perubahan berat aktual melebihi toleransi yang disepakati memerlukan konfirmasi ulang pelanggan.

## 11. Stok dan status pesanan

`stok_tersedia = stok_fisik - stok_dicadangkan`

```mermaid
stateDiagram-v2
    [*] --> Draf
    Draf --> Diajukan: Pelanggan konfirmasi
    Diajukan --> Diterima: Penjual terima dan cadangkan stok
    Diajukan --> Ditolak
    Diterima --> Disiapkan
    Disiapkan --> MenungguKonfirmasi: Ada perubahan jumlah atau harga
    MenungguKonfirmasi --> Disiapkan: Pelanggan menyetujui
    Disiapkan --> Selesai: Serah terima
    Diterima --> Dibatalkan
    Disiapkan --> Dibatalkan
    MenungguKonfirmasi --> Dibatalkan
    Selesai --> [*]
```

- Draf dan diajukan belum mencadangkan stok; tampilkan bahwa ketersediaan menunggu penerimaan penjual.
- Penerimaan memeriksa stok kembali dalam transaksi database.
- Klik ulang memakai idempotency key dan tidak mencadangkan dua kali.
- Penyelesaian mengurangi fisik dan reservasi dalam transaksi yang sama.
- Pembatalan melepaskan reservasi tepat sekali.
- Susut fisik tidak boleh membuat fisik di bawah reservasi tanpa penanganan pesanan terdampak.
- Pembatalan setelah selesai diperlakukan sebagai proses koreksi/retur terpisah, bukan sekadar mengganti status.
- MVP memilih batch manual dengan saran batch yang lebih dulu diterima. FIFO bukan jaminan keamanan atau kesegaran.

## 12. Arsitektur usulan

Stack berikut adalah pilihan rancangan, bukan konfigurasi yang sudah terpasang. Versi dependency dipilih serta dikunci saat implementasi berdasarkan dokumentasi resminya.

| Komponen | Usulan |
|---|---|
| Aplikasi web | Next.js dan TypeScript, antarmuka responsif |
| Backend | API server-side dalam aplikasi yang sama untuk mengurangi layanan |
| Database | PostgreSQL dengan migrasi dan transaksi |
| Model | Endpoint inferensi open-weight melalui adapter |
| Gambar | Object storage; metadata dan hak akses di database |
| QR | Generator URL menjadi QR dan label cetak |
| Validasi | Skema input/output server-side |
| Deployment | Satu host aplikasi, database, dan endpoint model terpisah bila perlu |

Deployment tidak perlu di banyak platform sekaligus. Jika memilih kategori partner, gunakan teknologi tersebut secara nyata dan dokumentasikan perannya. Host web tidak otomatis mampu menjalankan model; kebutuhan inferensi perlu dipastikan tersendiri.

```mermaid
flowchart TD
    Seller["Dashboard penjual"] --> API["API dan otorisasi"]
    Customer["Katalog QR dan pelanggan"] --> API
    API --> DB["Database produk dan pesanan"]
    API --> AI["Adapter model open-weight"]
    AI --> Validator["Validasi hasil AI"]
    Validator --> API
    API --> Media["Foto dan label"]
```

Layanan model hanya menerima data minimum yang diperlukan. Pembuatan draf tidak memberi model akses menulis langsung ke database.

## 13. Model data konseptual

| Entitas | Kolom utama |
|---|---|
| shops | id, name, slug, timezone, contact_public, fulfillment_settings |
| users / shop_members | id, shop_id, role, identitas autentikasi |
| suppliers | id, shop_id, name, contact_private, source_notes |
| products | id, shop_id, public_id, name, aliases, sale_unit, price_idr, published |
| product_images | id, product_id, storage_key, alt_text |
| batches | id, product_id, supplier_id, public_id, received_at, harvest_date nullable, origin nullable, unit_cost |
| stock_movements | id, batch_id, type, quantity, reason, order_id nullable, actor_id, created_at |
| reservations | id, order_item_id, batch_id, quantity, status |
| orders | id, shop_id, status, customer_contact_private, fulfillment, version, total_snapshot |
| order_items | id, order_id, product_id, requested_qty, actual_qty, unit, price_snapshot |
| product_claims | id, batch_id, claim, source_type, evidence_ref, publication_status |
| audit_events | id, actor_id, entity_type, entity_id, action, before_after, created_at |
| ai_runs | id, task, model_version, latency, schema_valid, error_type, redacted_context_ref |

Gunakan ID acak/UUID untuk identitas permanen. Terapkan foreign key, batas angka nonnegatif, unique public_id, serta isolasi berdasarkan shop_id. `shop_id` disiapkan untuk integritas data; MVP tetap satu toko.

Tanggal disimpan dengan zona/waktu yang konsisten, lalu ditampilkan sesuai toko. Tanggal panen berupa tanggal jika jam tidak diketahui. Jangan mengasumsikan toko berada di zona Jepang hanya karena pengembang tinggal di Jepang.

## 14. Kontrak API awal

Rute berikut merupakan usulan implementasi:

| Metode dan rute | Tujuan | Akses |
|---|---|---|
| GET /api/public/shops/{slug}/products | Katalog publik | Publik, dibatasi laju |
| GET /api/public/products/{id} | Detail produk | Publik |
| GET /api/public/batches/{id} | Paspor batch tersaring | Publik |
| POST /api/ai/product-answer | Jawaban berbasis data publik | Publik, dibatasi laju |
| POST /api/ai/order-draft | Ekstraksi draf | Publik, dibatasi laju |
| POST /api/orders | Mengajukan pesanan | Sesi pelanggan, validasi kontak |
| POST /api/seller/batches | Mencatat penerimaan | Penjual |
| PATCH /api/seller/products/{id} | Mengubah penawaran | Penjual |
| POST /api/seller/orders/{id}/accept | Mencadangkan stok | Penjual |
| POST /api/seller/orders/{id}/complete | Menyelesaikan transaksi | Penjual |
| POST /api/seller/orders/{id}/cancel | Membatalkan sesuai status | Penjual |
| POST /api/seller/stock-adjustments | Mencatat susut/koreksi | Penjual |

Operasi stok memakai idempotency key dan pemeriksaan versi. Endpoint publik memakai proyeksi kolom tersendiri, bukan mengirim seluruh baris database lalu menyembunyikannya di UI.

## 15. Privasi, validasi, dan keandalan

- Autentikasi dashboard dan pemeriksaan izin setiap operasi server.
- Tidak menaruh API key di browser atau repository.
- Pisahkan informasi publik, biaya internal, serta kontak pelanggan/pemasok.
- Foto dan teks pengguna divalidasi; teks di-escape sebelum dirender.
- Dokumen bukti tidak otomatis publik; penjual memilih publikasi dan menyamarkan data pribadi.
- Model menerima katalog minimum, tanpa data margin atau pelanggan lain.
- Jangan merekam kontak pelanggan mentah pada log AI; gunakan redaksi.
- Pembatasan laju dan ukuran pesan untuk endpoint AI/pemesanan.
- Simpan riwayat perubahan, tetapi jangan mengklaim data tidak dapat diubah secara absolut.
- Cadangan database dan uji pemulihan sederhana sebelum uji pengguna nyata.
- Kegagalan model tidak boleh merusak draf atau mengubah stok.
- Ketersediaan selalu diperiksa kembali saat penerimaan, termasuk ketika jawaban AI berasal dari cache.

## 16. Cakupan prioritas

### P0 — Wajib untuk demo lengkap

- Login satu penjual.
- Katalog, satuan, harga, dan foto.
- Batch masuk, biaya opsional, susut awal, dan stok.
- Halaman publik serta QR produk/batch.
- AI Q&A dan ekstraksi pesanan.
- Draf yang bisa diedit serta pertanyaan klarifikasi.
- Penerimaan, reservasi, penyelesaian, dan pembatalan pesanan.
- Label cetak sederhana dan rekap CSV.
- Pengujian satu penjual dan dokumentasi keterbatasan.

### P1 — Setelah P0 stabil

- Bantuan input barang dari catatan teks penjual.
- Pencarian alias produk yang lebih kaya.
- Ringkasan biaya dan tren penjualan sederhana.
- QR toko serta variasi ukuran label tambahan jika belum tercakup.

### Di luar MVP

QRIS otomatis, integrasi WhatsApp resmi, OCR nota, input suara, prediksi permintaan, optimasi rute, marketplace banyak toko, blockchain, sensor IoT, dan klaim estimasi umur simpan ilmiah.

Jika waktu sempit, kurangi tampilan analitik dan variasi label. Jangan mengorbankan validasi stok, kebenaran data, atau fungsi AI inti.

## 17. Validasi pengguna dan pengujian

### 17.1 Bahan dari penjual

Dengan izin, kumpulkan daftar produk, satuan, harga, stok awal, contoh pembelian, serta 10–20 contoh pesan termasuk perubahan pesanan. Samarkan nama dan kontak pelanggan. Tanyakan cara timbang, pembagian ongkos, penerimaan pesanan, serta kebutuhan informasi asal.

### 17.2 Skenario pengujian wajib

| Skenario | Hasil yang diharapkan |
|---|---|
| 10 kg masuk, 1 kg rusak | 9 kg tersedia dan biaya dihitung benar |
| Dua pesanan bersaing atas stok terakhir | Hanya jumlah tersedia yang dapat dicadangkan |
| Klik terima/selesai dua kali | Tidak terjadi pencatatan ganda |
| Pesanan dibatalkan | Reservasi dilepas tepat sekali |
| Harga berubah setelah diterima | Harga pesanan tidak berubah diam-diam |
| Permintaan kg untuk produk ikat | Klarifikasi jika konversi tidak ada |
| “Cabai 10 ribu” dengan dua jenis cabai | Pertanyaan klarifikasi |
| “Tomat jadi 1 kg” | Pembaruan item, bukan duplikasi |
| Tanggal panen kosong | AI menyatakan belum tersedia |
| Pelanggan meminta margin internal | Tidak ada data internal yang bocor |
| Model timeout/JSON salah | Pesan jelas dan pemesanan manual tersedia |
| QR batch habis | Riwayat tetap benar dan status habis tampil |
| Pembukaan QR dari ponsel lain | Tidak bergantung sesi penjual |

### 17.3 Metrik

- Waktu menyelesaikan tugas manual dan dengan aplikasi.
- Akurasi ekstraksi per kolom: produk, kuantitas, satuan, revisi.
- Proporsi pesanan benar secara keseluruhan sebelum koreksi.
- Jumlah koreksi pengguna dan kasus ambigu yang terdeteksi.
- Jawaban sesuai sumber dan kasus informasi tidak diketahui.
- Latensi median/p95 pada konfigurasi yang diuji.
- Biaya operasional berdasarkan pengukuran, bukan asumsi gratis.
- Tanggapan kegunaan, keinginan memakai ulang, dan kesediaan membayar.

Pisahkan contoh pengembangan dari contoh evaluasi agar hasil tidak hanya menunjukkan hafalan pola. Pengujian satu penjual bersifat pilot dan tidak mewakili seluruh pasar.

## 18. Model bisnis

Hipotesis: kode terbuka dengan opsi pemasangan mandiri; layanan berbayar menawarkan hosting, pengelolaan database, backup, label, dan dukungan penjual. Pelanggan pembeli tidak membayar akses katalog.

Harga belum diputuskan. Tanyakan kesediaan membayar setelah penjual menyelesaikan tugas nyata. Catat biaya host aplikasi, database, inferensi, penyimpanan foto, serta waktu dukungan. Pemakaian open-weight tidak berarti biaya operasional nol.

Nilai jual awal adalah pengurangan pekerjaan administrasi dan pelayanan yang lebih konsisten. Peningkatan omzet, kepercayaan, atau pengurangan susut merupakan hipotesis lanjutan sampai ada bukti.

## 19. Kesesuaian hackathon dan orisinalitas

Tema Week 2 adalah Side Hustle: membangun sesuatu dengan open-source AI/open-weight sebagai bagian inti yang memiliki alasan masuk akal untuk dibayar.

Berdasarkan halaman tantangan yang dibaca pada 13 Oktober 2026:

- Periode 12–18 Oktober 2026; tenggat 18 Oktober 23.59 PDT, setara 19 Oktober 15.59 JST.
- Proyek dan repository submission harus dimulai dan diselesaikan dalam jendela tantangan.
- Penggunaan ide/kode open-source sebelumnya diperbolehkan dengan perubahan signifikan dan atribusi.
- Repository baru saja tidak menjadikan salinan proyek lama sebagai karya baru yang memenuhi syarat.
- Sertakan demo/aplikasi atau video, repository, dan penjelasan peran inovasi terbuka.
- Gunakan template submission serta tag yang diwajibkan: devchallenge dan hf26challenge.
- Artikel berbahasa Inggris diperlukan untuk kelayakan hadiah menurut FAQ; UI dapat menggunakan bahasa Indonesia.
- Kualitas tulisan mendapat bobot terbesar. Uji pengguna nyata memperkuat cerita, tetapi jangan membuat klaim pembayaran jika tidak terjadi.

Catat pekerjaan baru dalam README, riwayat commit, dan artikel. Jika memakai bagian kode lama, sebutkan file asal, lisensi, serta perubahan. Verifikasi lisensi repository/file sebelum menyalin. Referensi teknis yang dibaca bukan bukti bahwa seluruh kode telah diaudit.

Kategori kandidat: Gemma jika benar digunakan; host partner jika memang dipakai; observabilitas partner jika implementasinya nyata. Tidak perlu mengejar banyak kategori sekaligus. Periksa kembali aturan saat submission.

## 20. Rencana pengerjaan

| Tanggal JST | Target | Hasil konkret |
|---|---|---|
| 13 Oktober | Validasi kebutuhan, pilih model, susun skema | Data contoh berizin, spesifikasi terkunci |
| 14 Oktober | Produk, batch, stok, dan biaya | Dashboard dasar berfungsi |
| 15 Oktober | Katalog, paspor, QR, label | Dapat dipindai dari ponsel |
| 16 Oktober | AI Q&A, draf pesanan, konfirmasi | Alur end-to-end |
| 17 Oktober | Uji penjual dan perbaikan | Catatan bukti serta hasil pengukuran |
| 18 Oktober | Demo, README, artikel Inggris | Submission sebelum tenggat |
| 19 Oktober sebelum 15.59 | Cadangan waktu | Hanya jika diperlukan, jangan dijadikan target utama |

Jadwal bersifat target pengembangan; disesuaikan dengan waktu pengguna dan hasil uji model. Perubahan setelah tenggat perlu dicatat sesuai aturan tantangan.

## 21. Skenario demo

1. Perkenalkan satu penjual dan masalah yang benar-benar ia alami.
2. Catat batch tomat masuk dan kerusakan awal.
3. Tampilkan biaya per kg dan tetapkan harga jual.
4. Cetak atau tampilkan QR, lalu buka dari ponsel lain.
5. Tanyakan asal/tanggal panen; tunjukkan jawaban jujur jika informasi kosong.
6. Masukkan pesanan dengan satuan campuran dan satu item ambigu.
7. Tunjukkan klarifikasi, ringkasan, serta penerimaan oleh penjual.
8. Selesaikan pesanan dan tampilkan perubahan stok.
9. Tutup dengan pengukuran pilot, keterbatasan, serta peran model terbuka.

Gunakan data dummy berlabel untuk demonstrasi publik jika data nyata belum diizinkan. Identitas serta testimoni pengguna dipublikasikan hanya dengan persetujuan.

## 22. Struktur repository yang diusulkan

- `README.md`: masalah, demo, setup, model, batasan, atribusi.
- `docs/product-blueprint.md`: dokumen ini.
- `docs/data-dictionary.md`: definisi data dan satuan.
- `docs/evaluation.md`: metodologi, kasus uji, hasil aktual.
- `docs/user-pilot.md`: catatan uji yang disamarkan.
- `docs/ai-disclosure.md`: model, provider, alur data, fallback.
- `app/`: halaman penjual, publik, dan API.
- `lib/domain/`: stok, pesanan, biaya, validasi.
- `lib/ai/`: adapter, prompt, skema output, akses alat.
- `db/`: migrasi dan seed katalog tanpa klaim harga/stok nyata.
- `tests/`: invariansi stok, otorisasi, biaya, dan evaluasi ekstraksi.
- `.env.example`: nama konfigurasi dengan placeholder, tanpa rahasia.
- `LICENSE` dan `THIRD_PARTY_NOTICES.md`: lisensi serta atribusi yang telah diverifikasi.

## 23. Definition of Done

- [ ] Penjual dapat mencatat produk/batch dan data bertahan setelah sesi berakhir.
- [ ] Katalog dan QR dapat diakses dari perangkat pelanggan.
- [ ] Data publik tidak membocorkan biaya atau identitas pribadi.
- [ ] Model open-weight nyata menjalankan dua tugas inti dan identitas model dicatat.
- [ ] Informasi kosong menghasilkan jawaban yang tepat, bukan tebakan.
- [ ] Draf dapat dikoreksi; satuan ambigu memicu klarifikasi.
- [ ] Stok konsisten pada penerimaan, pembatalan, dan penyelesaian berulang.
- [ ] Perubahan harga/berat memiliki konfirmasi dan snapshot yang jelas.
- [ ] Fallback manual berfungsi ketika AI tidak tersedia.
- [ ] Penjual nyata mencoba aplikasi atau keterbatasan akses pengguna dilaporkan jujur.
- [ ] README menjelaskan setup, data demo, sumber kode, biaya, dan batasan.
- [ ] Artikel Inggris, demo, repository, dan kategori sesuai pekerjaan nyata.
- [ ] Tidak ada klaim blockchain/sertifikasi/keberhasilan bisnis tanpa bukti.

## 24. Keputusan yang masih perlu dikonfirmasi

1. Daftar produk serta satuan yang digunakan penjual pertama.
2. Apakah pengambilan saja cukup untuk pilot atau perlu pengiriman.
3. Kebiasaan timbang dan toleransi selisih berat yang disepakati pelanggan.
4. Informasi pemasok dan panen yang benar-benar tersedia.
5. Perangkat, anggaran inferensi, dan konfigurasi model yang layak.
6. Nama toko, foto, dan data yang diizinkan tampil dalam demo.
7. Host deployment dan kategori partner berdasarkan implementasi sebenarnya.

Keputusan tersebut dapat dikumpulkan tanpa memperluas cakupan MVP. Jangan menunda fondasi data dan alur inti demi fitur tambahan.

## 25. Referensi dan batas bukti

1. DEV — Halaman Week 2 dan FAQ: https://dev.to/challenges/hacktoberfest-week2-2026-10-12
2. DEV — Contest Rules: https://dev.to/page/hacktoberfest-week2-2026-10-12-contest-rules
3. AgriSensa Streamlit — repository: https://github.com/yandri918/agrisensa-streamlit
4. Rantai Pasok — https://github.com/yandri918/agrisensa-streamlit/blob/7c1b55464c4924175ca516c83d39a4c37a594bc5/pages/48_%F0%9F%9A%9A_Rantai_Pasok_Live.py
5. Traceability Produk — https://github.com/yandri918/agrisensa-streamlit/blob/7c1b55464c4924175ca516c83d39a4c37a594bc5/pages/49_%F0%9F%8F%B7%EF%B8%8F_Traceability_Produk.py

Aturan dan kode ditinjau pada 13 Oktober 2026. Blueprint tidak menyatakan bahwa data referensi pertanian telah divalidasi, model telah dipilih, aplikasi baru telah dibuat, atau dampak bisnis telah terukur. Semua contoh numerik adalah simulasi.

---

**Arah implementasi:** bangun satu alur yang lengkap dan dapat dipertanggungjawabkan: barang masuk, data produk, QR, percakapan AI, pesanan terkonfirmasi, dan stok yang konsisten.
