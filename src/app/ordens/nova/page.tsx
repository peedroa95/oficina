import { prisma } from "@/lib/prisma";
import { createServiceOrder } from "@/actions/serviceOrders";
import { NewOrderForm } from "@/components/NewOrderForm";
import { PageHeader, Card } from "@/components/ui";

export default async function NovaOrdemPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; veiculoId?: string; erro?: string }>;
}) {
  const { clienteId, veiculoId, erro } = await searchParams;

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      vehicles: {
        orderBy: { plate: "asc" },
        select: { id: true, plate: true, brand: true, model: true, mileage: true },
      },
    },
  });

  return (
    <div className="max-w-xl">
      <PageHeader title="Nova ordem de serviço" description="Selecione o cliente e o veículo para abrir a OS" />
      <Card className="p-6">
        <NewOrderForm
          action={createServiceOrder}
          customers={customers}
          defaultCustomerId={clienteId}
          defaultVehicleId={veiculoId}
          errorMessage={erro}
        />
      </Card>
    </div>
  );
}
