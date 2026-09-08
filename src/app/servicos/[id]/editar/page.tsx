import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateService } from "@/actions/services";
import { ServiceForm } from "@/components/ServiceForm";
import { PageHeader, Card } from "@/components/ui";

export default async function EditarServicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  const action = updateService.bind(null, id);

  return (
    <div className="max-w-xl">
      <PageHeader title="Editar serviço" />
      <Card className="p-6">
        <ServiceForm action={action} service={service} errorMessage={erro} />
      </Card>
    </div>
  );
}
