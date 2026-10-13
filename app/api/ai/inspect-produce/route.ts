import { NextResponse } from "next/server";
import { inspectProduceImage } from "@/lib/ai/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, mimeType = "image/jpeg", productName, receivedQty } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Foto sayuran (base64 image) wajib disertakan" },
        { status: 400 }
      );
    }

    const inspection = await inspectProduceImage(
      image,
      mimeType,
      productName,
      typeof receivedQty === "number" ? receivedQty : undefined
    );

    const numReceived = typeof receivedQty === "number" && receivedQty > 0 ? receivedQty : 0;
    const suggestedDamageQty =
      numReceived > 0
        ? Math.round(numReceived * (inspection.estimatedDamagePercent / 100) * 100) / 100
        : 0;

    return NextResponse.json({
      ...inspection,
      suggestedDamageQty,
    });
  } catch (error) {
    console.error("Gagal melakukan inspeksi visual AI:", error);
    return NextResponse.json(
      { error: "Gagal memproses inspeksi visual sayuran" },
      { status: 500 }
    );
  }
}
