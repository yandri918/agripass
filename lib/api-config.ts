/**
 * Helper konfigurasi URL API untuk deployment multi-platform (Railway Backend + Vercel Frontend)
 */

export function getApiBaseUrl(): string {
  // Jika didefinisikan URL Backend Railway secara eksplisit
  if (process.env.NEXT_PUBLIC_RAILWAY_URL) {
    return process.env.NEXT_PUBLIC_RAILWAY_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Jika di browser, gunakan origin saat ini sebagai default
  if (typeof window !== "undefined") {
    return "";
  }

  return "http://localhost:3000";
}

export function getVercelPassportBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const url = process.env.NEXT_PUBLIC_VERCEL_URL;
    return url.startsWith("http") ? url : `https://${url}`;
  }
  return "";
}
