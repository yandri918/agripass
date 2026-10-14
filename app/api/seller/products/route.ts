import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama komoditi sayuran wajib diisi"),
  category: z.string().default("Sayuran Daun"),
  saleUnit: z.string().default("kg"),
  priceIdr: z.number().min(0, "Harga jual minimal 0").default(10000),
  aliases: z.string().optional(),
  description: z.string().optional(),
  published: z.boolean().default(true),
});

export async function GET() {
  const products = dataStore.getProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const product = dataStore.createOrUpdateProduct(parsed.data);
    return NextResponse.json(
      {
        product,
        message: `Komoditas ${product.name} berhasil disimpan di katalog toko.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
