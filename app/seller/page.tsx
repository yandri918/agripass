"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  QrCode,
  TrendingDown,
  CheckCircle,
  Clock,
  Scale,
  AlertTriangle,
  RefreshCw,
  Plus,
  Save,
  Check,
  X,
  ExternalLink,
  Camera,
  Sparkles,
  Upload,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { Batch, Order, Product, Supplier } from "@/lib/data/types";
import { VisualInspectionResponse } from "@/lib/ai/types";

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"today" | "intake" | "products" | "orders">("today");

  // Data States
  const [products, setProducts] = useState<(Product & { totalStock: number })[]>([]);
  const [batches, setBatches] = useState<(Batch & { product: Product; supplier?: Supplier | null })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Intake Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [receivedQty, setReceivedQty] = useState<number>(10);
  const [initialDamageQty, setInitialDamageQty] = useState<number>(0.5);
  const [purchaseCost, setPurchaseCost] = useState<number>(100000);
  const [freightCost, setFreightCost] = useState<number>(10000);
  const [origin, setOrigin] = useState("Lembang");
  const [harvestDate, setHarvestDate] = useState("");
  const [claimText, setClaimText] = useState("");
  const [submittingIntake, setSubmittingIntake] = useState(false);

  // Visual Inspection AI State (Gemini Vision Multimodal)
  const [inspectionImage, setInspectionImage] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<(VisualInspectionResponse & { suggestedDamageQty?: number }) | null>(null);
  const [inspectionApplied, setInspectionApplied] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Weighed modal state
  const [weighingOrder, setWeighingOrder] = useState<Order | null>(null);
  const [weighedItems, setWeighedItems] = useState<{ [itemId: string]: number }>({});

  const loadAllData = async () => {
    try {
      const [prodRes, batchRes, orderRes] = await Promise.all([
        fetch("/api/public/shops/berkah-mandiri/products"),
        fetch("/api/seller/batches"),
        fetch("/api/seller/orders"),
      ]);

      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products);
      }
      if (batchRes.ok) {
        const d = await batchRes.json();
        setBatches(d.batches);
      }
      if (orderRes.ok) {
        const d = await orderRes.json();
        setOrders(d.orders);
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Set default selected product for intake form
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Live Unit Cost Calculation (Blueprint Section 10.1)
  const currentProduct = products.find((p) => p.id === selectedProductId);
  const liveSalableQty = Math.max(0, receivedQty - initialDamageQty);
  const liveTotalBatchCost = purchaseCost + freightCost;
  const liveUnitCost =
    liveSalableQty > 0 ? Math.round((liveTotalBatchCost / liveSalableQty) * 100) / 100 : 0;

  // Visual Inspection Handlers (Gemini Vision)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setInspectionImage(base64Data);
      setInspectionResult(null);
      setInspectionApplied(false);
      runVisualInspection(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runVisualInspection = async (imageDataUrl: string, mimeType: string = "image/jpeg") => {
    setInspecting(true);
    try {
      const res = await fetch("/api/ai/inspect-produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl,
          mimeType,
          productName: currentProduct?.name,
          receivedQty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInspectionResult(data);
      }
    } catch (err) {
      console.error("Gagal inspeksi visual AI:", err);
    } finally {
      setInspecting(false);
    }
  };

  const handleApplyInspection = () => {
    if (!inspectionResult) return;
    if (typeof inspectionResult.suggestedDamageQty === "number") {
      setInitialDamageQty(inspectionResult.suggestedDamageQty);
    }
    if (inspectionResult.suggestedQualityClaim) {
      setClaimText(inspectionResult.suggestedQualityClaim);
    }
    setInspectionApplied(true);
  };

  // Handle Intake Submit
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || receivedQty <= 0) {
      alert("Mohon pilih produk dan kuantitas yang valid.");
      return;
    }

    setSubmittingIntake(true);
    try {
      const res = await fetch("/api/seller/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          supplierId: selectedSupplierId || undefined,
          receivedQty,
          initialDamageQty,
          purchaseCost,
          freightCost,
          origin: origin || undefined,
          harvestDate: harvestDate || null,
          claimText: claimText || undefined,
          freshnessScore: inspectionResult?.freshnessScore,
          freshnessGrade: inspectionResult?.freshnessGrade,
          inspectionPhoto: inspectionImage || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        loadAllData();
        // Reset form values
        setReceivedQty(10);
        setInitialDamageQty(0);
        setClaimText("");
        setInspectionImage(null);
        setInspectionResult(null);
        setInspectionApplied(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mencatat barang masuk");
      }
    } catch (err) {
      console.error("Gagal submit intake:", err);
    } finally {
      setSubmittingIntake(false);
    }
  };

  // Order Action Handlers
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/accept`, { method: "POST" });
      if (res.ok) {
        alert("Pesanan diterima! Stok telah dicadangkan secara atomik.");
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menerima pesanan");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWeighedOrder = async (orderId: string) => {
    try {
      const itemsPayload = Object.entries(weighedItems).map(([itemId, actualQty]) => ({
        itemId,
        actualQty,
      }));

      const res = await fetch(`/api/seller/orders/${orderId}/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });

      if (res.ok) {
        alert("Kuantitas aktual berhasil disimpan.");
        setWeighingOrder(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!confirm("Selesaikan transaksi ini? Stok fisik akan dikurangi.")) return;
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/complete`, { method: "POST" });
      if (res.ok) {
        alert("Pesanan selesai! Stok fisik telah terpotong.");
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Alasan pembatalan pesanan:");
    if (!reason) return;
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert("Pesanan dibatalkan. Reservasi stok dilepaskan.");
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI Calculations
  const submittedOrdersCount = orders.filter((o) => o.status === "SUBMITTED").length;
  const activeOrdersCount = orders.filter((o) => ["SUBMITTED", "ACCEPTED", "PREPARING"].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalRevenueCompleted = completedOrders.reduce((sum, o) => sum + o.totalSnapshot, 0);
  const lowStockProducts = products.filter((p) => p.totalStock <= 5);

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 pt-6 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-xs text-lime-300 font-medium mb-1.5">
              Dashboard Operasional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Kios Sayur Berkah Mandiri</h1>
            <p className="text-xs text-emerald-300/80 mt-1">
              Pencatatan batch masuk, kalkulasi biaya pokok, reservasi stok & draf pesanan AI.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadAllData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-xs font-semibold text-emerald-200 border border-emerald-700/60 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <Link
              href="/toko/berkah-mandiri"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-400 text-emerald-950 text-xs font-bold hover:bg-lime-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Katalog Publik
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 px-4">
        <div className="max-w-6xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("today")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "today"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Hari Ini
            {submittedOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-lime-500 text-emerald-950 text-[10px] font-black flex items-center justify-center">
                {submittedOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("intake")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "intake"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            Barang Masuk & Biaya
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "orders"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Kelola Pesanan ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "products"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Katalog & Paspor QR ({products.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: HARI INI */}
        {activeTab === "today" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400">Pesanan Baru Masuk</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {submittedOrdersCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Perlu ditinjau & dicadangkan</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400">Pesanan Aktif</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{activeOrdersCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Sedang disiapkan / timbang</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400">Stok Menipis (≤ 5)</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {lowStockProducts.length} sayuran
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Perlu kulakan / intake baru</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400">Penjualan Selesai</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  Rp {totalRevenueCompleted.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{completedOrders.length} transaksi</div>
              </div>
            </div>

            {/* Quick Actions & Urgent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Urgent Orders (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Pesanan Menunggu Respons</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    Lihat Semua ({orders.length})
                  </button>
                </div>

                {orders.filter((o) => o.status === "SUBMITTED").length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Tidak ada pesanan baru yang menunggu respons saat ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter((o) => o.status === "SUBMITTED")
                      .map((o) => (
                        <div
                          key={o.id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {o.customerName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 text-[10px] font-bold">
                                {o.publicCode}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                ({o.fulfillmentMethod === "DELIVERY" ? "Kurir" : "Ambil Kios"})
                              </span>
                            </div>
                            <div className="text-slate-600 mt-1">
                              {o.items.map((i) => `${i.productName} (${i.requestedQty} ${i.unit})`).join(", ")}
                            </div>
                            <div className="text-emerald-800 font-extrabold mt-1">
                              Estimasi: Rp {o.totalSnapshot.toLocaleString("id-ID")}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptOrder(o.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition"
                            >
                              Terima & Cadangkan
                            </button>
                            <button
                              onClick={() => handleCancelOrder(o.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-medium text-xs hover:bg-red-100 hover:text-red-700 transition"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick Intake Trigger (1 col) */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-800 text-[10px] font-bold text-lime-300 mb-2">
                    KULAKAN & INTAKE
                  </div>
                  <h3 className="font-bold text-base">Barang Baru Masuk Subuh Ini?</h3>
                  <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                    Catat barang masuk, pisahkan susut sortasi awal, dan dapatkan harga modal per unit layak jual secara presisi.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("intake")}
                  className="w-full py-2.5 px-4 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs hover:bg-lime-300 transition text-center"
                >
                  Buka Form Barang Masuk & Biaya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BARANG MASUK & KALKULATOR BIAYA */}
        {activeTab === "intake" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Intake (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-slate-900 text-sm">Pencatatan Batch Barang Masuk</h3>
              </div>

              {/* Box Inspeksi Visual AI (Multimodal Gemini Vision) */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Inspeksi Visual AI (Gemini Vision)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Sortasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ambil foto sayuran dari kamera HP/laptop saat barang datang. AI akan menaksir skor kesegaran dan persentase kerusakan sortasi subuh.
                </p>

                {/* Upload or Camera Button */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{inspectionImage ? "Ganti Foto Sayur" : "Foto / Upload Sayur"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {inspectionImage && !inspecting && (
                    <button
                      type="button"
                      onClick={() => runVisualInspection(inspectionImage)}
                      className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-Scan
                    </button>
                  )}
                </div>

                {/* Image Preview & Scan Spinner */}
                {inspectionImage && (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-black/5">
                    <img
                      src={inspectionImage}
                      alt="Sayur yang diinspeksi"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {inspecting && (
                      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-center p-3 space-y-1.5 animate-pulse">
                        <Sparkles className="w-5 h-5 text-lime-400 animate-spin" />
                        <span className="font-bold text-xs">Menganalisis Visual Sayur...</span>
                        <span className="text-[10px] text-emerald-200">Menghitung kesegaran daun & susut sortasi</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hasil Inspeksi AI */}
                {inspectionResult && (
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Skor Kesegaran:</span>
                      <span className="px-2 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        🌿 {inspectionResult.freshnessScore}% ({inspectionResult.freshnessGrade})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span>Estimasi Susut Sortasi:</span>
                      <span className="font-bold text-red-600">
                        {inspectionResult.estimatedDamagePercent}% (~{inspectionResult.suggestedDamageQty} {currentProduct?.saleUnit})
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <div className="font-semibold text-slate-700">Observasi Fisik AI:</div>
                      <ul className="list-disc pl-3.5 space-y-0.5">
                        {inspectionResult.visualObservations.map((obs, idx) => (
                          <li key={idx}>{obs}</li>
                        ))}
                      </ul>
                      {inspectionResult.suggestedHandling && (
                        <div className="pt-1 text-emerald-800 font-medium">
                          💡 <span className="font-bold">Saran:</span> {inspectionResult.suggestedHandling}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyInspection}
                      disabled={inspectionApplied}
                      className="w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {inspectionApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-lime-400" /> Diterapkan ke Form
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Terapkan Estimasi ke Form Intake
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleIntakeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Pilih Komoditas Produk *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.saleUnit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">
                      Jumlah Diterima ({currentProduct?.saleUnit || "unit"}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={receivedQty}
                      onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">
                      Rusak Awal Sortasi ({currentProduct?.saleUnit || "unit"})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={initialDamageQty}
                      onChange={(e) => setInitialDamageQty(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">
                      Total Harga Beli (Rp) *
                    </label>
                    <input
                      type="number"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">
                      Alokasi Ongkos (Rp)
                    </label>
                    <input
                      type="number"
                      value={freightCost}
                      onChange={(e) => setFreightCost(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Asal Kebun / Daerah</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Contoh: Lembang, Ciwidey, Brebes"
                    className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Tanggal Panen (Opsional)</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Kosongkan bila tidak diketahui pasti.</span>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Klaim Kualitas Paspor</label>
                  <input
                    type="text"
                    value={claimText}
                    onChange={(e) => setClaimText(e.target.value)}
                    placeholder="Contoh: Sortasi daun muda petik subuh"
                    className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none"
                  />
                </div>

                {/* Live Cost Box (Blueprint Section 10.1) */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold text-[11px] text-emerald-900 flex items-center justify-between">
                    <span>Kuantitas Layak Jual:</span>
                    <span>
                      {liveSalableQty} {currentProduct?.saleUnit}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-emerald-900 flex items-center justify-between">
                    <span>Biaya Pokok per Unit:</span>
                    <span className="text-sm font-black text-emerald-800">
                      Rp {liveUnitCost.toLocaleString("id-ID")} / {currentProduct?.saleUnit}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700/80 mt-1">
                    Biaya unit = (Beli + Ongkos) ÷ (Diterima - Rusak). Tidak dibocorkan ke publik.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingIntake}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 disabled:opacity-50 transition"
                >
                  {submittingIntake ? "Menyimpan Batch..." : "Simpan Batch Barang Masuk"}
                </button>
              </form>
            </div>

            {/* List Batches Terkini (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Riwayat Batch Barang Masuk</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Produk & Batch</th>
                      <th className="p-2.5">Kesegaran AI</th>
                      <th className="p-2.5">Diterima / Rusak</th>
                      <th className="p-2.5">Layak Jual</th>
                      <th className="p-2.5">Biaya Pokok / Unit</th>
                      <th className="p-2.5">Asal</th>
                      <th className="p-2.5">Paspor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{b.product.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{b.publicId}</div>
                        </td>
                        <td className="p-2.5">
                          {b.freshnessScore ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">
                                🌿 {b.freshnessScore}%
                              </span>
                              {b.inspectionPhoto && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPhotoModal(b.inspectionPhoto || null)}
                                  className="text-slate-400 hover:text-emerald-700 transition"
                                  title="Lihat Foto Inspeksi Visual"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {b.receivedQty} / <span className="text-red-500">{b.initialDamageQty}</span> {b.product.saleUnit}
                        </td>
                        <td className="p-2.5 font-bold text-emerald-800">
                          {b.salableQty} {b.product.saleUnit}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-700">
                          Rp {b.unitCost.toLocaleString("id-ID")}
                        </td>
                        <td className="p-2.5 text-slate-600">{b.origin || "-"}</td>
                        <td className="p-2.5">
                          <Link
                            href={`/produk/${b.product.publicId}`}
                            target="_blank"
                            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Lihat
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA PESANAN (Pipeline & Atomic Movements) */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Daftar Seluruh Pesanan Masuk</h3>
              <span className="text-xs text-slate-400">Total: {orders.length} pesanan</span>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Belum ada pesanan masuk.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{o.customerName}</span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                            {o.publicCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              o.status === "SUBMITTED"
                                ? "bg-amber-100 text-amber-900"
                                : o.status === "ACCEPTED"
                                ? "bg-blue-100 text-blue-900"
                                : o.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Kontak: {o.customerContactPrivate} • Metode: {o.fulfillmentMethod} ({o.requestedTimeText})
                          {o.deliveryAddress && ` • Alamat: ${o.deliveryAddress}`}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-slate-400 text-[10px]">Total Snapshot</div>
                        <div className="text-base font-black text-emerald-800">
                          Rp {o.totalSnapshot.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-1.5">
                      {o.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{item.productName}</span>
                            <span className="text-slate-500 ml-2">
                              {item.actualQty ?? item.requestedQty} {item.unit}
                              {item.actualQty !== null && (
                                <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                  (Hasil timbang)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-700">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions based on state */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      {o.status === "SUBMITTED" && (
                        <button
                          onClick={() => handleAcceptOrder(o.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
                        >
                          Terima & Cadangkan Stok
                        </button>
                      )}

                      {o.status === "ACCEPTED" && (
                        <>
                          <button
                            onClick={() => {
                              setWeighingOrder(o);
                              const initWeighed: { [id: string]: number } = {};
                              o.items.forEach((i) => {
                                initWeighed[i.id] = i.actualQty ?? i.requestedQty;
                              });
                              setWeighedItems(initWeighed);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                          >
                            <Scale className="w-3.5 h-3.5" /> Timbang Aktual
                          </button>

                          <button
                            onClick={() => handleCompleteOrder(o.id)}
                            className="px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-emerald-950 font-bold text-xs"
                          >
                            Selesaikan Transaksi (Potong Fisik)
                          </button>
                        </>
                      )}

                      {["SUBMITTED", "ACCEPTED"].includes(o.status) && (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KATALOG & PASPOR QR */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Katalog Produk & Paspor QR Kios</h3>
                <p className="text-xs text-slate-500">
                  Cetak label QR untuk ditempel di keranjang atau kemasan sayur
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between text-xs space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">
                        {p.totalStock} {p.saleUnit} tersedia
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm mt-2">{p.name}</h4>
                    <div className="text-emerald-800 font-extrabold text-sm mt-1">
                      Rp {p.priceIdr.toLocaleString("id-ID")} / {p.saleUnit}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                    <Link
                      href={`/produk/${p.publicId}`}
                      target="_blank"
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-800 text-white font-semibold text-center hover:bg-emerald-900 flex items-center justify-center gap-1.5 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Paspor & QR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weighing Modal */}
      {weighingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Input Timbangan Aktual</h3>
                <p className="text-[11px] text-slate-500">Pesanan {weighingOrder.publicCode}</p>
              </div>
              <button onClick={() => setWeighingOrder(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {weighingOrder.items.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Diminta: {item.requestedQty} {item.unit} (Rp {item.priceSnapshot.toLocaleString("id-ID")}/{item.unit})
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <label className="text-slate-700 font-semibold">Berat Hasil Timbang:</label>
                    <input
                      type="number"
                      step="any"
                      value={weighedItems[item.id] || ""}
                      onChange={(e) =>
                        setWeighedItems({
                          ...weighedItems,
                          [item.id]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-24 p-1.5 border rounded-lg text-center font-bold bg-white focus:outline-none"
                    />
                    <span className="text-slate-600">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setWeighingOrder(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveWeighedOrder(weighingOrder.id)}
                className="flex-1 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
              >
                Simpan & Update Total
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Inspection Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                Foto Inspeksi Visual Sortasi
              </h4>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedPhotoModal}
              alt="Foto Inspeksi Sayur"
              className="w-full h-56 object-cover rounded-xl border border-slate-100"
            />
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
