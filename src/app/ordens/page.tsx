import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, LinkButton, Badge, Select, Button, EmptyState } from "@/components/ui";
import {
  formatCurrency,
  formatDate,
  STATUS_COLORS,
  STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.serviceOrder.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { number: "desc" },
    include: { customer: true, vehicle: true },
  });

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Todas as ordens de serviço da oficina"
        action={
          <LinkButton href="/ordens/nova">
            <Plus className="h-4 w-4" /> Nova OS
          </LinkButton>
        }
      />

      <Card className="p-4 mb-4">
        <form className="flex gap-2 items-end max-w-md">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por status</label>
            <Select name="status" defaultValue={status || ""}>
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
      </Card>

      <Card>
        {orders.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem de serviço encontrada"
            action={<LinkButton href="/ordens/nova">Abrir nova OS</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">OS</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/ordens/${os.id}`} className="font-semibold text-blue-600 hover:underline">
                        #{String(os.number).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(os.date)}</td>
                    <td className="px-4 py-3 text-slate-700">{os.customer.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {os.vehicle.plate} - {os.vehicle.brand} {os.vehicle.model}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(os.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={PAYMENT_STATUS_COLORS[os.paymentStatus]}>
                        {PAYMENT_STATUS_LABELS[os.paymentStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[os.status]}>{STATUS_LABELS[os.status]}</Badge>
                    </td>
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
