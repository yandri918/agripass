import { dataStore } from "@/lib/data/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = dataStore.getShop(slug);
  const products = dataStore.getProducts(true); // only published

  // Proyeksi kolom publik (Blueprint Section 14 & 15: Tidak kirim modal / margin ke publik)
  const publicProducts = products.map((p) => ({
    id: p.id,
    publicId: p.publicId,
    name: p.name,
    category: p.category,
    saleUnit: p.saleUnit,
    priceIdr: p.priceIdr,
    description: p.description,
    totalStock: p.totalStock,
  }));

  return NextResponse.json({
    shop: {
      name: shop.name,
      slug: shop.slug,
      contactPublic: shop.contactPublic,
      fulfillmentSettings: shop.fulfillmentSettings,
    },
    products: publicProducts,
  });
}
