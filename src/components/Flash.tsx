"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckCircle2, XCircle, X } from "lucide-react";

export function Flash() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = searchParams.get("ok");
  const erro = searchParams.get("erro");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (ok || erro) {
      const timer = setTimeout(() => dismiss(), 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, erro]);

  function dismiss() {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("ok");
    params.delete("erro");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  if (!visible || (!ok && !erro)) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg max-w-sm ${
        ok
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-medium">{ok || erro}</p>
      <button onClick={dismiss} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
