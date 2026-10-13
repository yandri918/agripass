import { dataStore } from "@/lib/data/store";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = dataStore.getOrders();
  return NextResponse.json({ orders });
}
