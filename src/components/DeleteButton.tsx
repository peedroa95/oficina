"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  confirmMessage = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
  label,
}: {
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      title="Excluir"
    >
      <Trash2 className="h-4 w-4" />
      {label}
    </button>
  );
}
