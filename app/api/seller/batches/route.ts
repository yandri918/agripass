import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BatchIntakeSchema = z.object({
  productId: z.string().optional(),
  commodityName: z.string().optional(),
  saleUnit: z.string().optional(),
  category: z.string().optional(),
  retailPriceIdr: z.number().min(0).optional(),
  supplierId: z.string().nullable().optional(),
  receivedQty: z.number().positive("Jumlah diterima harus lebih dari 0"),
  initialDamageQty: z.number().min(0, "Kerusakan awal minimal 0"),
  purchaseCost: z.number().min(0, "Harga beli minimal 0"),
  freightCost: z.number().min(0, "Ongkos angkut minimal 0"),
  prepCost: z.number().min(0).optional(),
  origin: z.string().optional(),
  harvestDate: z.string().nullable().optional(),
  notes: z.string().optional(),
  claimText: z.string().optional(),
  freshnessScore: z.number().optional(),
  freshnessGrade: z.string().optional(),
  inspectionPhoto: z.string().optional(),
});

export async function GET() {
  const batches = dataStore.getBatches();
  return NextResponse.json({ batches });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BatchIntakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let finalProductId = parsed.data.productId;

    // Jika pengguna memasukkan nama komoditi baru atau memilih editable commodity
    if (parsed.data.commodityName && parsed.data.commodityName.trim()) {
      const prod = dataStore.createOrUpdateProduct({
        name: parsed.data.commodityName.trim(),
        saleUnit: parsed.data.saleUnit || "kg",
        category: parsed.data.category || "Sayuran Daun",
        priceIdr: parsed.data.retailPriceIdr !== undefined ? parsed.data.retailPriceIdr : 10000,
      });
      finalProductId = prod.id;
    }

    if (!finalProductId) {
      return NextResponse.json(
        { error: "Mohon pilih komoditas atau ketik nama komoditas sayuran baru" },
        { status: 400 }
      );
    }

    const batch = dataStore.createBatchIntake({
      ...parsed.data,
      productId: finalProductId,
    });

    return NextResponse.json(
      {
        batch,
        message: `Batch barang masuk berhasil dicatat. Kuantitas layak jual: ${batch.salableQty}, Biaya per unit: Rp ${batch.unitCost.toLocaleString("id-ID")}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
