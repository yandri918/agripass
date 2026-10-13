import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = dataStore.completeOrder(id);
    return NextResponse.json({
      order,
      message: "Pesanan selesai. Stok fisik telah dikurangi dan reservasi dilepaskan.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
