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
  Copy,
  Check,
} from "lucide-react";

export default function BatchPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrTargetUrl, setQrTargetUrl] = useState<string>("");
  const [localIp, setLocalIp] = useState<string>("192.168.11.6");
  const [useWifiIp, setUseWifiIp] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

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
      if (typeof window !== "undefined") {
        const isLocal =
          window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        if (isLocal && useWifiIp && localIp) {
          target = `http://${localIp}:${window.location.port || "3000"}/batch/${id}`;
        } else {
          target = window.location.href;
        }
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
  }, [batchData, id, useWifiIp, localIp]);

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
        Memuat paspor batch...
      </div>
    );
  }

  if (!batchData) {
    return (
      <div className="min-h-screen max-w-md mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Batch Tidak Ditemukan</h2>
        <Link href="/toko/berkah-mandiri" className="text-emerald-700 text-sm font-semibold underline">
          Kembali ke Katalog
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
          <ArrowLeft className="w-4 h-4" /> Paspor Produk Utama ({batchData.productName})
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="bg-emerald-950 text-white p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 border border-emerald-700 text-xs text-lime-300 font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Paspor Batch Spesifik
            </div>
            <h1 className="text-2xl font-black">{batchData.productName}</h1>
            <p className="text-xs text-emerald-300 font-mono mt-1">ID Batch: {batchData.publicId}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Asal Panen:
                </span>
                <span className="font-bold text-slate-900 block">{batchData.origin || "-"}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Panen:
                </span>
                <span className="font-bold text-slate-900 block">
                  {batchData.harvestDate
                    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                        new Date(batchData.harvestDate)
                      )
                    : "Belum dicatat"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Penerimaan di Kios:
                </span>
                <span className="font-bold text-slate-900 block">
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(batchData.receivedAt))}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sisa Stok Layak Jual:
                </span>
                <span className="font-bold text-emerald-700 block">
                  {batchData.salableQty} {batchData.saleUnit} ({batchData.status})
                </span>
              </div>
            </div>

            {batchData.claims && batchData.claims.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Klaim Terverifikasi
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
              <p className="text-[11px] text-slate-500">Scan kamera HP untuk membuka paspor ini</p>

              {/* Mode Selector */}
              <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 text-[10px] font-bold w-full max-w-xs">
                <button
                  onClick={() => setUseWifiIp(true)}
                  className={`flex-1 py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                    useWifiIp ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  <Smartphone className="w-3 h-3 text-emerald-600" /> Mode HP (Wi-Fi)
                </button>
                <button
                  onClick={() => setUseWifiIp(false)}
                  className={`flex-1 py-1 rounded-lg transition ${
                    !useWifiIp ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Localhost
                </button>
              </div>

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
                  <Download className="w-3.5 h-3.5" /> Unduh QR Label Batch
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
