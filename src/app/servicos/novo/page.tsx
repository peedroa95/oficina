import { createService } from "@/actions/services";
import { ServiceForm } from "@/components/ServiceForm";
import { PageHeader, Card } from "@/components/ui";

export default async function NovoServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="max-w-xl">
      <PageHeader title="Novo serviço" />
      <Card className="p-6">
        <ServiceForm action={createService} errorMessage={erro} />
      </Card>
    </div>
  );
}
