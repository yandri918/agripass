"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Calendar,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Send,
  Download,
  Smartphone,
  Globe,
  Copy,
  Check,
  Settings,
} from "lucide-react";
import { ProductQaResponse } from "@/lib/ai/types";

export default function ProductPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrTargetUrl, setQrTargetUrl] = useState<string>("");
  const [localIp, setLocalIp] = useState<string>("192.168.11.6");
  
  // Deployment Target Modes: "vercel" (Online Public) | "wifi" (LAN) | "localhost"
  const [deployTarget, setDeployTarget] = useState<"vercel" | "wifi" | "localhost">("vercel");
  const [vercelDomain, setVercelDomain] = useState<string>("https://agripass.vercel.app");
  const [showDomainInput, setShowDomainInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // AI Q&A State
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState<ProductQaResponse | null>(null);

  // 1. Ambil data produk, IP lokal, dan domain tersimpan
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, ipRes] = await Promise.all([
          fetch(`/api/public/products/${id}`),
          fetch("/api/network-ip").catch(() => null),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProduct(data.product);
        }

        if (ipRes && ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.localIp && ipData.localIp !== "127.0.0.1") {
            setLocalIp(ipData.localIp);
          }
        }

        // Baca domain vercel tersimpan dari localStorage jika ada
        if (typeof window !== "undefined") {
          const savedDomain = localStorage.getItem("agripass_vercel_domain");
          if (savedDomain) setVercelDomain(savedDomain);
        }
      } catch (err) {
        console.error("Gagal memuat paspor produk:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // 2. Generate QR code dinamis berdasarkan target deployment
  useEffect(() => {
    async function generateQr() {
      if (!product) return;

      let target = "";
      if (deployTarget === "vercel") {
        const cleanDomain = vercelDomain.trim().replace(/\/$/, "");
        target = `${cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`}/produk/${id}`;
      } else if (deployTarget === "wifi") {
        target = `http://${localIp}:3000/produk/${id}`;
      } else {
        target = typeof window !== "undefined" ? window.location.href : `http://localhost:3000/produk/${id}`;
      }

      setQrTargetUrl(target);

      try {
        const qrRes = await fetch(`/api/qr?text=${encodeURIComponent(target)}`);
        if (qrRes.ok) {
          const qrJson = await qrRes.json();
          setQrDataUrl(qrJson.dataUrl);
        }
      } catch (err) {
        console.error("Gagal membuat QR:", err);
      }
    }

    generateQr();
  }, [product, id, deployTarget, vercelDomain, localIp]);

  const handleSaveVercelDomain = (newDomain: string) => {
    setVercelDomain(newDomain);
    if (typeof window !== "undefined") {
      localStorage.setItem("agripass_vercel_domain", newDomain);
    }
  };

  const handleAskQuestion = async (customQ?: string) => {
    const qToAsk = customQ || question;
    if (!qToAsk.trim()) return;

    setQaLoading(true);
    try {
      const res = await fetch("/api/ai/product-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qToAsk, productId: id }),
      });
      if (res.ok) {
        const data: ProductQaResponse = await res.json();
        setQaResult(data);
      }
    } catch (err) {
      console.error("Gagal tanya AI:", err);
    } finally {
      setQaLoading(false);
    }
  };

  const copyUrlToClipboard = () => {
    if (navigator.clipboard && qrTargetUrl) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Memuat paspor produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen max-w-md mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Produk Tidak Ditemukan</h2>
        <Link href="/toko/berkah-mandiri" className="text-emerald-700 text-sm font-semibold underline">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const activeBatch = product.batches?.[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/toko/berkah-mandiri"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>

        {/* Passport Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-xs text-lime-300 font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Paspor Sayuran Transparan
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{product.name}</h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                  Kategori: {product.category} • Kode Paspor: {product.publicId}
                </p>
              </div>

              <div className="text-left sm:text-right bg-emerald-950/60 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                <div className="text-xs text-emerald-200">Harga Katalog</div>
                <div className="text-2xl font-black text-lime-400">
                  Rp {product.priceIdr.toLocaleString("id-ID")}
                  <span className="text-xs font-normal text-white"> / {product.saleUnit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story & Batch Details (2 cols) */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cerita & Catatan Produk
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {product.description || "Sayuran segar pilihan mitra petani lokal."}
                </p>
              </div>

              {/* Provenance Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transparansi Rantai Pasok
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Asal Kebun / Daerah:
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {activeBatch?.origin || "Belum dicatat oleh penjual"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Panen:
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {activeBatch?.harvestDate
                        ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                            new Date(activeBatch.harvestDate)
                          )
                        : "Belum dicatat oleh pemasok"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Waktu Diterima di Kios:
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {activeBatch?.receivedAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(activeBatch.receivedAt))
                        : "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Stok Fisik Layak Jual:
                    </span>
                    <span className="font-bold text-emerald-700 block text-sm">
                      {activeBatch?.salableQty || 0} {product.saleUnit} tersedia
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Claims */}
              {activeBatch?.claims && activeBatch.claims.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Klaim Kualitas & Sortasi
                  </h3>
                  <div className="space-y-2">
                    {activeBatch.claims.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-950 font-medium"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{c.claim}</span>
                        <span className="ml-auto text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                          {c.sourceType === "SELLER_INSPECTION" ? "Sortasi Kios" : "Keterangan Petani"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Passport Column (1 col) */}
            <div className="flex flex-col items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-full">
                <div className="text-xs font-bold text-slate-900 mb-1">QR Paspor Produk</div>
                <p className="text-[11px] text-slate-500">
                  Scan kamera HP untuk membuka paspor
                </p>

                {/* Target Mode Selector: Vercel vs Wi-Fi vs Local */}
                <div className="mt-3 p-1 bg-slate-200/70 rounded-xl flex items-center gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => setDeployTarget("vercel")}
                    className={`flex-1 py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                      deployTarget === "vercel" ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    <Globe className="w-3 h-3 text-emerald-600" /> Vercel (Online)
                  </button>
                  <button
                    onClick={() => setDeployTarget("wifi")}
                    className={`flex-1 py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                      deployTarget === "wifi" ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    <Smartphone className="w-3 h-3 text-slate-500" /> Wi-Fi
                  </button>
                  <button
                    onClick={() => setDeployTarget("localhost")}
                    className={`flex-1 py-1 rounded-lg transition ${
                      deployTarget === "localhost" ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Local
                  </button>
                </div>

                {/* Vercel Custom Domain Config Toggle */}
                {deployTarget === "vercel" && (
                  <div className="mt-2 text-[10px] text-left">
                    <button
                      onClick={() => setShowDomainInput(!showDomainInput)}
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Settings className="w-3 h-3" />
                      {showDomainInput ? "Sembunyikan Pengaturan Domain" : "Atur Domain Vercel Anda"}
                    </button>
                    {showDomainInput && (
                      <div className="mt-1.5 p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                        <label className="text-slate-500 block font-medium">Domain Vercel:</label>
                        <input
                          type="text"
                          value={vercelDomain}
                          onChange={(e) => handleSaveVercelDomain(e.target.value)}
                          placeholder="https://agripass.vercel.app"
                          className="w-full p-1.5 text-[10px] border rounded bg-slate-50 font-mono focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 p-3 bg-white rounded-2xl shadow-sm inline-block border border-slate-200">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Paspor" className="w-44 h-44 mx-auto rounded-lg" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                      Membuat QR...
                    </div>
                  )}
                </div>

                {/* Target URL with Copy Button */}
                <div className="mt-2.5 p-2 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-left flex items-center justify-between gap-2">
                  <span className="font-mono text-slate-600 truncate">{qrTargetUrl}</span>
                  <button
                    onClick={copyUrlToClipboard}
                    className="p-1 rounded bg-white hover:bg-slate-50 text-slate-700 shadow-xs shrink-0"
                    title="Salin tautan"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr-paspor-${product.publicId}.png`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh QR Label Cetak
                </a>
              )}
            </div>
          </div>
        </div>

        {/* AI Q&A Assistant Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tanya Asisten AI tentang {product.name}
              </h2>
              <p className="text-xs text-slate-500">
                Jawaban hanya berdasarkan data riil toko & paspor terverifikasi (tanpa membocorkan modal)
              </p>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-400 self-center">Pertanyaan cepat:</span>
            <button
              onClick={() => handleAskQuestion("Kapan sayuran ini dipanen?")}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              Kapan dipanen?
            </button>
            <button
              onClick={() => handleAskQuestion("Berapa harganya kalau beli setengah kilo?")}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              Berapa harga 1/2 kilo?
            </button>
            <button
              onClick={() => handleAskQuestion("Dari daerah mana sayuran ini berasal?")}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              Dari mana asalnya?
            </button>
          </div>

          {/* Question Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Tanyakan hal lain tentang ${product.name}...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={qaLoading || !question.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              {qaLoading ? "Menjawab..." : "Tanya"}
            </button>
          </div>

          {/* AI Response Card */}
          {qaResult && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  AI
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                    {qaResult.answer}
                  </p>
                </div>
              </div>

              {/* Verified Sources */}
              {qaResult.sources && qaResult.sources.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2 text-[10px]">
                  <span className="text-emerald-800 font-bold self-center">Sumber Data:</span>
                  {qaResult.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-semibold"
                    >
                      {s.title} ({s.sourceType})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
