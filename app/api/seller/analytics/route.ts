import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const analytics = dataStore.getProfitAnalytics();
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error("Gagal mengambil data analitik keuntungan:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan server saat menghitung analitik" },
      { status: 500 }
    );
  }
}
