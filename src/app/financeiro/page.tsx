import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createExpense, deleteTransaction } from "@/actions/financial";
import { PageHeader, Card, StatCard, Field, Input, Select, Button, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency, formatDate, formatDateInput } from "@/lib/format";

const EXPENSE_CATEGORIES = [
  "Compra de peças",
  "Energia",
  "Água",
  "Aluguel",
  "Ferramentas",
  "Outros",
];

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthTransactions, recentTransactions] = await Promise.all([
    prisma.financialTransaction.findMany({ where: { date: { gte: startOfMonth } } }),
    prisma.financialTransaction.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { serviceOrder: { include: { customer: true } } },
    }),
  ]);

  const entradas = monthTransactions.filter((t) => t.type === "ENTRADA").reduce((sum, t) => sum + t.amount, 0);
  const saidas = monthTransactions.filter((t) => t.type === "SAIDA").reduce((sum, t) => sum + t.amount, 0);
  const saldo = entradas - saidas;

  return (
    <div>
      <PageHeader title="Financeiro" description="Controle simples de entradas e saídas" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Entradas do mês" value={formatCurrency(entradas)} tone="success" />
        <StatCard label="Saídas do mês" value={formatCurrency(saidas)} tone="danger" />
        <StatCard label="Saldo do mês" value={formatCurrency(saldo)} tone={saldo >= 0 ? "default" : "danger"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-slate-900 mb-3">Registrar saída</h2>
          <form action={createExpense} className="space-y-3">
            <Field label="Descrição" htmlFor="description" required>
              <Input id="description" name="description" required placeholder="Ex: Compra de peças" />
            </Field>
            <Field label="Valor (R$)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min={0.01} required />
            </Field>
            <Field label="Categoria" htmlFor="category">
              <Select id="category" name="category" defaultValue="Outros">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data" htmlFor="date">
              <Input id="date" name="date" type="date" defaultValue={formatDateInput(new Date())} />
            </Field>
            <Button type="submit" className="w-full">
              Registrar saída
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-5 pb-0">
            <h2 className="font-semibold text-slate-900">Lançamentos recentes</h2>
          </div>
          {recentTransactions.length === 0 ? (
            <EmptyState title="Nenhum lançamento ainda" />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-2 font-medium">Data</th>
                    <th className="py-2 pr-2 font-medium">Descrição</th>
                    <th className="py-2 pr-2 font-medium">Categoria</th>
                    <th className="py-2 pr-2 font-medium text-right">Valor</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 pr-2 text-slate-600">{formatDate(t.date)}</td>
                      <td className="py-2 pr-2">
                        {t.serviceOrder ? (
                          <Link href={`/ordens/${t.serviceOrder.id}`} className="text-blue-600 hover:underline">
                            {t.description}
                          </Link>
                        ) : (
                          t.description
                        )}
                      </td>
                      <td className="py-2 pr-2 text-slate-600">{t.category || "-"}</td>
                      <td
                        className={`py-2 pr-2 text-right font-medium ${
                          t.type === "ENTRADA" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "ENTRADA" ? "+" : "-"} {formatCurrency(t.amount)}
                      </td>
                      <td className="py-2 text-right">
                        {!t.serviceOrderId && (
                          <form action={deleteTransaction}>
                            <input type="hidden" name="id" value={t.id} />
                            <DeleteButton confirmMessage="Excluir este lançamento?" />
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
