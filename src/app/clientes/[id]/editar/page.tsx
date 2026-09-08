import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCustomer } from "@/actions/customers";
import { CustomerForm } from "@/components/CustomerForm";
import { PageHeader, Card } from "@/components/ui";

export default async function EditarClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const action = updateCustomer.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar cliente" />
      <Card className="p-6">
        <CustomerForm action={action} customer={customer} errorMessage={erro} />
      </Card>
    </div>
  );
}
