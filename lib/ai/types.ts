import { z } from "zod";

// Skema ekstraksi item pesanan dari teks pelanggan
export const OrderItemDraftSchema = z.object({
  productId: z.string().nullable().optional(),
  productName: z.string().optional(),
  originalText: z.string(),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  budgetIdr: z.number().nullable().optional(),
  needsClarification: z.boolean().default(false),
  clarificationNote: z.string().nullable().optional(),
});

export type OrderItemDraft = z.infer<typeof OrderItemDraftSchema>;

// Skema pemenuhan / fulfillment
export const FulfillmentDraftSchema = z.object({
  method: z.enum(["PICKUP", "DELIVERY"]).default("PICKUP"),
  requestedTimeText: z.string().nullable().optional(),
  deliveryAddress: z.string().nullable().optional(),
});

export type FulfillmentDraft = z.infer<typeof FulfillmentDraftSchema>;

// Skema utama ekstraksi pesanan (Blueprint Section 9.3)
export const OrderDraftResponseSchema = z.object({
  intent: z.literal("create_order_draft"),
  items: z.array(OrderItemDraftSchema),
  fulfillment: FulfillmentDraftSchema,
  questions: z.array(z.string()).default([]),
  requiresConfirmation: z.boolean().default(true),
  notes: z.string().nullable().optional(),
});

export type OrderDraftResponse = z.infer<typeof OrderDraftResponseSchema>;

// Skema Q&A Produk Publik (Blueprint Section 9.1 & 9.4)
export const ProductQaResponseSchema = z.object({
  answer: z.string(),
  knownDataUsed: z.array(z.string()).default([]),
  unknownDataFlagged: z.array(z.string()).default([]),
  sources: z.array(
    z.object({
      title: z.string(),
      sourceType: z.string(), // "SELLER_NOTE" | "SUPPLIER_STATEMENT" | "CATALOG_DATA"
      detail: z.string().optional(),
    })
  ).default([]),
});

export type ProductQaResponse = z.infer<typeof ProductQaResponseSchema>;

// Skema Inspeksi Visual Kesegaran Sayur (Gemini Vision Multimodal)
export const VisualInspectionResponseSchema = z.object({
  productNameGuess: z.string().describe("Tebakan jenis sayuran dari foto"),
  freshnessScore: z.number().min(0).max(100).describe("Skor kesegaran 0 - 100"),
  freshnessGrade: z.enum(["PRIMA", "BAIK", "CUKUP", "LAYU"]),
  estimatedDamagePercent: z.number().min(0).max(100).describe("Estimasi persentase susut/kerusakan daun (%)"),
  visualObservations: z.array(z.string()).describe("Observasi ciri fisik yang tampak pada foto"),
  suggestedHandling: z.string().describe("Saran penanganan awal penjual agar tetap awet segar"),
  suggestedQualityClaim: z.string().describe("Klaim mutu paspor yang cocok dicantumkan ke pelanggan"),
});

export type VisualInspectionResponse = z.infer<typeof VisualInspectionResponseSchema>;

// Skema Rekomendasi Restock & Pengelolaan Umur Simpan (Gemini AI Inventory)
export const RestockRecommendationSchema = z.object({
  summary: z.string().describe("Ringkasan kondisi inventori dan saran belanja pasar induk subuh"),
  marketShoppingListText: z.string().describe("Format daftar belanja teks siap salin ke WhatsApp/catatan pasar"),
  urgentRestock: z.array(
    z.object({
      productName: z.string(),
      currentStock: z.number(),
      saleUnit: z.string(),
      recommendedRestockQty: z.number(),
      reason: z.string(),
      urgency: z.enum(["KRITIS", "TINGGI", "SEDANG"]),
    })
  ),
  freshnessRiskItems: z.array(
    z.object({
      productName: z.string(),
      batchAgeHours: z.number(),
      action: z.string(),
    })
  ),
  generalAdvice: z.string().describe("Tips mitigasi susut sayuran untuk hari esok"),
});

export type RestockRecommendation = z.infer<typeof RestockRecommendationSchema>;
