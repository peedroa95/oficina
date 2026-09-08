import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Car, Phone, MapPin, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCustomer } from "@/actions/customers";
import {
  PageHeader,
  Card,
  LinkButton,
  Badge,
  EmptyState,
} from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { plate: "asc" } },
      serviceOrders: {
        orderBy: { date: "desc" },
        include: { vehicle: true },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <PageHeader
        title={customer.name}
        description="Detalhes do cliente"
        action={
          <div className="flex gap-2">
            <LinkButton href={`/clientes/${customer.id}/editar`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar
            </LinkButton>
            <form action={deleteCustomer}>
              <input type="hidden" name="id" value={customer.id} />
              <DeleteButton label="Excluir" />
            </form>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-700">{customer.document || "CPF/CNPJ não informado"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-700">
              {customer.whatsapp || customer.phone || "Telefone não informado"}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-700">{customer.address || "Endereço não informado"}</span>
          </div>
          {customer.notes && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Observações</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Car className="h-4 w-4" /> Veículos
              </h2>
              <LinkButton href={`/veiculos/novo?clienteId=${customer.id}`} variant="secondary" className="text-xs px-3 py-1.5">
                <Plus className="h-3.5 w-3.5" /> Adicionar veículo
              </LinkButton>
            </div>
            {customer.vehicles.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum veículo cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customer.vehicles.map((v) => (
                  <Link
                    key={v.id}
                    href={`/veiculos/${v.id}`}
                    className="rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <p className="font-semibold text-sm">{v.brand} {v.model}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Placa: {v.plate.toUpperCase()}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Ordens de serviço</h2>
            {customer.serviceOrders.length === 0 ? (
              <EmptyState title="Nenhuma ordem de serviço ainda" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                      <th className="py-2 pr-4 font-medium">OS</th>
                      <th className="py-2 pr-4 font-medium">Data</th>
                      <th className="py-2 pr-4 font-medium">Veículo</th>
                      <th className="py-2 pr-4 font-medium">Valor</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customer.serviceOrders.map((os) => (
                      <tr key={os.id} className="hover:bg-slate-50">
                        <td className="py-2 pr-4">
                          <Link href={`/ordens/${os.id}`} className="font-medium text-blue-600 hover:underline">
                            #{String(os.number).padStart(4, "0")}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-slate-600">{formatDate(os.date)}</td>
                        <td className="py-2 pr-4 text-slate-600">
                          {os.vehicle.brand} {os.vehicle.model}
                        </td>
                        <td className="py-2 pr-4 text-slate-600">{formatCurrency(os.total)}</td>
                        <td className="py-2 pr-4">
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
      </div>
    </div>
  );
}
