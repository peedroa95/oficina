import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateServiceOrderInfo } from "@/actions/serviceOrders";
import { PageHeader, Card, Field, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";
import { PAYMENT_METHOD_LABELS } from "@/lib/format";

export default async function EditarOrdemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const order = await prisma.serviceOrder.findUnique({ where: { id } });
  if (!order) notFound();

  const action = updateServiceOrderInfo.bind(null, id);

  return (
    <div className="max-w-xl">
      <PageHeader title={`Editar OS #${String(order.number).padStart(4, "0")}`} />
      <Card className="p-6">
        <form action={action} className="space-y-4">
          {erro && (
            <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">{erro}</p>
          )}

          <Field label="Quilometragem" htmlFor="mileage">
            <Input id="mileage" name="mileage" type="number" min={0} defaultValue={order.mileage} />
          </Field>

          <Field label="Problema informado pelo cliente" htmlFor="reportedProblem">
            <Textarea id="reportedProblem" name="reportedProblem" rows={3} defaultValue={order.reportedProblem ?? ""} />
          </Field>

          <Field label="Forma de pagamento" htmlFor="paymentMethod">
            <Select id="paymentMethod" name="paymentMethod" defaultValue={order.paymentMethod ?? ""}>
              <option value="">Não definida</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={3} defaultValue={order.notes ?? ""} />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Salvar</Button>
            <LinkButton href={`/ordens/${order.id}`} variant="secondary">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
