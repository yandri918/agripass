import { answerProductQuestion } from "@/lib/ai/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  question: z.string().min(1, "Pertanyaan tidak boleh kosong"),
  productId: z.string().min(1, "ID produk wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result = await answerProductQuestion(parsed.data.question, parsed.data.productId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal memproses pertanyaan", detail: err.message },
      { status: 500 }
    );
  }
}
