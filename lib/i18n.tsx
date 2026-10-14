"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type Language = "id" | "en";

export interface Translations {
  // Brand & Nav
  brandTagline: string;
  navSellerMode: string;
  navViewStore: string;
  navBuyerSession: string;
  navExitSession: string;
  navExitSessionConfirm: string;
  navShopCatalog: string;
  navBuyerCatalog: string;
  navSellerDashboard: string;
  langSwitchTitle: string;

  // Home Page Hero
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;

  // Home Page Portals
  portalBuyerBadge: string;
  portalBuyerAccess: string;
  portalBuyerTitle: string;
  portalBuyerDesc: string;
  portalBuyerFeat1Title: string;
  portalBuyerFeat1Desc: string;
  portalBuyerFeat2Title: string;
  portalBuyerFeat2Desc: string;
  portalBuyerFeat3Title: string;
  portalBuyerFeat3Desc: string;
  portalBuyerBtn: string;

  portalSellerBadge: string;
  portalSellerAccess: string;
  portalSellerTitle: string;
  portalSellerDesc: string;
  portalSellerFeat1Title: string;
  portalSellerFeat1Desc: string;
  portalSellerFeat2Title: string;
  portalSellerFeat2Desc: string;
  portalSellerFeat3Title: string;
  portalSellerFeat3Desc: string;
  portalSellerBtn: string;

  // Home Page Architecture & Specs
  archTitle: string;
  archSubtitle: string;
  specRoleSepTitle: string;
  specRoleSepDesc: string;
  specDbTitle: string;
  specDbDesc: string;
  specAiTitle: string;
  specAiDesc: string;
  specOfflineTitle: string;
  specOfflineDesc: string;

  // Buyer Store Catalog (/toko/[slug])
  storeOpenToday: string;
  storeHours: string;
  storeReviews: string;
  storeSearchPlaceholder: string;
  catAll: string;
  catLeafy: string;
  catFruits: string;
  catTubers: string;
  catSpices: string;
  freshnessGrade: string;
  freshnessScore: string;
  farmOriginLabel: string;
  inStockLabel: string;
  outOfStockLabel: string;
  addToCartBtn: string;
  viewPassportBtn: string;
  cartHeading: string;
  cartEmptyText: string;
  cartTotalLabel: string;
  cartCheckoutWABtn: string;
  cartDeliveryNotes: string;

  // AI Order Assistant in Store
  aiOrderTitle: string;
  aiOrderBadge: string;
  aiOrderSubtitle: string;
  aiOrderPlaceholder: string;
  aiOrderSubmitBtn: string;
  aiOrderLoading: string;
  aiOrderSuccessMsg: string;

  // Seller Dashboard (/seller)
  sellerAccessBlockedTitle: string;
  sellerAccessBlockedDesc: string;
  sellerBlockedHppTitle: string;
  sellerBlockedHppDesc: string;
  sellerBlockedAuditTitle: string;
  sellerBlockedAuditDesc: string;
  sellerBackToStoreBtn: string;
  sellerExitBuyerBtn: string;

  sellerLoginTitle: string;
  sellerLoginDesc: string;
  sellerPinPlaceholder: string;
  sellerLoginBtn: string;
  sellerLoginError: string;
  sellerDemoPinHint: string;

  sellerTabIntake: string;
  sellerTabStock: string;
  sellerTabOrders: string;
  sellerTabAnalytics: string;
  sellerTabDb: string;
  sellerLogoutBtn: string;

  // Product & Batch Transparency Passport (/produk/[id], /batch/[id])
  passportTitle: string;
  passportBatchTitle: string;
  passportBackBtn: string;
  passportOriginFarm: string;
  passportHarvestDate: string;
  passportIntakeDate: string;
  passportShelfLife: string;
  passportQualityGrade: string;
  passportStorageTips: string;
  passportAskAiTitle: string;
  passportAskAiDesc: string;
  passportAskAiPlaceholder: string;
  passportAskAiSubmit: string;
  passportAskAiLoading: string;

