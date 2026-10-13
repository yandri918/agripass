import { extractOrderDraft } from "@/lib/ai/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong"),
  shopSlug: z.string().default("berkah-mandiri"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result = await extractOrderDraft(parsed.data.message, parsed.data.shopSlug);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal mengekstrak draf pesanan", detail: err.message },
      { status: 500 }
    );
  }
}
