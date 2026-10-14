"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  Download,
  Smartphone,
  Globe,
  Copy,
  Check,
  Settings,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n";

export default function BatchPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { t, isEn } = useLanguage();

  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrTargetUrl, setQrTargetUrl] = useState<string>("");
  const [localIp, setLocalIp] = useState<string>("192.168.11.6");
  
  // Deployment Target Modes: "wifi" (LAN) | "vercel" (Online) | "localhost"
  const [deployTarget, setDeployTarget] = useState<"wifi" | "vercel" | "localhost">("wifi");
  const [vercelDomain, setVercelDomain] = useState<string>("");
  const [showDomainInput, setShowDomainInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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
    async function loadData() {
      try {
        const [batchRes, ipRes] = await Promise.all([
          fetch(`/api/public/batches/${id}`),
          fetch("/api/network-ip").catch(() => null),
        ]);

        if (batchRes.ok) {
          const data = await batchRes.json();
          setBatchData(data.batch);
        }

        if (ipRes && ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.localIp && ipData.localIp !== "127.0.0.1") {
            setLocalIp(ipData.localIp);
          }
        }

        // Cek apakah sedang berjalan di online production (Vercel / Railway)
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname;
          const isRemote =
            hostname !== "localhost" &&
            hostname !== "127.0.0.1" &&
            !hostname.startsWith("192.168.") &&
            !hostname.startsWith("10.") &&
            !hostname.startsWith("172.");

          if (isRemote) {
            setDeployTarget("vercel");
            setVercelDomain(window.location.origin);
          } else {
            const savedDomain = localStorage.getItem("agripass_vercel_domain");
            if (savedDomain) setVercelDomain(savedDomain);
          }
        }
      } catch (err) {
        console.error("Gagal memuat batch paspor:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    async function generateQr() {
      if (!batchData) return;

      let target = "";
      if (deployTarget === "vercel") {
        if (vercelDomain && vercelDomain.trim()) {
          const cleanDomain = vercelDomain.trim().replace(/\/$/, "");
          target = `${cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`}/batch/${id}`;
        } else if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          target = `${window.location.origin}/batch/${id}`;
        } else {
          target = `http://${localIp}:3000/batch/${id}`;
        }
      } else if (deployTarget === "wifi") {
        target = `http://${localIp}:3000/batch/${id}`;
      } else {
        target = typeof window !== "undefined" ? window.location.href : `http://localhost:3000/batch/${id}`;
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
  }, [batchData, id, deployTarget, vercelDomain, localIp]);

  const handleSaveVercelDomain = (newDomain: string) => {
    setVercelDomain(newDomain);
    if (typeof window !== "undefined") {
      localStorage.setItem("agripass_vercel_domain", newDomain);
    }
  };

  const copyUrl = () => {
    if (navigator.clipboard && qrTargetUrl) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        {isEn ? "Loading batch passport..." : "Memuat paspor batch..."}
      </div>
    );
  }

  if (!batchData) {
    return (
      <div className="min-h-screen max-w-md mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          {isEn ? "Batch Not Found" : "Batch Tidak Ditemukan"}
        </h2>
        <Link href="/toko/berkah-mandiri" className="text-emerald-700 text-sm font-semibold underline">
          {isEn ? "Back to Catalog" : "Kembali ke Katalog"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href={`/produk/${batchData.productPublicId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {isEn ? `Main Product Passport (${batchData.productName})` : `Paspor Produk Utama (${batchData.productName})`}
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="bg-emerald-950 text-white p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 border border-emerald-700 text-xs text-lime-300 font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> {isEn ? "Specific Batch Passport" : "Paspor Batch Spesifik"}
            </div>
            <h1 className="text-2xl font-black">{batchData.productName}</h1>
            <p className="text-xs text-emerald-300 font-mono mt-1">{isEn ? "Batch ID: " : "ID Batch: "}{batchData.publicId}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? "Harvest Origin:" : "Asal Panen:"}
                </span>
                <span className="font-bold text-slate-900 block">{batchData.origin || "-"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? "Harvest Date:" : "Tanggal Panen:"}
                </span>
                <span className="font-bold text-slate-900 block">
                  {batchData.harvestDate
                    ? new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { dateStyle: "long" }).format(
                        new Date(batchData.harvestDate)
                      )
                    : (isEn ? "Not recorded" : "Belum dicatat")}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? "Stall Intake:" : "Penerimaan di Kios:"}
                </span>
                <span className="font-bold text-slate-900 block">
                  {new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(batchData.receivedAt))}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {isEn ? "Sellable Stock Remaining:" : "Sisa Stok Layak Jual:"}
                </span>
                <span className="font-bold text-emerald-700 block">
                  {batchData.salableQty} {batchData.saleUnit} ({batchData.status})
                </span>
              </div>
            </div>

            {batchData.claims && batchData.claims.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isEn ? "Verified Claims" : "Klaim Terverifikasi"}
                </h3>
                {batchData.claims.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{c.claim}</span>
                  </div>
                ))}
              </div>
            )}

            {/* QR Label Print */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center text-center space-y-3">
              <div className="text-xs font-bold text-slate-900">QR Paspor Batch Ini</div>
              <p className="text-[11px] text-slate-500">Scan kamera HP untuk membuka paspor</p>

              {/* Mode Selector */}
              <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 text-[10px] font-bold w-full max-w-xs">
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

              {deployTarget === "vercel" && (
                <div className="w-full max-w-xs text-[10px] text-left">
                  <button
                    onClick={() => setShowDomainInput(!showDomainInput)}
                    className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Settings className="w-3 h-3" />
                    {showDomainInput ? "Sembunyikan Pengaturan Domain" : "Atur Domain Vercel Anda"}
                  </button>
                  {(showDomainInput || !vercelDomain) && (
                    <div className="mt-1.5 p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                      <label className="text-slate-500 block font-medium">Domain Vercel Anda:</label>
                      <input
                        type="text"
                        value={vercelDomain}
                        onChange={(e) => handleSaveVercelDomain(e.target.value)}
                        placeholder="https://nama-project.vercel.app"
                        className="w-full p-1.5 text-[10px] border rounded bg-slate-50 font-mono focus:outline-none"
                      />
                      <p className="text-[9px] text-slate-400">
                        Masukkan URL Vercel Anda dari dashboard Vercel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl border shadow-sm">
                  <img src={qrDataUrl} alt="QR Paspor Batch" className="w-40 h-40 rounded-lg" />
                </div>
              )}

              {/* Target URL with Copy Button */}
              <div className="p-2 bg-slate-50 rounded-xl border text-[10px] text-left flex items-center justify-between gap-2 w-full max-w-xs">
                <span className="font-mono text-slate-600 truncate">{qrTargetUrl}</span>
                <button
                  onClick={copyUrl}
                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-xs shrink-0"
                  title="Salin tautan"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr-batch-${batchData.publicId}.png`}
                  className="py-2 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> {isEn ? "Download Batch QR Label" : "Unduh QR Label Batch"}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
