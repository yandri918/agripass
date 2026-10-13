import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json({ error: "Parameter 'text' wajib disertakan" }, { status: 400 });
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#14532d", // Hijau tua elegan khas pertanian
        light: "#ffffff",
      },
    });

    return NextResponse.json({ dataUrl });
  } catch (err) {
    return NextResponse.json({ error: "Gagal membuat QR Code" }, { status: 500 });
  }
}
