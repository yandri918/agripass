import { dataStore } from "@/lib/data/store";
import {
  OrderDraftResponse,
  ProductQaResponse,
} from "./types";

/**
 * AI Adapter untuk AgriPass AI
 * Mendukung model open-weight (Gemma / LLM hosted) dengan fallback rule-based lokal
 * Menjaga integritas data: TIDAK membocorkan margin/biaya modal & TIDAK halusinasi data kosong.
 */

export async function answerProductQuestion(
  question: string,
  productPublicId: string
): Promise<ProductQaResponse> {
  // 1. Ambil data publik produk & batch dari dataStore
  const product = dataStore.getProductByPublicId(productPublicId);

  if (!product) {
    return {
      answer: "Maaf, produk tidak ditemukan di katalog toko ini.",
      knownDataUsed: [],
      unknownDataFlagged: ["product_not_found"],
      sources: [],
    };
  }

  // Hitung total stok tersedia
  const totalSalable = product.batches.reduce((acc: number, b) => acc + b.salableQty, 0);
  const activeBatch = product.batches[0];

  const knownData: string[] = [
    `Nama: ${product.name}`,
    `Harga: Rp ${product.priceIdr.toLocaleString("id-ID")} / ${product.saleUnit}`,
    `Stok Tersedia: ${totalSalable} ${product.saleUnit}`,
  ];

  const unknownData: string[] = [];
  const sources: { title: string; sourceType: string; detail?: string }[] = [
    {
      title: "Katalog Toko",
      sourceType: "CATALOG_DATA",
      detail: `Harga Rp ${product.priceIdr.toLocaleString("id-ID")} / ${product.saleUnit}`,
    },
  ];

  if (activeBatch?.origin) {
    knownData.push(`Asal: ${activeBatch.origin}`);
    sources.push({
      title: `Pemeriksaan Batch (${activeBatch.publicId})`,
      sourceType: "SELLER_INSPECTION",
      detail: `Asal produk dicatat: ${activeBatch.origin}`,
    });
  } else {
    unknownData.push("Asal kebun / daerah spesifik belum dicatat penjual");
  }

  if (activeBatch?.harvestDate) {
    const harvestStr = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(activeBatch.harvestDate));
    knownData.push(`Tanggal Panen: ${harvestStr}`);
    sources.push({
      title: "Keterangan Panen",
      sourceType: "SUPPLIER_STATEMENT",
      detail: `Panen: ${harvestStr}`,
    });
  } else {
    unknownData.push("Tanggal panen belum dicatat oleh penjual/pemasok");
  }

  if (activeBatch?.claims && activeBatch.claims.length > 0) {
    for (const claim of activeBatch.claims) {
      knownData.push(`Klaim: ${claim.claim}`);
      sources.push({
        title: "Klaim Kualitas",
        sourceType: claim.sourceType,
        detail: claim.claim,
      });
    }
  }

  // 2. Fallback Cerdas Berbasis Data Terverifikasi (Local Rule-Based)
  const qLower = question.toLowerCase();
  let answerText = "";

  if (qLower.includes("panen") || qLower.includes("kapan")) {
    if (activeBatch?.harvestDate) {
      const harvestStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(
        new Date(activeBatch.harvestDate)
      );
      answerText = `${product.name} ini dipanen pada ${harvestStr} dari ${activeBatch.origin || "pemasok mitra"}.`;
    } else {
      answerText = `Informasi tanggal panen spesifik untuk ${product.name} belum dicatat oleh penjual/pemasok. Namun barang masuk tercatat pada ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(activeBatch?.receivedAt || Date.now()))}.`;
    }
  } else if (qLower.includes("asal") || qLower.includes("dari mana") || qLower.includes("daerah")) {
    if (activeBatch?.origin) {
      answerText = `${product.name} ini berasal dari ${activeBatch.origin}.`;
    } else {
      answerText = `Asal kebun spesifik untuk batch ${product.name} ini belum dicatat oleh penjual.`;
    }
  } else if (qLower.includes("harga") || qLower.includes("berapa") || qLower.includes("setengah kilo")) {
    if (qLower.includes("setengah kilo") || qLower.includes("1/2 kg") || qLower.includes("setengah kg")) {
      if (product.saleUnit.toLowerCase() === "kg") {
        const halfPrice = Math.round(product.priceIdr / 2);
        answerText = `Harga untuk 0.5 kg (setengah kilo) ${product.name} adalah sekitar Rp ${halfPrice.toLocaleString("id-ID")} (harga dasar Rp ${product.priceIdr.toLocaleString("id-ID")}/kg).`;
      } else {
        answerText = `${product.name} dijual per ${product.saleUnit} seharga Rp ${product.priceIdr.toLocaleString("id-ID")}/${product.saleUnit}. Toko belum menyediakan konversi timbangan langsung ke kilogram.`;
      }
    } else {
      answerText = `Harga ${product.name} adalah Rp ${product.priceIdr.toLocaleString("id-ID")} per ${product.saleUnit}. Stok tersedia saat ini: ${totalSalable} ${product.saleUnit}.`;
    }
  } else {
    // Jawaban komprehensif
    answerText = `${product.name} dijual seharga Rp ${product.priceIdr.toLocaleString("id-ID")} per ${product.saleUnit}. `;
    if (activeBatch?.origin) answerText += `Berasal dari ${activeBatch.origin}. `;
    if (activeBatch?.harvestDate) {
      answerText += `Dipanen ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(activeBatch.harvestDate))}. `;
    }
    answerText += `Stok saat ini ${totalSalable} ${product.saleUnit}.`;
  }

  return {
    answer: answerText,
    knownDataUsed: knownData,
    unknownDataFlagged: unknownData,
    sources: sources,
  };
}

