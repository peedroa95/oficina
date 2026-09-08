export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDateInput(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function formatMileage(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value || 0) + " km";
}

export function parseMoney(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=.*\.)/g, "")
    .replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export const STATUS_LABELS: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  FINALIZADA: "Finalizada",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export const STATUS_COLORS: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-amber-100 text-amber-700",
  FINALIZADA: "bg-emerald-100 text-emerald-700",
  ENTREGUE: "bg-slate-200 text-slate-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "PIX",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  PAGO: "Pago",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-red-100 text-red-700",
  PARCIAL: "bg-amber-100 text-amber-700",
  PAGO: "bg-emerald-100 text-emerald-700",
};
