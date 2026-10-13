import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";
import { MovementType } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchId, productId, type, quantity, reason, actorId } = body;

    if (!batchId && !productId) {
      return NextResponse.json(
        { error: "Mohon tentukan batchId atau productId untuk penyesuaian stok" },
        { status: 400 }
      );
    }

    if (quantity === undefined || typeof quantity !== "number" || quantity === 0) {
      return NextResponse.json(
        { error: "Jumlah penyesuaian harus berupa angka yang tidak nol" },
        { status: 400 }
      );
    }

    const validTypes: MovementType[] = [
      "INTAKE",
      "SPOILAGE_INITIAL",
      "SPOILAGE_POST",
      "SALE",
      "CORRECTION",
      "RETURN",
    ];

    const movementType: MovementType = validTypes.includes(type) ? type : "CORRECTION";

    const result = dataStore.adjustStock({
      batchId,
      productId,
      type: movementType,
      quantity,
      reason: reason || "Penyesuaian stok oleh penjual",
      actorId: actorId || "seller",
    });

    return NextResponse.json({
      success: true,
      message: `Stok ${result.product.name} berhasil diperbarui dari ${result.previousQty} ${result.product.saleUnit} menjadi ${result.newSalableQty} ${result.product.saleUnit}.`,
      result,
    });
  } catch (error: any) {
    console.error("Gagal melakukan penyesuaian stok:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal melakukan penyesuaian stok" },
      { status: 500 }
    );
  }
}
