import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Printer, Gauge } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  addServiceLine,
  removeServiceLine,
  addProductLine,
  removeProductLine,
  updateDiscount,
  registerPayment,
  deleteServiceOrder,
} from "@/actions/serviceOrders";
import { PageHeader, Card, LinkButton, Badge, Field, Input, Select, Button } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusActions } from "@/components/StatusActions";
import { ServiceLineForm } from "@/components/ServiceLineForm";
import { ProductLineForm } from "@/components/ProductLineForm";
import {
  formatCurrency,
  formatDate,
  STATUS_COLORS,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";

export default async function OrdemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      services: true,
      products: true,
      payments: { orderBy: { date: "desc" } },
    },
  });

  if (!order) notFound();

  const [catalogServices, products] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const remaining = Math.max(0, order.total - order.paidAmount);
  const osNumber = `#${String(order.number).padStart(4, "0")}`;

  return (
    <div>
      <PageHeader
        title={`OS ${osNumber}`}
        description={`${order.customer.name} · ${order.vehicle.plate} — ${order.vehicle.brand} ${order.vehicle.model}`}
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href={`/ordens/${order.id}/imprimir`} variant="secondary">
              <Printer className="h-4 w-4" /> Imprimir
            </LinkButton>
            <LinkButton href={`/ordens/${order.id}/editar`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar dados
            </LinkButton>
            {order.status === "ABERTA" && (
              <form action={deleteServiceOrder}>
                <input type="hidden" name="id" value={order.id} />
                <DeleteButton label="Excluir" />
              </form>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
              <span className="text-xs text-slate-500">{formatDate(order.date)}</span>
            </div>

            <div className="text-sm space-y-2 pt-2 border-t border-slate-100">
              <p>
                <span className="text-slate-500">Cliente: </span>
                <Link href={`/clientes/${order.customer.id}`} className="text-blue-600 hover:underline">
                  {order.customer.name}
                </Link>
              </p>
              <p>
                <span className="text-slate-500">Veículo: </span>
                <Link href={`/veiculos/${order.vehicle.id}`} className="text-blue-600 hover:underline">
                  {order.vehicle.plate} — {order.vehicle.brand} {order.vehicle.model}
                </Link>
              </p>
              <p className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">KM na entrada: </span>
                {order.mileage.toLocaleString("pt-BR")}
              </p>
              {order.reportedProblem && (
                <div>
                  <p className="text-slate-500">Problema informado:</p>
                  <p className="text-slate-700">{order.reportedProblem}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-slate-500">Observações:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <StatusActions orderId={order.id} status={order.status} />
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Pagamento</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pago</span>
                <span className="font-medium text-emerald-600">{formatCurrency(order.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Restante</span>
                <span className="font-medium text-red-600">{formatCurrency(remaining)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Status</span>
                <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>

            {remaining > 0 && (
              <form action={registerPayment.bind(null, order.id)} className="space-y-2 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Forma" htmlFor="method">
                    <Select id="method" name="method" defaultValue="PIX">
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Valor (R$)" htmlFor="amount">
                    <Input id="amount" name="amount" type="number" step="0.01" min={0.01} max={remaining} defaultValue={remaining} />
                  </Field>
                </div>
                <Button type="submit" className="w-full">
                  Registrar pagamento
                </Button>
              </form>
            )}

            {order.payments.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-xs text-slate-600">
                    <span>
                      {PAYMENT_METHOD_LABELS[p.method]} · {formatDate(p.date)}
                    </span>
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Serviços realizados</h2>
            {order.services.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-2 font-medium">Descrição</th>
                      <th className="py-2 pr-2 font-medium">Qtd.</th>
                      <th className="py-2 pr-2 font-medium">Valor unit.</th>
                      <th className="py-2 pr-2 font-medium">Subtotal</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.services.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2 pr-2">{line.description}</td>
                        <td className="py-2 pr-2">{line.quantity}</td>
                        <td className="py-2 pr-2">{formatCurrency(line.unitPrice)}</td>
                        <td className="py-2 pr-2 font-medium">{formatCurrency(line.subtotal)}</td>
                        <td className="py-2 text-right">
                          <form action={removeServiceLine}>
                            <input type="hidden" name="lineId" value={line.id} />
                            <input type="hidden" name="orderId" value={order.id} />
                            <DeleteButton confirmMessage="Remover este serviço?" />
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {order.status !== "CANCELADA" && order.status !== "ENTREGUE" && (
              <ServiceLineForm action={addServiceLine.bind(null, order.id)} services={catalogServices} />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Peças utilizadas</h2>
            {order.products.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-2 font-medium">Descrição</th>
                      <th className="py-2 pr-2 font-medium">Qtd.</th>
                      <th className="py-2 pr-2 font-medium">Valor unit.</th>
                      <th className="py-2 pr-2 font-medium">Subtotal</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.products.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2 pr-2">{line.description}</td>
                        <td className="py-2 pr-2">{line.quantity}</td>
                        <td className="py-2 pr-2">{formatCurrency(line.unitPrice)}</td>
                        <td className="py-2 pr-2 font-medium">{formatCurrency(line.subtotal)}</td>
                        <td className="py-2 text-right">
                          <form action={removeProductLine}>
                            <input type="hidden" name="lineId" value={line.id} />
                            <input type="hidden" name="orderId" value={order.id} />
                            <DeleteButton confirmMessage="Remover esta peça?" />
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {order.status !== "CANCELADA" && order.status !== "ENTREGUE" && (
              <ProductLineForm action={addProductLine.bind(null, order.id)} products={products} />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Totais</h2>
            <div className="space-y-2 text-sm max-w-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Total de serviços</span>
                <span>{formatCurrency(order.servicesTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total de peças</span>
                <span>{formatCurrency(order.productsTotal)}</span>
              </div>
              <form action={updateDiscount.bind(null, order.id)} className="flex justify-between items-center gap-2">
                <label htmlFor="discount" className="text-slate-500">
                  Desconto (R$)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={order.discount}
                    className="w-28 py-1.5"
                  />
                  <Button type="submit" variant="secondary" className="px-2.5 py-1.5 text-xs">
                    Aplicar
                  </Button>
                </div>
              </form>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
