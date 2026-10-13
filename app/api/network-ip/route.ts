import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const interfaces = os.networkInterfaces();
  let localIp = "127.0.0.1";

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Prioritaskan IPv4 non-internal
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  return NextResponse.json({ localIp, port: 3000 });
}
