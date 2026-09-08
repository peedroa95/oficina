import { createCustomer } from "@/actions/customers";
import { CustomerForm } from "@/components/CustomerForm";
import { PageHeader, Card } from "@/components/ui";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Novo cliente" />
      <Card className="p-6">
        <CustomerForm action={createCustomer} errorMessage={erro} />
      </Card>
    </div>
  );
}