  // Footer
  footerCopyright: string;
  footerMotto: string;
}

export const translationsMap: Record<Language, Translations> = {
  id: {
    // Brand & Nav
    brandTagline: "Dari barang masuk hingga pesanan siap",
    navSellerMode: "Mode Operasional Penjual",
    navViewStore: "Lihat Toko",
    navBuyerSession: "Sesi Pembeli",
    navExitSession: "Keluar Sesi",
    navExitSessionConfirm: "Apakah Anda ingin keluar dari sesi Pembeli untuk berganti peran?",
    navShopCatalog: "Katalog Belanja",
    navBuyerCatalog: "Katalog Pembeli",
    navSellerDashboard: "Dashboard Penjual",
    langSwitchTitle: "Ganti Bahasa (Switch Language)",

    // Home Page Hero
    heroBadge: "Hacktoberfest Open-Source AI Challenge Week 2",
    heroTitle1: "Satu Ekosistem Sayur Pintar,",
    heroTitle2: "Dua Portal Khusus",
    heroSubtitle: "Pemisahan tegas antara area belanja konsumen dengan ruang kontrol operasional rahasia pedagang kios, didukung kecerdasan buatan Gemini dan database persisten anti-hilang.",

    // Home Page Portals
    portalBuyerBadge: "Untuk Konsumen & Pembeli",
    portalBuyerAccess: "Akses Terbuka Bebas",
    portalBuyerTitle: "Portal Belanja & Paspor Sayur Segar",
    portalBuyerDesc: "Pengalaman e-commerce sayur segar harian langsung dari kios terdekat. Lihat asal kebun, rating kesegaran visual, dan pesan cukup dengan chat pesan biasa.",
    portalBuyerFeat1Title: "Katalog Sayuran Segar Real-Time",
    portalBuyerFeat1Desc: "18 komoditas siap beli lengkap dengan harga eceran dan status ketersediaan rak.",
    portalBuyerFeat2Title: "Paspor Transparansi & Jejak Panen",
    portalBuyerFeat2Desc: "Pindai QR untuk memverifikasi tanggal panen, nama petani, dan estimasi daya simpan sayur.",
    portalBuyerFeat3Title: "Asisten Pesanan Bahasa Alami (AI)",
    portalBuyerFeat3Desc: "Cukup ketik '2 ikat bayam dan 1 kg wortel', AI menyusun draf keranjang otomatis ke WhatsApp.",
    portalBuyerBtn: "Buka Katalog Belanja Sayur",

    portalSellerBadge: "Untuk Pemilik Kios & Pedagang",
    portalSellerAccess: "Akses Terproteksi PIN",
    portalSellerTitle: "Ruang Kontrol Operasional Penjual",
    portalSellerDesc: "Pusat kendali internal kios: inspeksi AI kamera barang masuk, kalkulator susut sortir otomatis, manajemen stok HPP modal rahasia, dan pemroses pesanan kilat.",
    portalSellerFeat1Title: "Inspeksi AI Kamera Barang Masuk",
    portalSellerFeat1Desc: "Kamera memindai kiriman karung, mendeteksi cacat layu, dan menghitung susut sortasi otomatis.",
    portalSellerFeat2Title: "Proteksi HPP Modal & Margin Tertutup",
    portalSellerFeat2Desc: "Harga modal beli petani dan kalkulasi laba bersih terlindungi dari akses pembeli.",
    portalSellerFeat3Title: "Manajemen Pesanan Kilat & WhatsApp",
    portalSellerFeat3Desc: "Terima draf pesanan pembeli, perbarui status kemas, dan pantau pengiriman langsung.",
    portalSellerBtn: "Masuk Ruang Kontrol Penjual",

    // Home Page Architecture & Specs
    archTitle: "Arsitektur Kios Cerdas AgriPass",
    archSubtitle: "Menghubungkan rantai pasok pangan segar dari petani, kios pasar tradisional, hingga meja makan pembeli.",
    specRoleSepTitle: "Isolasi Peran Ketat",
    specRoleSepDesc: "Sesi pembeli otomatis mengunci akses ke area penjual untuk menjaga kerahasiaan margin dan audit stok.",
    specDbTitle: "Database Persisten Anti-Hilang",
    specDbDesc: "Penyimpanan data lokal & cloud tangguh memastikan riwayat batch dan transaksi aman saat restart.",
    specAiTitle: "AI Vision & Natural Language",
    specAiDesc: "Model AI Gemini open-weight mengotomasi inspeksi visual susut panen dan perakitan keranjang bahasa bebas.",
    specOfflineTitle: "Dukungan Jaringan Lokal (LAN)",
    specOfflineDesc: "Bisa diakses dari HP penjual maupun pembeli dalam jaringan Wi-Fi lokal pasar tanpa internet cepat.",

    // Buyer Store Catalog (/toko/[slug])
    storeOpenToday: "Buka Hari Ini",
    storeHours: "05.00 - 13.00 WIB (Pagi Segar)",
    storeReviews: "4.9/5.0 (280+ Ulasan Pembeli)",
    storeSearchPlaceholder: "Cari sayuran segar... (contoh: kangkung, wortel, tomat)",
    catAll: "Semua",
    catLeafy: "Sayur Daun",
    catFruits: "Buah & Polong",
    catTubers: "Umbi-umbian",
    catSpices: "Bumbu Dapur",
    freshnessGrade: "Tingkat Segar",
    freshnessScore: "Skor Kesegaran",
    farmOriginLabel: "Asal Kebun",
    inStockLabel: "Stok Tersedia",
    outOfStockLabel: "Habis",
    addToCartBtn: "+ Keranjang",
    viewPassportBtn: "Lihat Paspor QR",
    cartHeading: "Keranjang Belanja",
    cartEmptyText: "Keranjang belanja Anda masih kosong.",
    cartTotalLabel: "Total Belanja",
    cartCheckoutWABtn: "Pesan via WhatsApp Sekarang",
    cartDeliveryNotes: "Pesanan akan dikonfirmasi pedagang langsung via WhatsApp.",

    // AI Order Assistant in Store
    aiOrderTitle: "Asisten Pesanan AI (Ketik Bebas)",
    aiOrderBadge: "Gemini AI",
    aiOrderSubtitle: "Tulis pesanan Anda seperti chat biasa, AI akan otomatis memasukkannya ke keranjang belanja!",
    aiOrderPlaceholder: "Contoh: Mau pesan 2 ikat bayam, 1 kg wortel brastagi, dan setengah kg cabai rawit merah dong...",
    aiOrderSubmitBtn: "Analisis & Buat Draf Keranjang",
    aiOrderLoading: "AI sedang membaca dan menyusun pesanan Anda...",
    aiOrderSuccessMsg: "Berhasil! Produk pesanan telah dimasukkan ke keranjang belanja Anda.",

    // Seller Dashboard (/seller)
    sellerAccessBlockedTitle: "Akses Akun Penjual Tidak Diizinkan",
    sellerAccessBlockedDesc: "Perangkat ini sedang aktif dalam Sesi Pembeli di portal belanja konsumen.",
    sellerBlockedHppTitle: "Kerahasiaan Harga Modal",
    sellerBlockedHppDesc: "Data harga modal petani, margin laba kotor, dan laba bersih dilindungi dari pandangan pembeli.",
    sellerBlockedAuditTitle: "Integritas Audit & Sortir",
    sellerBlockedAuditDesc: "Fitur kalkulasi susut susulan dan penyesuaian stok hanya boleh diakses oleh pengelola kios.",
    sellerBackToStoreBtn: "Kembali Belanja di Toko Sayur",
    sellerExitBuyerBtn: "Keluar dari Sesi Pembeli (Ganti ke Akun Penjual)",

    sellerLoginTitle: "Masuk Akun Penjual",
    sellerLoginDesc: "Masukkan PIN 4 digit untuk membuka ruang kontrol operasional kios Anda.",
    sellerPinPlaceholder: "Masukkan PIN (Demo: 1234 atau agripass)",
    sellerLoginBtn: "Buka Dashboard Penjual",
    sellerLoginError: "PIN salah. Coba 1234 atau agripass untuk demo.",
    sellerDemoPinHint: "Gunakan PIN demo: 1234 atau agripass",

    sellerTabIntake: "1. Barang Masuk & AI Inspeksi",
    sellerTabStock: "2. Manajemen Stok & HPP",
    sellerTabOrders: "3. Pesanan Masuk (Live)",
    sellerTabAnalytics: "4. Analitik Keuangan & AI Restock",
    sellerTabDb: "5. Database & Cadangan Cloud",
    sellerLogoutBtn: "Keluar Akun Penjual",

    // Product & Batch Transparency Passport (/produk/[id], /batch/[id])
    passportTitle: "Paspor Transparansi Produk",
    passportBatchTitle: "Paspor Riwayat Batch Sayur",
    passportBackBtn: "Kembali ke Katalog Toko",
    passportOriginFarm: "Asal Kebun & Petani",
    passportHarvestDate: "Tanggal Panen",
    passportIntakeDate: "Tanggal Masuk Kios",
    passportShelfLife: "Estimasi Daya Simpan",
    passportQualityGrade: "Tingkat Kualitas Sortir",
    passportStorageTips: "Tips Penyimpanan di Rumah",
    passportAskAiTitle: "Tanya AI Asisten Sayur",
    passportAskAiDesc: "Tanyakan cara memasak, masa simpan, atau kandungan gizi sayur ini.",
    passportAskAiPlaceholder: "Contoh: Berapa lama bayam ini bertahan di kulkas bawah?",
    passportAskAiSubmit: "Tanya AI",
    passportAskAiLoading: "AI sedang menganalisis pertanyaan Anda...",

    // Footer
    footerCopyright: "© 2026 AgriPass AI — Hacktoberfest Open-Source AI Challenge Week 2.",
    footerMotto: "Kenali sayuran Anda. Bagikan ceritanya. Ubah pertanyaan menjadi pesanan.",
  },

  en: {
    // Brand & Nav
    brandTagline: "From intake to order-ready",
    navSellerMode: "Seller Operational Mode",
    navViewStore: "View Store",
    navBuyerSession: "Buyer Session",
    navExitSession: "Exit Session",
    navExitSessionConfirm: "Do you want to exit Buyer session to switch roles?",
    navShopCatalog: "Shopping Catalog",
    navBuyerCatalog: "Buyer Catalog",
    navSellerDashboard: "Seller Dashboard",
    langSwitchTitle: "Switch Language (Ganti Bahasa)",

    // Home Page Hero
    heroBadge: "Hacktoberfest Open-Source AI Challenge Week 2",
    heroTitle1: "One Smart Produce Ecosystem,",
    heroTitle2: "Two Dedicated Portals",
    heroSubtitle: "Strict isolation between consumer shopping front and private stall operational control room, powered by Gemini AI and crash-proof persistent database.",

    // Home Page Portals
    portalBuyerBadge: "For Consumers & Shoppers",
    portalBuyerAccess: "Free Open Access",
    portalBuyerTitle: "Shopping Portal & Fresh Produce Passport",
    portalBuyerDesc: "Daily fresh produce e-commerce experience straight from local market stalls. View farm origins, visual freshness rating, and order using simple natural chat.",
    portalBuyerFeat1Title: "Real-Time Fresh Produce Catalog",
    portalBuyerFeat1Desc: "18 commodities ready to purchase with retail pricing and live shelf inventory status.",
    portalBuyerFeat2Title: "Transparency Passport & Harvest Trace",
    portalBuyerFeat2Desc: "Scan QR to verify harvest dates, farmer partners, and estimated produce shelf life.",
    portalBuyerFeat3Title: "Natural Language AI Order Assistant",
    portalBuyerFeat3Desc: "Just type '2 bunches of spinach and 1 kg carrots', AI creates an automated WhatsApp cart draft.",
    portalBuyerBtn: "Open Fresh Produce Catalog",

    portalSellerBadge: "For Stall Owners & Traders",
    portalSellerAccess: "PIN Protected Access",
    portalSellerTitle: "Seller Operational Control Room",
    portalSellerDesc: "Internal stall operations: camera AI intake inspection, automatic sortation shrinkage calculator, confidential HPP cost inventory, and express order management.",
    portalSellerFeat1Title: "Camera AI Intake Inspection",
    portalSellerFeat1Desc: "Camera scans incoming sacks, detects wilt defects, and auto-calculates sortation shrinkage.",
    portalSellerFeat2Title: "Protected HPP Cost & Private Margins",
    portalSellerFeat2Desc: "Farmer wholesale purchase costs and net profit calculations are securely hidden from buyers.",
    portalSellerFeat3Title: "Express Order & WhatsApp Management",
    portalSellerFeat3Desc: "Accept buyer order drafts, update packing status, and monitor live delivery dispatch.",
    portalSellerBtn: "Enter Operational Control Room",

    // Home Page Architecture & Specs
    archTitle: "AgriPass Smart Stall Architecture",
    archSubtitle: "Connecting the fresh produce supply chain from local farmers to traditional stalls and home dining tables.",
    specRoleSepTitle: "Strict Role Isolation",
    specRoleSepDesc: "Buyer sessions automatically lock out seller operations to protect confidential margins and stock audits.",
    specDbTitle: "Persistent Crash-Proof Database",
    specDbDesc: "Robust local & cloud storage guarantees batch history and customer transactions remain intact across restarts.",
    specAiTitle: "AI Vision & Natural Language",
    specAiDesc: "Open-weight Gemini AI models automate intake defect sortation and conversational cart assembly.",
    specOfflineTitle: "Local Network (LAN) Support",
    specOfflineDesc: "Accessible by seller and buyer smartphones within local market Wi-Fi without fast internet connection.",

    // Buyer Store Catalog (/toko/[slug])
    storeOpenToday: "Open Today",
    storeHours: "05:00 AM - 01:00 PM (Morning Fresh)",
    storeReviews: "4.9/5.0 (280+ Customer Reviews)",
    storeSearchPlaceholder: "Search fresh produce... (e.g. spinach, carrots, tomatoes)",
    catAll: "All",
    catLeafy: "Leafy Greens",
    catFruits: "Fruits & Pods",
    catTubers: "Tubers & Roots",
    catSpices: "Kitchen Spices",
    freshnessGrade: "Freshness Grade",
    freshnessScore: "Freshness Score",
    farmOriginLabel: "Farm Origin",
    inStockLabel: "In Stock",
    outOfStockLabel: "Sold Out",
    addToCartBtn: "+ Add to Cart",
    viewPassportBtn: "View QR Passport",
    cartHeading: "Shopping Cart",
    cartEmptyText: "Your shopping cart is currently empty.",
    cartTotalLabel: "Total Bill",
    cartCheckoutWABtn: "Order via WhatsApp Now",
    cartDeliveryNotes: "Orders will be directly confirmed by vendor via WhatsApp.",

    // AI Order Assistant in Store
    aiOrderTitle: "AI Order Assistant (Free Text)",
    aiOrderBadge: "Gemini AI",
    aiOrderSubtitle: "Write your order naturally like texting a friend, AI will automatically add items to your cart!",
    aiOrderPlaceholder: "Example: I would like 2 bunches of water spinach, 1 kg Brastagi carrots, and half a kg of red chili peppers please...",
    aiOrderSubmitBtn: "Analyze & Draft Shopping Cart",
    aiOrderLoading: "AI is reading and parsing your produce request...",
    aiOrderSuccessMsg: "Success! Produce items have been added to your shopping cart.",

    // Seller Dashboard (/seller)
    sellerAccessBlockedTitle: "Seller Account Access Not Allowed",
    sellerAccessBlockedDesc: "This device is currently active in a Buyer Session on the consumer portal.",
    sellerBlockedHppTitle: "Cost Price Confidentiality",
    sellerBlockedHppDesc: "Farmer wholesale purchase costs, gross margins, and net profits are strictly shielded from customers.",
    sellerBlockedAuditTitle: "Inventory & Sortation Integrity",
    sellerBlockedAuditDesc: "Post-intake shrinkage adjustment and stock reconciliation can only be accessed by stall operators.",
    sellerBackToStoreBtn: "Return to Produce Store",
    sellerExitBuyerBtn: "Exit Buyer Session (Switch to Seller Account)",

    sellerLoginTitle: "Seller Account Login",
    sellerLoginDesc: "Enter your 4-digit PIN to access your internal stall operational dashboard.",
    sellerPinPlaceholder: "Enter PIN (Demo: 1234 or agripass)",
    sellerLoginBtn: "Unlock Seller Dashboard",
    sellerLoginError: "Incorrect PIN. Try 1234 or agripass for demo.",
    sellerDemoPinHint: "Use demo PIN: 1234 or agripass",

    sellerTabIntake: "1. Intake & AI Inspection",
    sellerTabStock: "2. Inventory & Cost Management",
    sellerTabOrders: "3. Live Incoming Orders",
    sellerTabAnalytics: "4. Financial Analytics & Restock",
    sellerTabDb: "5. Database & Cloud Backup",
    sellerLogoutBtn: "Sign Out Seller",

    // Product & Batch Transparency Passport (/produk/[id], /batch/[id])
    passportTitle: "Product Transparency Passport",
    passportBatchTitle: "Produce Batch History Passport",
    passportBackBtn: "Back to Produce Catalog",
    passportOriginFarm: "Farm Origin & Farmer",
    passportHarvestDate: "Harvest Date",
    passportIntakeDate: "Intake Date",
    passportShelfLife: "Estimated Shelf Life",
    passportQualityGrade: "Sortation Quality Grade",
    passportStorageTips: "Home Storage Recommendations",
    passportAskAiTitle: "Ask AI Produce Assistant",
    passportAskAiDesc: "Inquire about recipes, storage duration, or nutritional facts for this produce.",
    passportAskAiPlaceholder: "Example: How long will this spinach stay crisp in the crisper drawer?",
    passportAskAiSubmit: "Ask AI",
    passportAskAiLoading: "AI is analyzing your question...",

    // Footer
    footerCopyright: "© 2026 AgriPass AI — Hacktoberfest Open-Source AI Challenge Week 2.",
    footerMotto: "Know your produce. Share its story. Turn questions into orders.",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
  isId: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => {},
  toggleLang: () => {},
  t: translationsMap.id,
  isId: true,
  isEn: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("id");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang") as Language;
      if (urlLang === "id" || urlLang === "en") {
        setLangState(urlLang);
        localStorage.setItem("agripass_lang", urlLang);
        document.documentElement.lang = urlLang;
        return;
      }
      const savedLang = localStorage.getItem("agripass_lang") as Language;
      if (savedLang === "id" || savedLang === "en") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang;
      }
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem("agripass_lang") as Language;
      if (saved === "id" || saved === "en") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("agripass_lang_change", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("agripass_lang_change", handleSync);
    };
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("agripass_lang", newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(new Event("agripass_lang_change"));
    }
  };

  const toggleLang = () => {
    setLang(lang === "id" ? "en" : "id");
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: translationsMap[lang] || translationsMap.id,
      isId: lang === "id",
      isEn: lang === "en",
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
