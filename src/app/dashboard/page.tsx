import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard, Badge, LinkButton, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";

export default async function DashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    servicesToday,
    openOrders,
    finishedOrders,
    incomeToday,
    incomeMonth,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.serviceOrderService.count({
      where: { serviceOrder: { date: { gte: startOfDay }, status: { in: ["FINALIZADA", "ENTREGUE"] } } },
    }),
    prisma.serviceOrder.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO"] } } }),
    prisma.serviceOrder.count({ where: { status: "FINALIZADA" } }),
    prisma.financialTransaction.aggregate({
      where: { type: "ENTRADA", date: { gte: startOfDay } },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.aggregate({
      where: { type: "ENTRADA", date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.serviceOrder.findMany({
      where: { status: { notIn: ["CANCELADA"] }, paymentStatus: { not: "PAGO" } },
      select: { total: true, paidAmount: true },
    }),
    prisma.product.findMany({ where: { active: true } }),
    prisma.serviceOrder.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { customer: true, vehicle: true },
    }),
  ]);

  const pendingAmount = pendingOrders.reduce((sum, o) => sum + Math.max(0, o.total - o.paidAmount), 0);
  const lowStock = lowStockProducts.filter((p) => p.quantity <= p.minStock);

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da oficina hoje" />

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Serviços realizados hoje" value={String(servicesToday)} />
        <StatCard label="Ordens abertas" value={String(openOrders)} />
        <StatCard label="Ordens finalizadas" value={String(finishedOrders)} />
        <StatCard label="Faturamento do dia" value={formatCurrency(incomeToday._sum.amount || 0)} tone="success" />
        <StatCard label="Faturamento do mês" value={formatCurrency(incomeMonth._sum.amount || 0)} tone="success" />
        <StatCard label="Valores pendentes" value={formatCurrency(pendingAmount)} tone="warning" />
        <StatCard label="Estoque baixo" value={String(lowStock.length)} tone={lowStock.length > 0 ? "danger" : "default"} />
      </div>

      {lowStock.length > 0 && (
        <Card className="p-4 mb-6 border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Produtos com estoque baixo:</strong>{" "}
            {lowStock.map((p) => p.name).join(", ")}.{" "}
            <Link href="/estoque" className="underline">
              Ver estoque
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-semibold text-slate-900">Últimas ordens de serviço</h2>
          <LinkButton href="/ordens" variant="ghost" className="text-xs px-2 py-1">
            Ver todas
          </LinkButton>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem de serviço ainda"
            action={<LinkButton href="/ordens/nova">Abrir primeira OS</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2 font-medium">OS</th>
                  <th className="py-2 pr-2 font-medium">Cliente</th>
                  <th className="py-2 pr-2 font-medium">Veículo</th>
                  <th className="py-2 pr-2 font-medium">Placa</th>
                  <th className="py-2 pr-2 font-medium">Valor</th>
                  <th className="py-2 pr-2 font-medium">Status</th>
                  <th className="py-2 pr-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50">
                    <td className="py-2 pr-2">
                      <Link href={`/ordens/${os.id}`} className="font-semibold text-blue-600 hover:underline">
                        OS {String(os.number).padStart(3, "0")}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 text-slate-700">{os.customer.name}</td>
                    <td className="py-2 pr-2 text-slate-600">
                      {os.vehicle.brand} {os.vehicle.model}
                    </td>
                    <td className="py-2 pr-2 font-mono text-slate-600">{os.vehicle.plate}</td>
                    <td className="py-2 pr-2 font-medium">{formatCurrency(os.total)}</td>
                    <td className="py-2 pr-2">
                      <Badge className={STATUS_COLORS[os.status]}>{STATUS_LABELS[os.status]}</Badge>
                    </td>
                    <td className="py-2 pr-2 text-slate-500">{formatDate(os.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
