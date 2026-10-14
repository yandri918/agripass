"use client";

import React, { useEffect, useState } from "react";
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
  Lock,
  Boxes,
  History,
  Search,
  Filter,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  FileText,
  AlertOctagon,
  Database,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Percent,
  Award,
  Calculator,
  Wallet,
  Store,
  Truck,
  Printer,
} from "lucide-react";
import {
  Batch,
  CommodityPerformance,
  InventoryItem,
  MarginSimulationItem,
  MovementType,
  Order,
  Product,
  ProfitAnalyticsSummary,
  StockMovementWithDetails,
  StockOverview,
  Supplier,
} from "@/lib/data/types";
import { RestockRecommendation, VisualInspectionResponse } from "@/lib/ai/types";
import { useLanguage } from "@/lib/i18n";

export default function SellerDashboardPage() {
  const { t, isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "today" | "analytics" | "stock" | "intake" | "products" | "orders"
  >("today");

  // Seller Authentication Gate (PIN) & Role Protection
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isBuyerSession, setIsBuyerSession] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = sessionStorage.getItem("agripass_role") || localStorage.getItem("agripass_role");
      if (role === "buyer") {
        setIsBuyerSession(true);
        setIsAuthenticated(false);
        sessionStorage.removeItem("agripass_seller_auth");
      } else {
        const auth = sessionStorage.getItem("agripass_seller_auth");
        if (auth === "true") {
          setIsAuthenticated(true);
        }
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleExitBuyerSession = () => {
    if (confirm(t.navExitSessionConfirm)) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("agripass_role");
        localStorage.removeItem("agripass_role");
        sessionStorage.removeItem("agripass_seller_auth");
      }
      setIsBuyerSession(false);
      setIsAuthenticated(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "1234" || pinInput.trim().toLowerCase() === "agripass") {
      setIsAuthenticated(true);
      setPinError(null);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("agripass_seller_auth", "true");
      }
    } else {
      setPinError(t.sellerLoginError);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("agripass_seller_auth");
    }
  };

  // Data States
  const [products, setProducts] = useState<(Product & { totalStock: number })[]>([]);
  const [batches, setBatches] = useState<(Batch & { product: Product; supplier?: Supplier | null })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Management States
  const [stockOverview, setStockOverview] = useState<StockOverview | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovementWithDetails[]>([]);
  const [stockSearch, setStockSearch] = useState<string>("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");
  const [stockSubTab, setStockSubTab] = useState<"inventory" | "movements">("inventory");
  const [expandedBatchProductId, setExpandedBatchProductId] = useState<string | null>(null);

  // Stock Adjustment Modal States
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<InventoryItem | null>(null);
  const [adjustBatchId, setAdjustBatchId] = useState<string>("");
  const [adjustType, setAdjustType] = useState<MovementType>("SPOILAGE_POST");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>("Daun layu / sortasi sore hari");
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // AI Restock Assistant States
  const [isAiRestockOpen, setIsAiRestockOpen] = useState(false);
  const [loadingAiRestock, setLoadingAiRestock] = useState(false);
  const [aiRestockData, setAiRestockData] = useState<RestockRecommendation | null>(null);
  const [copiedShoppingList, setCopiedShoppingList] = useState(false);
  const [dbInfo, setDbInfo] = useState<{
    filePath: string;
    fileSizeKb: number;
    lastModified: string | null;
    counts: { products: number; batches: number; stockMovements: number; orders: number };
  } | null>(null);

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

  // Profit & Commodity Analytics States
  const [analyticsData, setAnalyticsData] = useState<ProfitAnalyticsSummary | null>(null);
  const [commoditySearch, setCommoditySearch] = useState<string>("");
  const [commodityCategoryFilter, setCommodityCategoryFilter] = useState<string>("ALL");
  const [commoditySortBy, setCommoditySortBy] = useState<"revenue" | "profit" | "soldQty" | "margin">("revenue");
  const [customTargetMargin, setCustomTargetMargin] = useState<number>(30);
  const [downloadingCsv, setDownloadingCsv] = useState<boolean>(false);

  const loadAllData = async () => {
    try {
      const [prodRes, batchRes, orderRes, stockRes, dbRes, analyticsRes] = await Promise.all([
        fetch("/api/public/shops/berkah-mandiri/products"),
        fetch("/api/seller/batches"),
        fetch("/api/seller/orders"),
        fetch("/api/seller/stock"),
        fetch("/api/seller/database"),
        fetch("/api/seller/analytics"),
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
      if (stockRes.ok) {
        const d = await stockRes.json();
        setStockOverview(d.overview);
        setInventoryItems(d.items);
        setStockMovements(d.movements);
      }
      if (dbRes.ok) {
        const d = await dbRes.json();
        if (d.success) setDbInfo(d.info);
      }
      if (analyticsRes.ok) {
        const d = await analyticsRes.json();
        if (d.success) setAnalyticsData(d.analytics);
      }
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalyticsCsv = () => {
    if (!analyticsData) return;
    setDownloadingCsv(true);

    try {
      const nowStr = new Date().toISOString().split("T")[0];
      let csv = "\uFEFF"; // UTF-8 BOM for Indonesian Excel compatibility

      // 1. Header & Financial Overview
      csv += "=== LAPORAN ANALITIK KEUNTUNGAN & KOMODITAS TERLARIS AGRIPASS AI ===\r\n";
      csv += `Waktu Cetak,${new Date().toLocaleString("id-ID")}\r\n`;
      csv += `Toko,Kios Sayur Berkah Mandiri\r\n\r\n`;

      csv += "=== RINGKASAN FINANSIAL OPERASIONAL ===\r\n";
      csv += `Total Pesanan Selesai,${analyticsData.totalCompletedOrders} transaksi\r\n`;
      csv += `Total Omset Penjualan,Rp ${analyticsData.totalRevenueIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Total Modal Barang (HPP/COGS),Rp ${analyticsData.totalCogsIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Laba Kotor Bersih,Rp ${analyticsData.totalGrossProfitIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Rata-rata Margin Keuntungan,${analyticsData.averageGrossMarginPercent}%\r\n`;
      csv += `Rata-rata Markup Modal,${analyticsData.averageMarkupPercent}%\r\n`;
      csv += `Rata-rata Belanja per Transaksi (AOV),Rp ${analyticsData.averageOrderValueIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Nilai Modal Aset Sisa Stok,Rp ${analyticsData.totalStockAssetCostIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Potensi Omset Sisa Stok,Rp ${analyticsData.totalPotentialRetailValueIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Proyeksi Potensi Laba Sisa Stok,Rp ${analyticsData.potentialRemainingProfitIdr.toLocaleString("id-ID")}\r\n`;
      csv += `Kerugian Susut & Sortasi,Rp ${analyticsData.totalSpoilageLossCostIdr.toLocaleString("id-ID")} (${analyticsData.totalSpoilageQty} kg/ikat)\r\n\r\n`;

      // 2. Commodities Performance
      csv += "=== PERINGKAT KOMODITAS TERLARIS & MARGIN ===\r\n";
      csv += "Peringkat,Nama Sayuran,Kategori,Satuan,Terjual,Omset (Rp),Modal HPP (Rp),Laba Kotor (Rp),Margin (%),Harga Jual Saat Ini (Rp),Modal Unit (Rp),Kecepatan Perputaran,Sisa Stok di Kios\r\n";

      analyticsData.topCommodities.forEach((c, idx) => {
        csv += `${idx + 1},"${c.name}","${c.category}","${c.saleUnit}",${c.soldQty},${c.revenueIdr},${c.cogsIdr},${c.grossProfitIdr},${c.grossMarginPercent}%,${c.currentPrice},${c.averageUnitCost},"${c.velocity}",${c.stockAvailable}\r\n`;
      });

      // 3. Completed Orders
      csv += "\r\n=== RIWAYAT TRANSAKSI SELESAI TERAKHIR ===\r\n";
      csv += "No Pesanan,Pelanggan,Metode Pengiriman,Waktu Selesai,Rincian Item Sayuran,Omset (Rp),Modal (Rp),Laba Kotor (Rp),Margin (%)\r\n";

      analyticsData.recentCompletedOrders.forEach((o) => {
        csv += `"${o.publicCode}","${o.customerName}","${o.fulfillmentMethod}","${o.completedAt}","${o.itemSummary.replace(/"/g, '""')}",${o.revenueIdr},${o.cogsIdr},${o.profitIdr},${o.marginPercent}%\r\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `agripass-rekap-keuntungan-${nowStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal export CSV:", err);
      alert("Gagal mengunduh file CSV.");
    } finally {
      setDownloadingCsv(false);
    }
  };

  // Stock Management Action Handlers
  const openAdjustModal = (item?: InventoryItem) => {
    const target = item || inventoryItems[0] || null;
    setSelectedAdjustProduct(target);
    setAdjustBatchId("");
    setAdjustType("SPOILAGE_POST");
    setAdjustQuantity(1);
    setAdjustReason("Daun layu / sortasi sore hari");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustProduct || adjustQuantity <= 0) {
      alert("Pilih produk dan masukkan kuantitas yang valid.");
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await fetch("/api/seller/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedAdjustProduct.id,
          batchId: adjustBatchId || undefined,
          type: adjustType,
          quantity: adjustQuantity,
          reason: adjustReason || "Penyesuaian stok oleh penjual",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setIsAdjustModalOpen(false);
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal melakukan penyesuaian stok");
      }
    } catch (err) {
      console.error("Gagal submit adjust stok:", err);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const handleTriggerAiRestock = async () => {
    setLoadingAiRestock(true);
    setIsAiRestockOpen(true);
    try {
      const res = await fetch("/api/seller/stock/ai-restock", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiRestockData(data.recommendation);
      } else {
        alert("Gagal memuat rekomendasi restock AI.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiRestock(false);
    }
  };

  const handleCopyShoppingList = () => {
    if (!aiRestockData?.marketShoppingListText) return;
    navigator.clipboard.writeText(aiRestockData.marketShoppingListText);
    setCopiedShoppingList(true);
    setTimeout(() => setCopiedShoppingList(false), 2500);
  };

  const handleResetDatabase = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mereset database ke data awal seed demo? Semua mutasi stok, batch, dan pesanan baru akan dikembalikan ke kondisi awal."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/seller/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      if (res.ok) {
        alert("Database berhasil direset ke data awal seed!");
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mereset database");
      }
    } catch (err) {
      console.error("Gagal reset database:", err);
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

  // Filtered and Sorted Commodities for Profit Analytics
  const filteredCommodities = (analyticsData?.topCommodities || [])
    .filter((c) => {
      const q = commoditySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchesCat =
        commodityCategoryFilter === "ALL" ||
        c.category.toLowerCase() === commodityCategoryFilter.toLowerCase();
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (commoditySortBy === "profit") return b.grossProfitIdr - a.grossProfitIdr;
      if (commoditySortBy === "soldQty") return b.soldQty - a.soldQty;
      if (commoditySortBy === "margin") return b.grossMarginPercent - a.grossMarginPercent;
      return b.revenueIdr - a.revenueIdr;
    });

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
        Memeriksa sesi penjual...
      </div>
    );
  }

  // 1. BLOKIR AKSES TOTAL JIKA PENGGUNA BERADA DALAM SESI TOKO PEMBELI
  if (isBuyerSession) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white rounded-3xl border-2 border-red-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner border border-red-200">
            <Lock className="w-10 h-10 animate-pulse text-red-600" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider border border-red-300">
              <Lock className="w-3.5 h-3.5" /> {isEn ? "Role Separation Active" : "Proteksi Peran Terpisah Aktif"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.sellerAccessBlockedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {t.sellerAccessBlockedDesc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>🔒</span> {isEn ? "AgriPass Security & Privacy Policy:" : "Kebijakan Privasi & Keamanan AgriPass:"}
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-amber-800/90 text-[11px]">
              <li>
                <strong>{t.sellerBlockedHppTitle}:</strong> {t.sellerBlockedHppDesc}
              </li>
              <li>
                <strong>{t.sellerBlockedAuditTitle}:</strong> {t.sellerBlockedAuditDesc}
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/toko/berkah-mandiri"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.sellerBackToStoreBtn}</span>
            </Link>

            <button
              type="button"
              onClick={handleExitBuyerSession}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <span>{t.sellerExitBuyerBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. OTENTIKASI PIN JIKA BUKAN PEMBELI TAPI BELUM LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.sellerLoginTitle}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {t.sellerLoginDesc}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder={t.sellerPinPlaceholder}
                className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition"
            >
              {t.sellerLoginBtn}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100">
              💡 <strong>{isEn ? "Demo Hint:" : "Petunjuk Hackathon / Demo:"}</strong> {t.sellerDemoPinHint}
            </div>

            <Link
              href="/toko/berkah-mandiri"
              className="text-slate-500 hover:text-emerald-700 underline font-medium pt-1"
            >
              {isEn ? "I'm a Customer → Return to Produce Catalog" : "Saya Pembeli → Kembali ke Katalog Belanja Sayur"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 pt-6 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-xs text-lime-300 font-medium mb-1.5">
              {isEn ? "Operational Dashboard" : "Dashboard Operasional"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{isEn ? "Berkah Mandiri Produce Stall" : "Kios Sayur Berkah Mandiri"}</h1>
            <p className="text-xs text-emerald-300/80 mt-1">
              {isEn ? "Produce batch logging, unit cost calculation, stock reservation & AI draft orders." : "Pencatatan batch masuk, kalkulasi biaya pokok, reservasi stok & draf pesanan AI."}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-[11px] font-semibold text-lime-300 border border-emerald-700/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                {isEn ? "Crash-Proof DB: Active" : "Database Anti-Hilang: Aktif"} ({dbInfo?.fileSizeKb ?? 34} KB)
              </span>
              <span className="text-[11px] text-emerald-300/80">
                {isEn ? `Atomic disk storage • ${dbInfo?.counts.stockMovements ?? stockMovements.length} records saved` : `Disk storage atomik • ${dbInfo?.counts.stockMovements ?? stockMovements.length} mutasi tersimpan`}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/80 hover:bg-red-900/60 text-xs font-semibold text-emerald-200 hover:text-red-200 border border-emerald-700/60 transition"
              title={isEn ? "Lock operational dashboard" : "Kunci dashboard operasional"}
            >
              <Lock className="w-3.5 h-3.5" /> {isEn ? "Lock" : "Kunci"}
            </button>
            <button
              onClick={loadAllData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-xs font-semibold text-emerald-200 border border-emerald-700/60 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <Link
              href="/toko/berkah-mandiri?mode=seller_preview"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-400 text-emerald-950 text-xs font-bold hover:bg-lime-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> {isEn ? "Open Public Catalog" : "Buka Katalog Publik"}
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
            {isEn ? "Today" : "Hari Ini"}
            {submittedOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-lime-500 text-emerald-950 text-[10px] font-black flex items-center justify-center">
                {submittedOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "analytics"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            {isEn ? "Analytics & Margin" : "Analitik & Margin"}
            {analyticsData && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black">
                {analyticsData.averageGrossMarginPercent}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className={`py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === "stock"
                ? "border-emerald-800 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Boxes className="w-4 h-4" />
            {isEn ? "Inventory Management" : "Manajemen Stok"}
            {((stockOverview?.outOfStockCount || 0) + (stockOverview?.lowStockCount || 0)) > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {(stockOverview?.outOfStockCount || 0) + (stockOverview?.lowStockCount || 0)}
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
            {isEn ? "Intake & Costs" : "Barang Masuk & Biaya"}
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
            {isEn ? `Manage Orders (${orders.length})` : `Kelola Pesanan (${orders.length})`}
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
            {isEn ? `Catalog & QR (${products.length})` : `Katalog & Paspor QR (${products.length})`}
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

              <div
                onClick={() => setActiveTab("stock")}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow-md transition"
              >
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Stok Kritis / Menipis</span>
                  <Boxes className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {(stockOverview?.outOfStockCount || 0) + (stockOverview?.lowStockCount || 0)} sayuran
                </div>
                <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                  <span>Kelola di Manajemen Stok</span> &rarr;
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400">Penjualan Selesai</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  Rp {totalRevenueCompleted.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{completedOrders.length} transaksi</div>
              </div>
            </div>

            {/* Profit & Margin Highlights Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/90 text-lime-300 text-[10px] font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> RINGKASAN PROFITABILITAS & MARGIN
                </div>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <div className="text-xl sm:text-2xl font-black text-lime-300">
                    Laba Kotor: Rp {(analyticsData?.totalGrossProfitIdr || 0).toLocaleString("id-ID")}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-100 border border-emerald-700">
                    Margin: {analyticsData?.averageGrossMarginPercent || 0}%
                  </span>
                  <span className="text-xs text-slate-300">
                    (Omset: Rp {(analyticsData?.totalRevenueIdr || 0).toLocaleString("id-ID")} • Modal HPP: Rp {(analyticsData?.totalCogsIdr || 0).toLocaleString("id-ID")})
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90">
                  Potensi laba sisa stok di kios: <strong className="text-white">Rp {(analyticsData?.potentialRemainingProfitIdr || 0).toLocaleString("id-ID")}</strong> ({analyticsData?.potentialRemainingMarginPercent || 0}% potensi margin jika terjual)
                </p>
              </div>
              <button
                onClick={() => setActiveTab("analytics")}
                className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-black text-xs shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4" /> Buka Laporan Analitik & Komoditas &rarr;
              </button>
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

        {/* TAB: ANALITIK PROFITABILITAS, MARGIN & KOMODITAS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Header / Intro Action Card */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-lime-300 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> AGRI-FINANCE ENGINE • BLUEPRINT PASAR RAKYAT
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Laporan Laba Kotor, Margin & Komoditas Terlaris
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
                  Pantau kesehatan finansial kios secara transparan: evaluasi modal HPP aktual (COGS), hitung kerugian susut sortasi fisik, ketahui sayuran paling menguntungkan, dan simulasikan harga jual optimal.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <button
                  onClick={handleExportAnalyticsCsv}
                  disabled={downloadingCsv || !analyticsData}
                  className="px-4 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                  title="Unduh seluruh rekap keuangan, margin dan komoditas ke file CSV Excel"
                >
                  <Download className="w-4 h-4 text-emerald-950" />
                  <span>{downloadingCsv ? "Menyiapkan File..." : "Unduh Rekap Excel (CSV)"}</span>
                </button>

                <button
                  onClick={loadAllData}
                  className="px-3.5 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-700/70 transition flex items-center justify-center gap-1.5"
                  title="Sinkronisasi kalkulasi mutasi dan transaksi terbaru"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-lime-400" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* 4 Core Financial KPI Scorecards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Omset (Revenue) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Omset Penjualan</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-950 mt-2">
                  Rp {(analyticsData?.totalRevenueIdr || 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span className="font-bold text-slate-700">{analyticsData?.totalCompletedOrders || 0}</span> transaksi selesai ({analyticsData?.pickupOrdersCount || 0} kios • {analyticsData?.deliveryOrdersCount || 0} antar)
                </div>
              </div>

              {/* 2. Total Modal Barang Terjual (COGS / HPP) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Modal HPP (COGS)</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-800 mt-2">
                  Rp {(analyticsData?.totalCogsIdr || 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Modal beli petani + ongkir per unit riil
                </div>
              </div>

              {/* 3. Laba Kotor Bersih (Gross Profit) */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 shadow-sm relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/30">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span className="font-bold">Laba Kotor Bersih</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  Rp {(analyticsData?.totalGrossProfitIdr || 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black">
                    +{analyticsData?.averageMarkupPercent || 0}%
                  </span>
                  <span>Rata-rata Markup Modal</span>
                </div>
              </div>

              {/* 4. Margin Keuntungan & Nilai Keranjang (AOV) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Rata-rata Gross Margin</span>
                  <div className="w-7 h-7 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-900 mt-2 flex items-baseline gap-1">
                  <span>{analyticsData?.averageGrossMarginPercent || 0}%</span>
                  <span className="text-xs font-normal text-slate-400">dari omset</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Rata-rata Belanja: <strong className="text-slate-700">Rp {(analyticsData?.averageOrderValueIdr || 0).toLocaleString("id-ID")}</strong>
                </div>
              </div>
            </div>

            {/* Sub-KPI: Valuasi Sisa Stok vs Dampak Kerugian Susut Sortasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Valuasi Stok & Potensi Laba Tersisa */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Valuasi & Proyeksi Sisa Stok di Kios</h3>
                      <p className="text-[11px] text-slate-500">Nilai modal aset dan potensi keuntungan dari stok sayur saat ini</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {analyticsData?.totalPhysicalStockQty || 0} kg/ikat tersedia
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-semibold text-slate-400 block">Modal Aset Fisik</span>
                    <span className="font-black text-slate-800 text-xs sm:text-sm block mt-0.5">
                      Rp {(analyticsData?.totalStockAssetCostIdr || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-semibold text-slate-400 block">Potensi Omset Ritel</span>
                    <span className="font-black text-slate-800 text-xs sm:text-sm block mt-0.5">
                      Rp {(analyticsData?.totalPotentialRetailValueIdr || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 block">Potensi Laba Kotor</span>
                    <span className="font-black text-emerald-700 text-xs sm:text-sm block mt-0.5">
                      Rp {(analyticsData?.potentialRemainingProfitIdr || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
                      ({analyticsData?.potentialRemainingMarginPercent || 0}% margin)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dampak Finansial Susut Timbangan & Sortasi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Kerugian Finansial Susut & Sortasi (Waste)</h3>
                      <p className="text-[11px] text-slate-500">Nilai modal barang yang hilang akibat sortasi subuh dan kelayuan daun</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                    Audit HPP Hangus
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-red-50/60 border border-red-100">
                    <span className="text-[10px] font-semibold text-red-700 block">Total Kerugian Modal HPP</span>
                    <span className="font-black text-red-600 text-sm sm:text-base block mt-0.5">
                      Rp {(analyticsData?.totalSpoilageLossCostIdr || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] text-red-700 block mt-0.5">Beban modal hilang tidak tertagih</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-semibold text-slate-400 block">Volume Sayur Terbuang</span>
                    <span className="font-black text-slate-800 text-sm sm:text-base block mt-0.5">
                      {analyticsData?.totalSpoilageQty || 0} <span className="text-xs font-normal text-slate-500">kg/ikat</span>
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Daun busuk, akar tanah, & sortasi awal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peringkat Komoditas Terlaris & Margin (Top Commodities Performance Table) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-slate-900 text-base">
                      Peringkat Performa Komoditas Sayuran
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluasi omset, laba kotor, margin %, dan kecepatan perputaran (velocity) tiap komoditas sayur.
                  </p>
                </div>

                {/* Filter and Search Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama sayuran..."
                      value={commoditySearch}
                      onChange={(e) => setCommoditySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white w-40 sm:w-48 transition"
                    />
                  </div>

                  <select
                    value={commodityCategoryFilter}
                    onChange={(e) => setCommodityCategoryFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-600 text-slate-700 font-medium"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Sayuran Daun">Sayuran Daun</option>
                    <option value="Sayuran Buah">Sayuran Buah</option>
                    <option value="Bumbu Dapur">Bumbu Dapur</option>
                    <option value="Umbi-umbian">Umbi-umbian</option>
                  </select>

                  <select
                    value={commoditySortBy}
                    onChange={(e: any) => setCommoditySortBy(e.target.value)}
                    className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-600 text-slate-700 font-semibold"
                  >
                    <option value="revenue">Urutkan: Omset Tertinggi</option>
                    <option value="profit">Urutkan: Laba Tertinggi</option>
                    <option value="soldQty">Urutkan: Terjual Terbanyak</option>
                    <option value="margin">Urutkan: Margin % Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Peringkat & Sayuran</th>
                      <th className="py-3 px-3">Rotasi</th>
                      <th className="py-3 px-3 text-right">Terjual</th>
                      <th className="py-3 px-3 text-right">Omset (Rp)</th>
                      <th className="py-3 px-3 text-right">Modal HPP (Rp)</th>
                      <th className="py-3 px-3 text-right">Laba Kotor</th>
                      <th className="py-3 px-3 text-right">Margin (%)</th>
                      <th className="py-3 px-4 text-center">Sisa Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCommodities.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Tidak ada data komoditas yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredCommodities.map((item, idx) => {
                        const rank = idx + 1;
                        return (
                          <tr key={item.productId} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                    rank === 1
                                      ? "bg-amber-400 text-amber-950 shadow-xs"
                                      : rank === 2
                                      ? "bg-slate-300 text-slate-800"
                                      : rank === 3
                                      ? "bg-amber-200 text-amber-900"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {rank}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 block">{item.name}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {item.category} • Rp {item.currentPrice.toLocaleString("id-ID")} / {item.saleUnit}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              {item.velocity === "FAST" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  ⚡ Fast Moving
                                </span>
                              )}
                              {item.velocity === "MODERATE" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                                  🔄 Sedang
                                </span>
                              )}
                              {item.velocity === "SLOW" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                  ⏳ Slow Moving
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right font-semibold text-slate-800">
                              {item.soldQty} <span className="text-[10px] font-normal text-slate-500">{item.saleUnit}</span>
                            </td>

                            <td className="py-3 px-3 text-right font-bold text-slate-900">
                              Rp {item.revenueIdr.toLocaleString("id-ID")}
                            </td>

                            <td className="py-3 px-3 text-right text-slate-600">
                              <div>Rp {item.cogsIdr.toLocaleString("id-ID")}</div>
                              <div className="text-[10px] text-slate-400">HPP ~Rp {item.averageUnitCost.toLocaleString("id-ID")}</div>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <span className="font-black text-emerald-700">
                                Rp {item.grossProfitIdr.toLocaleString("id-ID")}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <span
                                  className={`px-2 py-0.5 rounded font-black text-[11px] ${
                                    item.grossMarginPercent >= 30
                                      ? "bg-emerald-100 text-emerald-900"
                                      : item.grossMarginPercent >= 20
                                      ? "bg-lime-100 text-lime-900"
                                      : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  {item.grossMarginPercent}%
                                </span>
                              </div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                Markup: +{item.markupPercent}%
                              </div>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-slate-800 text-xs">
                                  {item.stockAvailable} {item.saleUnit}
                                </span>
                                {item.stockStatus === "OUT" && (
                                  <span className="text-[9px] font-bold text-red-600 uppercase">Habis</span>
                                )}
                                {item.stockStatus === "LOW" && (
                                  <span className="text-[9px] font-bold text-amber-600 uppercase">Menipis</span>
                                )}
                                {item.stockStatus === "SAFE" && (
                                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Aman</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Target Margin Pricing Simulator (Blueprint Section 10.2) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>SIMULATOR PENETAPAN HARGA JUAL RITEL</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Kalkulator Margin Target Berdasarkan HPP Masuk
                  </h3>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Pedagang pasar tradisional sering kesulitan menentukan harga jual agar tidak boncos setelah dipotong susut timbangan.
                    Tentukan target margin yang diinginkan untuk menghitung rekomendasi harga jual (dibulatkan ke kelipatan Rp 500 terdekat).
                  </p>
                </div>

                {/* Target Margin Slider / Quick Select Buttons */}
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950">Target Margin:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-800 text-lime-300 font-black text-xs">
                      {customTargetMargin}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[20, 25, 30, 35, 40].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setCustomTargetMargin(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          customTargetMargin === pct
                            ? "bg-emerald-800 text-white shadow-xs"
                            : "bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(analyticsData?.marginSimulations || []).map((sim) => {
                  const targetM = customTargetMargin / 100;
                  const suggestedPrice = Math.ceil((sim.unitCost / (1 - targetM)) / 500) * 500;
                  const diffFromCurrent = suggestedPrice - sim.currentPrice;
                  const potentialProfitPerUnit = suggestedPrice - sim.unitCost;

                  return (
                    <div
                      key={sim.productId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sim.productName}</h4>
                          <span className="text-[10px] text-slate-500">
                            Modal HPP: <strong className="text-slate-800">Rp {sim.unitCost.toLocaleString("id-ID")}</strong> / {sim.saleUnit}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            sim.currentMarginPercent >= 30
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Aktif: {sim.currentMarginPercent}%
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600 text-[11px]">
                          <span>Harga Jual Saat Ini:</span>
                          <span className="font-semibold text-slate-900">
                            Rp {sim.currentPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-900 font-bold pt-1 border-t border-slate-100">
                          <span>Saran Harga ({customTargetMargin}%):</span>
                          <span className="text-sm font-black text-emerald-800">
                            Rp {suggestedPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>
                          Potensi Laba: <strong className="text-emerald-700 font-bold">Rp {potentialProfitPerUnit.toLocaleString("id-ID")}</strong>
                        </span>
                        {diffFromCurrent > 0 ? (
                          <span className="text-amber-700 font-bold flex items-center gap-0.5 text-[10px]">
                            <ArrowUpRight className="w-3 h-3" /> +Rp {diffFromCurrent.toLocaleString("id-ID")}
                          </span>
                        ) : diffFromCurrent < 0 ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[10px]">
                            <ArrowDownRight className="w-3 h-3" /> -Rp {Math.abs(diffFromCurrent).toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[10px]">Sudah Sesuai</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Riwayat Transaksi Selesai & Audit Margin Per Order */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-800" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Audit Margin Transaksi Selesai Terakhir
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rincian omset, modal HPP alokasi batch, dan laba kotor tiap pesanan pelanggan yang telah selesai.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {analyticsData?.recentCompletedOrders.length || 0} transaksi ditampilkan
                </span>
              </div>

              <div className="space-y-2.5">
                {(analyticsData?.recentCompletedOrders || []).map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          {ord.publicCode}
                        </span>
                        <span className="font-bold text-slate-900">{ord.customerName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                          {ord.fulfillmentMethod === "PICKUP" ? "Ambil di Kios" : "Kurir Antar"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-md">
                        {ord.itemSummary}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Waktu selesai: {new Date(ord.completedAt).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Omset / HPP</span>
                        <span className="font-bold text-slate-900 text-xs block">
                          Rp {ord.revenueIdr.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Modal: Rp {ord.cogsIdr.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-right min-w-[100px]">
                        <span className="text-[10px] font-bold text-emerald-800 block">Laba Kotor</span>
                        <span className="font-black text-emerald-700 text-xs sm:text-sm block">
                          Rp {ord.profitIdr.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] font-extrabold text-emerald-900 block">
                          Margin: {ord.marginPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAJEMEN STOK */}
        {activeTab === "stock" && (
          <div className="space-y-6">
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Stok Fisik di Kios */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Stok Fisik di Kios</span>
                  <Boxes className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  {stockOverview?.totalPhysicalQty ?? 0}{" "}
                  <span className="text-xs font-bold text-slate-500">kg/ikat</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Modal Aset: <span className="font-semibold text-slate-700">Rp {(stockOverview?.totalStockValueIdr ?? 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* 2. Stok Tersedia Bersih */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Tersedia Siap Jual</span>
                  <CheckCircle className="w-4 h-4 text-lime-600" />
                </div>
                <div className="text-2xl font-black text-lime-700 mt-1">
                  {stockOverview?.totalAvailableQty ?? 0}{" "}
                  <span className="text-xs font-bold text-slate-500">kg/ikat</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Dicadangkan: <span className="font-semibold text-slate-700">{stockOverview?.totalReservedQty ?? 0}</span> di pesanan
                </div>
              </div>

              {/* 3. Peringatan Stok Kritis & Habis */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Stok Perlu Kulakan</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {(stockOverview?.outOfStockCount ?? 0) + (stockOverview?.lowStockCount ?? 0)}{" "}
                  <span className="text-xs font-bold text-slate-500">SKU</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  <span className="text-red-600 font-bold">{stockOverview?.outOfStockCount ?? 0} Habis</span> • {stockOverview?.lowStockCount ?? 0} Menipis
                </div>
              </div>

              {/* 4. Total Susut & Sortasi (Waste) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Total Susut / Waste</span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-black text-red-600 mt-1">
                  {stockOverview?.totalSpoilageQty ?? 0}{" "}
                  <span className="text-xs font-bold text-slate-500">kg/ikat</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Sortasi awal & kelayuan fisik
                </div>
              </div>
            </div>

            {/* Database Persistence Engine Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Database Penyimpanan Stok Terpusat (Crash-Safe Disk Storage)
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Anti-Hilang Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Setiap mutasi stok, batch panen, dan transaksi pesanan disimpan otomatis ke disk storage secara atomik. Data tidak akan hilang saat server restart.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/api/seller/database/backup"
                    download
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition"
                    title="Download snapshot database utuh dalam format JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup JSON</span>
                  </a>

                  <button
                    onClick={handleResetDatabase}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold border border-slate-200 transition"
                    title="Reset ke data awal seed (demo)"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>

              {/* Database Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Status File Database</span>
                  <span className="font-bold text-slate-800 text-xs truncate block font-mono">
                    data/agripass-database.json
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Ukuran: {dbInfo?.fileSizeKb ?? 34} KB
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Riwayat Audit Mutasi</span>
                  <span className="font-bold text-slate-800 text-xs block">
                    {dbInfo?.counts.stockMovements ?? stockMovements.length} transaksi mutasi
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Masuk, susut, sortir, jual
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Batch Panen Tersimpan</span>
                  <span className="font-bold text-slate-800 text-xs block">
                    {dbInfo?.counts.batches ?? batches.length} batch aktif
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Lengkap foto QC & modal
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Penyimpanan Terakhir</span>
                  <span className="font-bold text-slate-800 text-xs block truncate">
                    {dbInfo?.lastModified ? new Date(dbInfo.lastModified).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Real-time"}
                  </span>
                  <span className="text-[10px] text-lime-700 font-semibold">
                    Auto-save tiap mutasi
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Action Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-emerald-800/80">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-[11px] text-lime-300 font-bold mb-1.5">
                  <Sparkles className="w-3 h-3" /> Asisten Pintar Kios Sayur
                </div>
                <h3 className="font-black text-lg">Pusat Kontrol & Rotasi Stok Sayuran</h3>
                <p className="text-xs text-emerald-200/80 mt-0.5 max-w-xl">
                  Pantau stok fisik real-time, audit rotasi FIFO untuk mencegah kelayuan daun, dan catat susut timbangan harian dalam 1 kali klik.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => openAdjustModal()}
                  className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-slate-100 text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+ Penyesuaian / Catat Susut</span>
                </button>

                <button
                  onClick={handleTriggerAiRestock}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-900" />
                  <span>AI Rekomendasi Restock</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Inventori vs Mutasi */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setStockSubTab("inventory")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  stockSubTab === "inventory"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Daftar Inventori Sayur ({inventoryItems.length})</span>
              </button>

              <button
                onClick={() => setStockSubTab("movements")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  stockSubTab === "movements"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Kartu Stok & Audit Mutasi ({stockMovements.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: DAFTAR INVENTORI SAYUR */}
            {stockSubTab === "inventory" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      placeholder="Cari sayuran, cabai, bumbu..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={stockCategoryFilter}
                      onChange={(e) => setStockCategoryFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">Semua Kategori</option>
                      <option value="Sayuran Daun">Sayuran Daun</option>
                      <option value="Buah & Tomat">Buah & Tomat</option>
                      <option value="Cabai">Cabai</option>
                      <option value="Bumbu & Umbi">Bumbu & Umbi</option>
                      <option value="Polong">Polong</option>
                    </select>

                    <select
                      value={stockStatusFilter}
                      onChange={(e) => setStockStatusFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="SAFE">Stok Aman (&gt;10)</option>
                      <option value="LOW">Stok Menipis (≤10)</option>
                      <option value="OUT">Stok Habis (0)</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Komoditas / Sayur</th>
                        <th className="pb-3 text-right">Stok Fisik</th>
                        <th className="pb-3 text-right">Dicadangkan</th>
                        <th className="pb-3 text-right">Tersedia</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3">Batch & FIFO</th>
                        <th className="pb-3 text-right">Nilai Modal</th>
                        <th className="pb-3 pr-2 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryItems
                        .filter((item) => {
                          if (stockSearch) {
                            const q = stockSearch.toLowerCase();
                            const matchName = item.name.toLowerCase().includes(q);
                            const matchAlias = item.aliases?.toLowerCase().includes(q);
                            const matchCat = item.category?.toLowerCase().includes(q);
                            if (!matchName && !matchAlias && !matchCat) return false;
                          }
                          if (stockCategoryFilter !== "ALL" && !item.category.includes(stockCategoryFilter)) {
                            return false;
                          }
                          if (stockStatusFilter !== "ALL" && item.status !== stockStatusFilter) {
                            return false;
                          }
                          return true;
                        })
                        .map((item) => {
                          const isExpanded = expandedBatchProductId === item.id;
                          const isAgingLeaf =
                            item.category.toLowerCase().includes("daun") &&
                            item.oldestBatchAgeHours !== null &&
                            item.oldestBatchAgeHours >= 12;

                          return (
                            <React.Fragment key={item.id}>
                              <tr className="hover:bg-slate-50/80 transition">
                                <td className="py-3 pl-2">
                                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    {isAgingLeaf && (
                                      <span
                                        title="Sayuran daun sudah disimpan lebih dari 12 jam, pantau kesegarannya"
                                        className="text-amber-500 cursor-help"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span>Rp {item.priceIdr.toLocaleString("id-ID")}/{item.saleUnit}</span>
                                  </div>
                                </td>

                                <td className="py-3 text-right">
                                  <span className="font-black text-slate-900 text-sm">
                                    {item.physicalQty}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-1">{item.saleUnit}</span>
                                </td>

                                <td className="py-3 text-right">
                                  {item.reservedQty > 0 ? (
                                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                      {item.reservedQty} {item.saleUnit}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                <td className="py-3 text-right">
                                  <span
                                    className={`font-black text-sm ${
                                      item.availableQty === 0
                                        ? "text-red-600"
                                        : item.availableQty <= 10
                                        ? "text-amber-600"
                                        : "text-emerald-800"
                                    }`}
                                  >
                                    {item.availableQty}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-1">{item.saleUnit}</span>
                                </td>

                                <td className="py-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.status === "SAFE"
                                        ? "bg-emerald-100 text-emerald-900"
                                        : item.status === "LOW"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-red-100 text-red-900"
                                    }`}
                                  >
                                    {item.status === "SAFE" ? "Aman" : item.status === "LOW" ? "Menipis" : "Habis"}
                                  </span>
                                </td>

                                <td className="py-3">
                                  <div className="text-slate-700 font-medium">
                                    {item.activeBatchCount > 0 ? (
                                      <span>
                                        {item.activeBatchCount} batch •{" "}
                                        <span className={isAgingLeaf ? "text-amber-600 font-bold" : "text-slate-500"}>
                                          {item.oldestBatchAgeHours ?? 0}j di kios
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic">Tidak ada batch</span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 text-right text-slate-700 font-semibold">
                                  Rp {item.stockValueIdr.toLocaleString("id-ID")}
                                </td>

                                <td className="py-3 pr-2 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openAdjustModal(item)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition"
                                      title="Koreksi stok atau catat susut"
                                    >
                                      ± Susut/Opname
                                    </button>

                                    {item.batches.length > 0 && (
                                      <button
                                        onClick={() =>
                                          setExpandedBatchProductId(isExpanded ? null : item.id)
                                        }
                                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                                        title="Lihat rincian batch & paspor"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Accordion Batch Details */}
                              {isExpanded && (
                                <tr className="bg-slate-50/70 border-b border-slate-200">
                                  <td colSpan={8} className="p-3 pl-6 pr-4">
                                    <div className="space-y-2">
                                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>Rincian Batch Aktif untuk {item.name}:</span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {item.batches.map((b) => (
                                          <div
                                            key={b.id}
                                            className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                                          >
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-bold text-emerald-950">
                                                  {b.publicId}
                                                </span>
                                                {b.freshnessGrade && (
                                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                                    Grade: {b.freshnessGrade} ({b.freshnessScore}%)
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-[11px] text-slate-500">
                                                Asal: {b.origin || "Kebun Mitra"} • Masuk: {new Date(b.receivedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                                              </div>
                                              <div className="text-[10px] text-slate-400">
                                                Modal: Rp {b.unitCost.toLocaleString("id-ID")}/{item.saleUnit}
                                              </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1">
                                              <div className="font-bold text-emerald-800">
                                                {b.salableQty} {item.saleUnit}
                                              </div>
                                              {b.inspectionPhoto && (
                                                <button
                                                  onClick={() => setSelectedPhotoModal(b.inspectionPhoto || null)}
                                                  className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                                                >
                                                  <Camera className="w-3 h-3" /> Foto AI
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: KARTU STOK & AUDIT MUTASI */}
            {stockSubTab === "movements" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Audit Trail Pergerakan Stok (Kartu Stok)</h4>
                    <p className="text-xs text-slate-500">
                      Seluruh mutasi keluar-masuk barang, susut sortir, dan penjualan tercatat secara transparan.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {stockMovements.length} mutasi tercatat
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Waktu</th>
                        <th className="pb-3">Komoditas & Batch</th>
                        <th className="pb-3">Tipe Mutasi</th>
                        <th className="pb-3 text-right">Perubahan Qty</th>
                        <th className="pb-3 pl-4">Alasan / Catatan</th>
                        <th className="pb-3 text-right pr-2">Aktor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockMovements.map((mov) => {
                        const isPositive = mov.quantity > 0;
                        return (
                          <tr key={mov.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 pl-2 text-slate-500 whitespace-nowrap">
                              {new Date(mov.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                              ,{" "}
                              {new Date(mov.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td className="py-3">
                              <div className="font-bold text-slate-900">{mov.productName}</div>
                              <div className="text-[10px] font-mono text-slate-400">{mov.batchPublicId}</div>
                            </td>

                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  mov.type === "INTAKE"
                                    ? "bg-emerald-100 text-emerald-900"
                                    : mov.type === "SPOILAGE_INITIAL"
                                    ? "bg-amber-100 text-amber-900"
                                    : mov.type === "SPOILAGE_POST"
                                    ? "bg-red-100 text-red-900"
                                    : mov.type === "SALE"
                                    ? "bg-blue-100 text-blue-900"
                                    : mov.type === "RETURN"
                                    ? "bg-purple-100 text-purple-900"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {mov.type === "INTAKE"
                                  ? "+ Penerimaan"
                                  : mov.type === "SPOILAGE_INITIAL"
                                  ? "- Susut Awal"
                                  : mov.type === "SPOILAGE_POST"
                                  ? "- Susut Layu (Waste)"
                                  : mov.type === "SALE"
                                  ? "- Penjualan"
                                  : mov.type === "RETURN"
                                  ? "- Retur"
                                  : "± Koreksi Opname"}
                              </span>
                            </td>

                            <td className="py-3 text-right">
                              <span
                                className={`font-black text-sm ${
                                  isPositive ? "text-emerald-700" : "text-red-600"
                                }`}
                              >
                                {isPositive ? `+${mov.quantity}` : mov.quantity}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">{mov.saleUnit}</span>
                            </td>

                            <td className="py-3 pl-4 text-slate-600 max-w-xs">
                              {mov.reason}
                              {mov.orderId && (
                                <span className="text-[10px] text-blue-600 font-mono ml-1.5">
                                  ({mov.orderId})
                                </span>
                              )}
                            </td>

                            <td className="py-3 text-right pr-2 text-slate-400 font-mono text-[10px]">
                              {mov.actorId || "sistem"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BARANG MASUK & KALKULATOR BIAYA */}
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

      {/* Stock Adjustment & Spoilage Modal */}
      {isAdjustModalOpen && selectedAdjustProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-800" />
                  <span>Penyesuaian Stok & Catat Susut</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Catat sayuran layu, selisih timbangan display, atau opname fisik.
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs">
              {/* Product Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Komoditas / Sayur:
                </label>
                <select
                  value={selectedAdjustProduct.id}
                  onChange={(e) => {
                    const item = inventoryItems.find((i) => i.id === e.target.value);
                    if (item) {
                      setSelectedAdjustProduct(item);
                      setAdjustBatchId("");
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-emerald-600"
                >
                  {inventoryItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stok Fisik: {i.physicalQty} {i.saleUnit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Selection (Optional) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Batch Target:
                </label>
                <select
                  value={adjustBatchId}
                  onChange={(e) => setAdjustBatchId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-emerald-600 text-slate-600"
                >
                  <option value="">Otomatis Batch Tertua (Rotasi FIFO)</option>
                  {selectedAdjustProduct.batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.publicId} ({b.salableQty} {selectedAdjustProduct.saleUnit} • {b.origin || "Kebun Mitra"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Type Cards */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Jenis Penyesuaian:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("SPOILAGE_POST");
                      setAdjustReason("Daun layu / sortasi sore hari");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      adjustType === "SPOILAGE_POST"
                        ? "border-red-500 bg-red-50/70 text-red-950 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">🍂</span>
                    <div>
                      <div className="font-bold">Susut Layu (Waste)</div>
                      <div className="text-[10px] text-slate-500">Mengurangi stok toko</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("CORRECTION");
                      setAdjustReason("Selisih hitung opname fisik");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      adjustType === "CORRECTION"
                        ? "border-blue-500 bg-blue-50/70 text-blue-950 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">⚖️</span>
                    <div>
                      <div className="font-bold">Koreksi Opname</div>
                      <div className="text-[10px] text-slate-500">Selisih timbang / stok fisik</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("INTAKE");
                      setAdjustReason("Bonus pasokan dari petani/pemasok");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      adjustType === "INTAKE"
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">📦</span>
                    <div>
                      <div className="font-bold">Tambah Manual</div>
                      <div className="text-[10px] text-slate-500">Menambah stok fisik</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("RETURN");
                      setAdjustReason("Retur barang rusak ke pemasok");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                      adjustType === "RETURN"
                        ? "border-purple-500 bg-purple-50/70 text-purple-950 font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">↩️</span>
                    <div>
                      <div className="font-bold">Retur ke Pemasok</div>
                      <div className="text-[10px] text-slate-500">Kembalikan ke tengkulak</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">
                    Jumlah {adjustType === "SPOILAGE_POST" || adjustType === "RETURN" ? "yang Dikurangi" : "Penyesuaian"}:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Stok saat ini: <strong className="text-slate-900">{selectedAdjustProduct.physicalQty} {selectedAdjustProduct.saleUnit}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <span className="px-3 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-700">
                    {selectedAdjustProduct.saleUnit}
                  </span>
                </div>
              </div>

              {/* Quick Preset Reason Chips */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pilihan Alasan Cepat:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Daun layu / sortasi sore",
                    "Daun menguning",
                    "Selisih timbang display",
                    "Busuk / cacat fisik",
                    "Bonus dari petani",
                    "Sortasi ulang kebersihan",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustReason(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                        adjustReason === preset
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Keterangan / Alasan Lengkap:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Contoh: Daun luar menguning terbuang saat display sore"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-md disabled:opacity-50 text-center"
                >
                  {submittingAdjust ? "Menyimpan..." : "Simpan Penyesuaian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Restock & Freshness Modal */}
      {isAiRestockOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Asisten AI: Rekomendasi Restock & Umur Simpan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Analisis data inventori cerdas untuk persiapan belanja pasar induk subuh besok.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiRestockOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAiRestock ? (
              <div className="py-16 text-center space-y-3">
                <div className="inline-block animate-spin text-emerald-800">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Gemini AI sedang menganalisis 18 SKU sayur, stok kritis, dan usia batch...
                </div>
                <div className="text-[11px] text-slate-400">
                  Menyusun daftar belanja pasar subuh optimal dan saran mitigasi kelayuan.
                </div>
              </div>
            ) : aiRestockData ? (
              <div className="space-y-4 text-xs">
                {/* AI Executive Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-lime-300 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ringkasan Eksekutif Analisis Kios</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    {aiRestockData.summary}
                  </p>
                </div>

                {/* Urgent Restock List */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-xs flex items-center justify-between">
                    <span>Daftar Prioritas Belanja Pasar Subuh</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {aiRestockData.urgentRestock.length} komoditas dianjurkan
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiRestockData.urgentRestock.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{item.productName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              item.urgency === "KRITIS"
                                ? "bg-red-100 text-red-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Sisa saat ini: <strong>{item.currentStock} {item.saleUnit}</strong> &rarr; Rekomendasi Restock:{" "}
                          <strong className="text-emerald-800 text-xs">+{item.recommendedRestockQty} {item.saleUnit}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Freshness Risk Items */}
                {aiRestockData.freshnessRiskItems && aiRestockData.freshnessRiskItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Sayuran Rentan Layu (Perlu Tindakan Sore Ini)</span>
                    </h4>

                    <div className="space-y-1.5">
                      {aiRestockData.freshnessRiskItems.map((risk, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold">{risk.productName}</span>: {risk.action}
                          </div>
                          <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
                            {risk.batchAgeHours}j di kios
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Ready Shopping List Textbox */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Format Daftar Belanja (Siap Kirim ke WhatsApp)</span>
                    </h4>

                    <button
                      type="button"
                      onClick={handleCopyShoppingList}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      {copiedShoppingList ? (
                        <>
                          <Check className="w-3 h-3 text-lime-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Format WA</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-800">
                    {aiRestockData.marketShoppingListText}
                  </div>
                </div>

                {/* General Advice */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold">Tips Mitigasi Susut Kios Esok Hari:</div>
                    <div className="text-slate-600 mt-0.5">{aiRestockData.generalAdvice}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsAiRestockOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition text-center"
                  >
                    Tutup Asisten
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
