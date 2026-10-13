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
