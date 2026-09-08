import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateVehicle } from "@/actions/vehicles";
import { VehicleForm } from "@/components/VehicleForm";
import { PageHeader, Card } from "@/components/ui";

export default async function EditarVeiculoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const [vehicle, customers] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!vehicle) notFound();

  const action = updateVehicle.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar veículo" />
      <Card className="p-6">
        <VehicleForm action={action} vehicle={vehicle} customers={customers} errorMessage={erro} />
      </Card>
    </div>
  );
}
