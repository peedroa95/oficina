import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, User, Gauge, Palette, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteVehicle } from "@/actions/vehicles";
import { PageHeader, Card, LinkButton, Badge, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";

export default async function VeiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceOrders: {
        orderBy: { date: "desc" },
        include: { services: true },
      },
    },
  });

  if (!vehicle) notFound();

  return (
    <div>
      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description={`Placa ${vehicle.plate}`}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/ordens/nova?veiculoId=${vehicle.id}`}>
              <Plus className="h-4 w-4" /> Nova OS
            </LinkButton>
            <LinkButton href={`/veiculos/${vehicle.id}/editar`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar
            </LinkButton>
            <form action={deleteVehicle}>
              <input type="hidden" name="id" value={vehicle.id} />
              <input type="hidden" name="customerId" value={vehicle.customerId} />
              <DeleteButton label="Excluir" />
            </form>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <Link href={`/clientes/${vehicle.customer.id}`} className="text-blue-600 hover:underline">
              {vehicle.customer.name}
            </Link>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Gauge className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-700">{vehicle.mileage.toLocaleString("pt-BR")} km</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Palette className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-700">
              {vehicle.color || "Cor não informada"} {vehicle.year && `· ${vehicle.year}`}
            </span>
          </div>
          {vehicle.notes && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Observações</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{vehicle.notes}</p>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Histórico de serviços</h2>
            {vehicle.serviceOrders.length === 0 ? (
              <EmptyState title="Nenhum serviço registrado ainda" />
            ) : (
              <ul className="space-y-3">
                {vehicle.serviceOrders.map((os) => (
                  <li key={os.id}>
                    <Link
                      href={`/ordens/${os.id}`}
                      className="block rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{formatDate(os.date)}</span>
                        <Badge className={STATUS_COLORS[os.status]}>{STATUS_LABELS[os.status]}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {os.services.map((s) => s.description).join(", ") || "Sem serviços"}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                        <span>KM: {os.mileage.toLocaleString("pt-BR")}</span>
                        <span className="font-medium text-slate-700">{formatCurrency(os.total)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