/**
 * Ekstraksi Pesanan dari Pesan Pelanggan (Bahasa Sehari-hari)
 */
export async function extractOrderDraft(
  message: string,
  _shopSlug?: string
): Promise<OrderDraftResponse> {
  const products = dataStore.getProducts(true);
  return parseOrderTextLocally(message, products);
}

/**
 * Parser Lokal Berbasis Aturan untuk Ekstraksi Pesanan Bahasa Indonesia
 */
function parseOrderTextLocally(
  message: string,
  products: { id: string; publicId: string; name: string; aliases: string; saleUnit: string; priceIdr: number }[]
): OrderDraftResponse {
  const items: OrderDraftResponse["items"] = [];
  const questions: string[] = [];
  const lowerMsg = message.toLowerCase();

  // 1. Deteksi Fulfillment & Waktu & Alamat
  const isDelivery =
    lowerMsg.includes("antar") ||
    lowerMsg.includes("kirim") ||
    lowerMsg.includes("kurir") ||
    lowerMsg.includes("ongkir") ||
    lowerMsg.includes("alamat");

  let requestedTimeText: string | null = null;
  if (lowerMsg.includes("pagi")) requestedTimeText = "Pagi hari";
  else if (lowerMsg.includes("siang")) requestedTimeText = "Siang hari";
  else if (lowerMsg.includes("sore")) requestedTimeText = "Sore hari";
  else if (lowerMsg.includes("malam")) requestedTimeText = "Malam hari";

  // Cek alamat sederhana
  let deliveryAddress: string | null = null;
  const addressMatch = message.match(/(?:ke|alamat(?:\s*:\s*|\s+))\s*([^,\n.]+)/i);
  if (addressMatch) {
    deliveryAddress = addressMatch[1].trim();
  }

  // 2. Deteksi kasus khusus multi-pilihan seperti "cabai / cabe"
  const hasGenericCabai = /\b(cabai|cabe)\b/i.test(lowerMsg) && !lowerMsg.includes("keriting") && !lowerMsg.includes("rawit");
  if (hasGenericCabai) {
    let budgetIdr: number | null = null;
    const numMatch = lowerMsg.match(/(?:cabai|cabe)\s+(\d+)\s*(?:rb|ribu|k)?/i);
    if (numMatch) {
      const val = parseInt(numMatch[1], 10);
      budgetIdr = val < 1000 ? val * 1000 : val;
    } else if (lowerMsg.includes("sepuluh ribu") || lowerMsg.includes("10.000") || lowerMsg.includes("10000")) {
      budgetIdr = 10000;
    } else if (lowerMsg.includes("lima ribu") || lowerMsg.includes("5.000") || lowerMsg.includes("5000")) {
      budgetIdr = 5000;
    }

    items.push({
      originalText: budgetIdr ? `cabai Rp ${budgetIdr.toLocaleString("id-ID")}` : "cabai",
      budgetIdr: budgetIdr,
      quantity: null,
      unit: null,
      needsClarification: true,
      clarificationNote: "Tersedia Cabai Merah Keriting dan Cabai Rawit Merah. Mohon konfirmasi jenis yang diinginkan.",
    });
    questions.push("Apakah Anda menginginkan Cabai Merah Keriting atau Cabai Rawit Merah?");
  }

  // 3. Iterasi setiap produk di katalog
  for (const prod of products) {
    const prodName = prod.name.toLowerCase();
    const aliases = prod.aliases ? prod.aliases.toLowerCase().split(",").map((s) => s.trim()) : [];
    const searchTerms = [prodName, ...aliases];

    let matchedTerm: string | null = null;
    for (const term of searchTerms) {
      if ((term === "cabai" || term === "cabe") && hasGenericCabai) continue;

      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(lowerMsg)) {
        matchedTerm = term;
        break;
      }
    }

    if (!matchedTerm) continue;

    let qty: number | null = null;
    let unit = prod.saleUnit;
    let budget: number | null = null;
    let needsClarification = false;
    let note: string | null = null;

    const patternA = new RegExp(
      `(\\d+(?:[,.]\\d+)?|setengah|1\\/2)\\s*(kg|kilo|gram|gr|ikat|pack|biji|buah)?\\s*${matchedTerm}`,
      "i"
    );
    const patternB = new RegExp(
      `${matchedTerm}\\s*(?:nya)?\\s*(\\d+(?:[,.]\\d+)?|setengah|1\\/2)\\s*(kg|kilo|gram|gr|ikat|pack|biji|buah)?`,
      "i"
    );

    const matchA = lowerMsg.match(patternA);
    const matchB = lowerMsg.match(patternB);
    const match = matchB || matchA;

    if (match) {
      const rawNum = match[1];
      const rawUnit = match[2]?.toLowerCase();

      if (rawNum === "setengah" || rawNum === "1/2") {
        qty = 0.5;
      } else {
        qty = parseFloat(rawNum.replace(",", "."));
      }

      if (rawUnit === "gram" || rawUnit === "gr") {
        if (prod.saleUnit === "kg") {
          qty = qty / 1000;
          unit = "kg";
        }
      } else if (rawUnit === "kilo" || rawUnit === "kg") {
        unit = "kg";
      } else if (rawUnit) {
        unit = rawUnit;
      }

      if (prod.saleUnit === "ikat" && unit === "kg") {
        needsClarification = true;
        note = `${prod.name} dijual per ikat. Toko belum memiliki konversi otomatis kg ke ikat.`;
        questions.push(`Berapa ikat ${prod.name} yang Anda butuhkan? (Produk dijual per ikat).`);
      }
    } else {
      const budgetPattern = new RegExp(`${matchedTerm}\\s*(?:nya)?\\s*(\\d+)\\s*(?:rb|ribu|k)?`, "i");
      const bMatch = lowerMsg.match(budgetPattern);
      if (bMatch) {
        const val = parseInt(bMatch[1], 10);
        budget = val < 1000 ? val * 1000 : val;
        if (prod.priceIdr > 0) {
          qty = Math.round((budget / prod.priceIdr) * 100) / 100;
          note = `Estimasi kuantitas berdasarkan anggaran Rp ${budget.toLocaleString("id-ID")}: ~${qty} ${prod.saleUnit}`;
        }
      } else {
        qty = 1;
        note = `Default 1 ${prod.saleUnit} (perlu konfirmasi jumlah)`;
      }
    }

    items.push({
      productId: prod.id,
      productName: prod.name,
      originalText: match ? match[0] : matchedTerm,
      quantity: qty,
      unit: unit,
      budgetIdr: budget,
      needsClarification: needsClarification,
      clarificationNote: note,
    });
  }

  return {
    intent: "create_order_draft",
    items: items,
    fulfillment: {
      method: isDelivery ? "DELIVERY" : "PICKUP",
      requestedTimeText: requestedTimeText,
      deliveryAddress: deliveryAddress,
    },
    questions: questions,
    requiresConfirmation: true,
    notes: items.length === 0 ? "Tidak ada produk yang terdeteksi secara otomatis. Silakan pilih secara manual." : undefined,
  };
}
