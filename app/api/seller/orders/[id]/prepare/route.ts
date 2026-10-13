import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PrepareSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      actualQty: z.number().positive(),
    })
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = PrepareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const order = dataStore.prepareOrder(id, parsed.data.items);
    return NextResponse.json({ order, message: "Kuantitas timbang aktual berhasil diperbarui." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
