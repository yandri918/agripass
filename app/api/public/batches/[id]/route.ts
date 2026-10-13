import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = dataStore.getBatchByPublicId(id);

  if (!batch) {
    return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
  }

  // Filter batch paspor untuk publik
  return NextResponse.json({
    batch: {
      publicId: batch.publicId,
      productName: batch.product.name,
      productPublicId: batch.product.publicId,
      category: batch.product.category,
      saleUnit: batch.product.saleUnit,
      priceIdr: batch.product.priceIdr,
      receivedAt: batch.receivedAt,
      harvestDate: batch.harvestDate,
      origin: batch.origin,
      salableQty: batch.salableQty,
      status: batch.status,
      claims: batch.claims.map((c) => ({
        claim: c.claim,
        sourceType: c.sourceType,
      })),
      notes: batch.notes,
    },
  });
}
