import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = dataStore.getProductByPublicId(id);

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  // Filter batch data untuk publik
  const publicBatches = product.batches.map((b) => ({
    publicId: b.publicId,
    receivedAt: b.receivedAt,
    harvestDate: b.harvestDate,
    origin: b.origin,
    salableQty: b.salableQty,
    saleUnit: product.saleUnit,
    status: b.status,
    claims: b.claims.map((c) => ({
      claim: c.claim,
      sourceType: c.sourceType,
    })),
    // Perhatikan: unitCost, purchaseCost, freightCost TIDAK DIKIRIM (Privacy Guarantee)
  }));

  return NextResponse.json({
    product: {
      id: product.id,
      publicId: product.publicId,
      name: product.name,
      category: product.category,
      saleUnit: product.saleUnit,
      priceIdr: product.priceIdr,
      description: product.description,
      batches: publicBatches,
    },
  });
}
