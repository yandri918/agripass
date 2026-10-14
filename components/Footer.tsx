"use client";

import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-300/70 border-t border-emerald-900 py-6 text-center text-xs">
      <div className="max-w-6xl mx-auto px-4 space-y-1">
        <p>{t.footerCopyright}</p>
        <p className="text-emerald-400/60">{t.footerMotto}</p>
      </div>
    </footer>
  );
}
