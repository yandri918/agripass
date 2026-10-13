import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = dataStore.getDatabaseInfo();
    return NextResponse.json({
      success: true,
      info,
    });
  } catch (error: any) {
    console.error("Gagal mengambil info database:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil info database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, backupData } = body;

    if (action === "backup") {
      const backup = dataStore.exportDatabaseBackup();
      return NextResponse.json({ success: true, backup });
    }

    if (action === "restore") {
      if (!backupData) {
        return NextResponse.json(
          { error: "Data backup tidak ditemukan dalam payload" },
          { status: 400 }
        );
      }
      const info = dataStore.restoreDatabaseBackup(backupData);
      return NextResponse.json({
        success: true,
        message: "Database berhasil dipulihkan dari data backup.",
        info,
      });
    }

    if (action === "reset") {
      const info = dataStore.resetDatabaseToSeed();
      return NextResponse.json({
        success: true,
        message: "Database berhasil di-reset kembali ke data awal (seed).",
        info,
      });
    }

    return NextResponse.json(
      { error: "Aksi tidak dikenali. Gunakan 'backup', 'restore', atau 'reset'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Gagal memproses aksi database:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses aksi database" },
      { status: 500 }
    );
  }
}
