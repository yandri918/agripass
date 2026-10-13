import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CancelSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = CancelSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    const order = dataStore.cancelOrder(id, reason);
    return NextResponse.json({
      order,
      message: "Pesanan dibatalkan dan reservasi stok dilepaskan kembali.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
