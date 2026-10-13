import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backup = dataStore.exportDatabaseBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="agripass-database-backup-${dateStr}.json"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Gagal men-download backup database:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengunduh backup database" },
      { status: 500 }
    );
  }
}
