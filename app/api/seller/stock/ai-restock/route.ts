import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";
import { recommendRestockAndFreshness } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const overview = dataStore.getStockOverview();
    const items = dataStore.getInventoryItems();

    const recommendation = await recommendRestockAndFreshness(items, overview);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error: any) {
    console.error("Gagal membuat rekomendasi restock AI:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal membuat rekomendasi restock AI" },
      { status: 500 }
    );
  }
}
