import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "Nama pemesan wajib diisi"),
  customerContactPrivate: z.string().min(1, "Kontak (WhatsApp/No. HP) wajib diisi"),
  fulfillmentMethod: z.enum(["PICKUP", "DELIVERY"]),
  requestedTimeText: z.string().default("Segera"),
  deliveryAddress: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        requestedQty: z.number().positive("Kuantitas harus positif"),
        unit: z.string(),
        notes: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 produk dalam pesanan"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newOrder = dataStore.createOrder(parsed.data);
    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal membuat pesanan", detail: err.message },
      { status: 500 }
    );
  }
}
