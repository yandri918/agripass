import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const overview = dataStore.getStockOverview();
    const items = dataStore.getInventoryItems();
    const movements = dataStore.getStockMovements(productId, limit);

    return NextResponse.json({
      success: true,
      overview,
      items,
      movements,
    });
  } catch (error: any) {
    console.error("Gagal mengambil data stok:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan server saat mengambil data stok" },
      { status: 500 }
    );
  }
}
