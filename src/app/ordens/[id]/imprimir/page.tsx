import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PrintButton } from "@/components/PrintButton";
import { LinkButton } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
} from "@/lib/format";

export default async function ImprimirOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, settings] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id },
      include: { customer: true, vehicle: true, services: true, products: true },
    }),
    getSettings(),
  ]);

  if (!order) notFound();

  const osNumber = `#${String(order.number).padStart(4, "0")}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <LinkButton href={`/ordens/${order.id}`} variant="secondary">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </LinkButton>
        <PrintButton />
      </div>

      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 print:border-0 print:rounded-none print:p-0">
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-start gap-3">
            {settings.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt="" className="h-14 w-14 object-contain" />
            )}
            <div>
              <h1 className="text-xl font-bold">{settings.name}</h1>
              {settings.document && <p className="text-sm">CNPJ/CPF: {settings.document}</p>}
              {settings.phone && <p className="text-sm">Telefone: {settings.phone}</p>}
              {settings.address && (
                <p className="text-sm">
                  {settings.address}
                  {settings.city ? `, ${settings.city}` : ""}
                  {settings.state ? `/${settings.state}` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Ordem de Serviço</p>
            <p className="text-2xl font-bold">{osNumber}</p>
            <p className="text-sm">{formatDate(order.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Dados do Cliente</p>
            <p className="font-medium">{order.customer.name}</p>
            {order.customer.document && <p>CPF/CNPJ: {order.customer.document}</p>}
            {(order.customer.whatsapp || order.customer.phone) && (
              <p>Telefone: {order.customer.whatsapp || order.customer.phone}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Dados do Veículo</p>
            <p className="font-medium">
              {order.vehicle.brand} {order.vehicle.model} {order.vehicle.year && `(${order.vehicle.year})`}
            </p>
            <p>Placa: {order.vehicle.plate}</p>
            <p>Quilometragem: {order.mileage.toLocaleString("pt-BR")} km</p>
          </div>
        </div>

        {order.reportedProblem && (
          <div className="mb-4 text-sm">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Problema informado</p>
            <p>{order.reportedProblem}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Serviços realizados</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-400 text-left">
                <th className="py-1.5">Descrição</th>
                <th className="py-1.5 text-right w-16">Qtd.</th>
                <th className="py-1.5 text-right w-24">Valor</th>
                <th className="py-1.5 text-right w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-2 text-slate-400 italic">
                    Nenhum serviço registrado
                  </td>
                </tr>
              ) : (
                order.services.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-1.5">{s.description}</td>
                    <td className="py-1.5 text-right">{s.quantity}</td>
                    <td className="py-1.5 text-right">{formatCurrency(s.unitPrice)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(s.subtotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-1">Peças utilizadas</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-400 text-left">
                <th className="py-1.5">Descrição</th>
                <th className="py-1.5 text-right w-16">Qtd.</th>
                <th className="py-1.5 text-right w-24">Valor</th>
                <th className="py-1.5 text-right w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-2 text-slate-400 italic">
                    Nenhuma peça registrada
                  </td>
                </tr>
              ) : (
                order.products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5">{p.description}</td>
                    <td className="py-1.5 text-right">{p.quantity}</td>
                    <td className="py-1.5 text-right">{formatCurrency(p.unitPrice)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(p.subtotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-4">
          <div className="w-64 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal serviços</span>
              <span>{formatCurrency(order.servicesTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal peças</span>
              <span>{formatCurrency(order.productsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 border-slate-800 pt-1">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <p>
            <span className="text-slate-500">Forma de pagamento: </span>
            {order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] : "Não informada"}
          </p>
          <p>
            <span className="text-slate-500">Status da OS: </span>
            {STATUS_LABELS[order.status]}
          </p>
        </div>

        {order.notes && (
          <div className="mb-8 text-sm">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Observações</p>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-12 mt-16 text-sm text-center">
          <div>
            <div className="border-t border-slate-800 pt-1">Assinatura do cliente</div>
          </div>
          <div>
            <div className="border-t border-slate-800 pt-1">Assinatura / Responsável pela oficina</div>
          </div>
        </div>
      </div>
    </div>
  );
}
