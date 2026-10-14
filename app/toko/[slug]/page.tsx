"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  QrCode,
  Search,
  Clock,
  MapPin,
  Phone,
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Send,
  X,
} from "lucide-react";
import { Product } from "@/lib/data/types";
import { OrderDraftResponse } from "@/lib/ai/types";
import { useLanguage } from "@/lib/i18n";

export default function ShopCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { t, isEn } = useLanguage();

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<(Product & { totalStock: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // AI Order Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<OrderDraftResponse | null>(null);

  // Final Order Form State
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [requestedTime, setRequestedTime] = useState("Pagi ini");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isSellerPreview = urlParams.get("mode") === "seller_preview";
      if (!isSellerPreview) {
        sessionStorage.setItem("agripass_role", "buyer");
        localStorage.setItem("agripass_role", "buyer");
        sessionStorage.removeItem("agripass_seller_auth");
      }
    }
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch(`/api/public/shops/${slug}/products`);
        if (res.ok) {
          const data = await res.json();
          setShop(data.shop);
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Gagal memuat katalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, [slug]);

  // AI Extraction Handler
  const handleExtractWithAi = async () => {
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/order-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiMessage, shopSlug: slug }),
      });
      if (res.ok) {
        const draft: OrderDraftResponse = await res.json();
        setExtractedDraft(draft);

        // Auto-fill fulfillment jika terdeteksi
        if (draft.fulfillment.method) {
          setFulfillmentMethod(draft.fulfillment.method);
        }
        if (draft.fulfillment.requestedTimeText) {
          setRequestedTime(draft.fulfillment.requestedTimeText);
        }
        if (draft.fulfillment.deliveryAddress) {
          setDeliveryAddress(draft.fulfillment.deliveryAddress);
        }
      }
    } catch (err) {
      console.error("Gagal ekstraksi AI:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Order Handler
  const handleSubmitOrder = async () => {
    if (!customerName || !customerContact) {
      alert("Mohon lengkapi nama dan kontak WhatsApp Anda.");
      return;
    }

    if (!extractedDraft || extractedDraft.items.length === 0) {
      alert("Tidak ada item sayuran yang dipesan.");
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderItems = extractedDraft.items
        .filter((item) => item.productId && (item.quantity ?? 0) > 0)
        .map((item) => ({
          productId: item.productId!,
          requestedQty: item.quantity || 1,
          unit: item.unit || "unit",
          notes: item.originalText,
        }));

      const payload = {
        customerName,
        customerContactPrivate: customerContact,
        fulfillmentMethod,
        requestedTimeText: requestedTime,
        deliveryAddress: fulfillmentMethod === "DELIVERY" ? deliveryAddress : undefined,
        items: orderItems,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderSuccess(data.order);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengirim pesanan");
      }
    } catch (err) {
      console.error("Gagal submit pesanan:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const categories = [
    { key: "Semua", label: isEn ? "All" : "Semua" },
    { key: "Sayuran Daun", label: isEn ? "Leafy Greens" : "Sayuran Daun" },
    { key: "Buah & Tomat", label: isEn ? "Fruits & Tomatoes" : "Buah & Tomat" },
    { key: "Cabai", label: isEn ? "Chilies & Peppers" : "Cabai" },
    { key: "Umbi", label: isEn ? "Tubers & Roots" : "Umbi" },
    { key: "Polong", label: isEn ? "Beans & Pods" : "Polong" },
    { key: "Bumbu & Umbi", label: isEn ? "Spices & Herbs" : "Bumbu & Umbi" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchQuery =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Shop Header */}
      <section className="bg-emerald-900 text-white pt-8 pb-12 px-4 border-b border-emerald-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 border border-emerald-700 text-xs text-lime-300 font-medium mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-lime-400" /> {isEn ? "Verified Produce Stall" : "Kios Terverifikasi"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {shop?.name || (isEn ? "Berkah Mandiri Fresh Produce Stall" : "Kios Sayur Berkah Mandiri")}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                {isEn ? "Fresh Market Block B No. 12, Bandung" : "Pasar Segar Blok B No. 12, Bandung"}
              </p>
            </div>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-lime-400 text-emerald-950 font-bold hover:bg-lime-300 shadow-md shadow-emerald-950/20 transition self-start sm:self-auto text-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              {isEn ? "Order via AI Chat" : "Pesan Pakai Chat AI"}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-200/80 border-t border-emerald-800/80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-lime-400" /> {isEn ? "Hours: 06:00 AM - 06:00 PM" : "Buka: 06:00 - 18:00 WIB"}
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-lime-400" /> {isEn ? "Local Courier Delivery & Pickup" : "Antar Kurir Lokal & Ambil Kios"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-lime-400" /> WhatsApp: 0812-3456-7890
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={isEn ? "Search produce (e.g. spinach, tomato, chili)..." : "Cari sayuran (contoh: bayam, tomat, cabai)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.key
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            {isEn ? "Loading produce catalog..." : "Memuat katalog sayuran..."}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            {isEn ? "No produce found matching your search." : "Tidak ada sayuran yang cocok dengan pencarian Anda."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.totalStock > 5
                          ? "bg-lime-100 text-lime-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {p.totalStock} {p.saleUnit}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <div className="text-emerald-800 font-extrabold text-base">
                    Rp {p.priceIdr.toLocaleString("id-ID")}
                    <span className="text-[11px] font-normal text-slate-500">
                      {" "}
                      / {p.saleUnit}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <Link
                      href={`/produk/${p.publicId}`}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      title={isEn ? "View origin passport & QR" : "Lihat paspor kebun & QR"}
                    >
                      <QrCode className="w-3.5 h-3.5" /> {isEn ? "Passport" : "Paspor"}
                    </Link>

                    <button
                      onClick={() => {
                        setAiMessage(
                          isEn
                            ? `I would like to order 1 ${p.saleUnit} of ${p.name}`
                            : `Saya mau pesan ${p.name} 1 ${p.saleUnit}`
                        );
                        setIsAiModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isEn ? "Order" : "Pesan"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom AI Assistant Action Button */}
      <div className="fixed bottom-4 inset-x-0 max-w-md mx-auto px-4 z-40">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-600 text-white font-bold shadow-xl shadow-emerald-950/30 flex items-center justify-between border border-emerald-700/60 hover:scale-[1.01] transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs text-lime-300 font-semibold leading-none">
                {isEn ? "AgriPass AI Assistant" : "Asisten AI AgriPass"}
              </div>
              <div className="text-sm font-bold">
                {isEn ? "Type Natural Language Order" : "Ketik Pesanan Bebas di Sini"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-lime-300" />
        </button>
      </div>

      {/* AI Assistant Modal & Order Drawer */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isEn ? "AI Order Assistant" : "Asisten Pemesanan AI"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEn
                      ? "Extracts natural language messages into order drafts"
                      : "Ekstraksi pesan bahasa sehari-hari ke draf pesanan"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 flex-1">
              {orderSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {isEn ? "Order Submitted Successfully!" : "Pesanan Berhasil Diajukan!"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {isEn ? "Order Code: " : "Kode Pesanan: "}
                      <span className="font-bold text-emerald-800 text-sm">
                        {orderSuccess.publicCode}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {isEn ? "Estimated Total: " : "Total Estimasi: "}Rp {orderSuccess.totalSnapshot.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-xl text-left text-xs text-emerald-900 space-y-1 border border-emerald-200">
                    <p className="font-semibold">{isEn ? "Next Steps:" : "Langkah Selanjutnya:"}</p>
                    <p>
                      {isEn
                        ? "1. Seller will review your order and reserve produce stock."
                        : "1. Penjual akan meninjau pesanan dan mencadangkan stok."}
                    </p>
                    <p>
                      {isEn
                        ? "2. If weighed on scale, seller will confirm final weight before handoff."
                        : "2. Jika barang ditimbang, penjual akan mengonfirmasi berat akhir sebelum serah terima."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setExtractedDraft(null);
                      setAiMessage("");
                      setIsAiModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs"
                  >
                    {isEn ? "Close & Back to Catalog" : "Tutup & Kembali ke Katalog"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Text Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      {isEn
                        ? "Write your produce order in casual language:"
                        : "Tuliskan pesanan Anda dalam bahasa sehari-hari:"}
                    </label>
                    <textarea
                      rows={3}
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder={
                        isEn
                          ? "Example: 2 bunches of spinach, 1 kg carrots, please deliver this afternoon to Mawar St No 4"
                          : "Contoh: bayam 2 ikat, cabai 10 ribu, tomat 1 kg tolong antar sore ya ke Jl Mawar No 4"
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />

                    {/* Quick suggestion buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 self-center">
                        {isEn ? "Try clicking:" : "Coba klik:"}
                      </span>
                      <button
                        onClick={() =>
                          setAiMessage(
                            isEn
                              ? "2 bunches spinach, 1 kg tomatoes, 10k chili deliver afternoon to Orchid St No 12"
                              : "bayam 2 ikat, tomat 1 kg, cabai 10 ribu tolong antar sore ke Jl Anggrek No 12"
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {isEn ? "2 bunches spinach, 1 kg tomatoes..." : "bayam 2 ikat, tomat 1 kg, cabai 10rb..."}
                      </button>
                      <button
                        onClick={() =>
                          setAiMessage(
                            isEn
                              ? "3 bunches water spinach and half kg carrots pickup at stall"
                              : "kangkung 3 ikat sama wortel setengah kilo ambil di kios ya"
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {isEn ? "3 bunches water spinach, half kg carrots..." : "kangkung 3 ikat, wortel 1/2 kg..."}
                      </button>
                    </div>

                    <button
                      onClick={handleExtractWithAi}
                      disabled={aiLoading || !aiMessage.trim()}
                      className="w-full py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiLoading
                        ? (isEn ? "Analyzing Order with AI..." : "Menganalisis Pesanan...")
                        : (isEn ? "Extract Order with AI" : "Ekstrak Pesanan Otomatis")}
                    </button>
                  </div>

                  {/* Extracted Items Preview */}
                  {extractedDraft && (
                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      {/* Questions / Clarifications */}
                      {extractedDraft.questions && extractedDraft.questions.length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Klarifikasi Dibutuhkan:
                          </div>
                          {extractedDraft.questions.map((q, idx) => (
                            <div key={idx} className="text-amber-800">
                              <p>{q}</p>
                              {/* Quick answer chips for cabai */}
                              {q.toLowerCase().includes("cabai") && (
                                <div className="flex gap-2 mt-1.5">
                                  <button
                                    onClick={() => {
                                      // Resolusi pilihan cabai merah keriting
                                      const updatedItems = [...extractedDraft.items];
                                      const prodCmk = products.find(
                                        (p) => p.publicId === "prod-cabai-merah-keriting"
                                      );
                                      if (prodCmk) {
                                        updatedItems.push({
                                          productId: prodCmk.id,
                                          productName: prodCmk.name,
                                          originalText: "cabai merah keriting",
                                          quantity: 0.25,
                                          unit: "kg",
                                          budgetIdr: 10000,
                                          needsClarification: false,
                                        });
                                      }
                                      setExtractedDraft({
                                        ...extractedDraft,
                                        items: updatedItems.filter(
                                          (i) => !i.needsClarification
                                        ),
                                        questions: [],
                                      });
                                    }}
                                    className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold"
                                  >
                                    Pilih Cabai Merah Keriting (~0.25 kg)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updatedItems = [...extractedDraft.items];
                                      const prodRawit = products.find(
                                        (p) => p.publicId === "prod-cabai-rawit-merah"
                                      );
                                      if (prodRawit) {
                                        updatedItems.push({
                                          productId: prodRawit.id,
                                          productName: prodRawit.name,
                                          originalText: "cabai rawit merah",
                                          quantity: 0.2,
                                          unit: "kg",
                                          budgetIdr: 10000,
                                          needsClarification: false,
                                        });
                                      }
                                      setExtractedDraft({
                                        ...extractedDraft,
                                        items: updatedItems.filter(
                                          (i) => !i.needsClarification
                                        ),
                                        questions: [],
                                      });
                                    }}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-semibold"
                                  >
                                    Pilih Cabai Rawit Merah (~0.2 kg)
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700">
                          Draf Item Pesanan Terdeteksi:
                        </div>
                        {extractedDraft.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                              item.needsClarification
                                ? "bg-amber-50/50 border-amber-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900">
                                {item.productName || item.originalText}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.quantity ? `${item.quantity} ${item.unit}` : "Jumlah belum pasti"}
                                {item.budgetIdr && ` (Budget Rp ${item.budgetIdr.toLocaleString("id-ID")})`}
                              </div>
                              {item.clarificationNote && (
                                <div className="text-[10px] text-amber-700 mt-0.5">
                                  {item.clarificationNote}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                const newItems = extractedDraft.items.filter((_, i) => i !== idx);
                                setExtractedDraft({ ...extractedDraft, items: newItems });
                              }}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Customer Details Form */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-700">
                          Informasi Pemesan:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nama Lengkap *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="p-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="No. WhatsApp *"
                            value={customerContact}
                            onChange={(e) => setCustomerContact(e.target.value)}
                            className="p-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">
                              Metode Penerimaan:
                            </label>
                            <select
                              value={fulfillmentMethod}
                              onChange={(e) => setFulfillmentMethod(e.target.value as any)}
                              className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                            >
                              <option value="PICKUP">Ambil Sendiri di Kios</option>
                              <option value="DELIVERY">Antar Kurir Lokal</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1">
                              Waktu Permintaan:
                            </label>
                            <input
                              type="text"
                              value={requestedTime}
                              onChange={(e) => setRequestedTime(e.target.value)}
                              placeholder="Pagi / Sore"
                              className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        {fulfillmentMethod === "DELIVERY" && (
                          <input
                            type="text"
                            placeholder="Alamat Pengantaran *"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        )}

                        <button
                          onClick={handleSubmitOrder}
                          disabled={submittingOrder}
                          className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingOrder ? "Mengirim Pesanan..." : "Konfirmasi & Kirim Pesanan"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
