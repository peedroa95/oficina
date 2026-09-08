import { prisma } from "@/lib/prisma";
import { createVehicle } from "@/actions/vehicles";
import { VehicleForm } from "@/components/VehicleForm";
import { PageHeader, Card } from "@/components/ui";

export default async function NovoVeiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; erro?: string }>;
}) {
  const { clienteId, erro } = await searchParams;
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo veículo" />
      <Card className="p-6">
        <VehicleForm action={createVehicle} customers={customers} defaultCustomerId={clienteId} errorMessage={erro} />
      </Card>
    </div>
  );
}
