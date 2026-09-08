import { notFound } from "next/navigation";
import { Pencil, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteProduct, addStock, removeStock } from "@/actions/products";
import { PageHeader, Card, LinkButton, Badge, Field, Input, Button, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function ProdutoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { stockMovements: { orderBy: { date: "desc" }, take: 20 } },
  });

  if (!product) notFound();

  const low = product.quantity <= product.minStock;

  return (
    <div>
      <PageHeader
        title={product.name}
        description={product.code ? `Código: ${product.code}` : undefined}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/estoque/${product.id}/editar`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar
            </LinkButton>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <DeleteButton label="Excluir" />
            </form>
          </div>
        }
      />

      {erro && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 mb-4">{erro}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase">Quantidade atual</p>
            <p className="text-3xl font-bold mt-1">{product.quantity}</p>
            <div className="mt-1">
              {low ? (
                <Badge className="bg-red-100 text-red-700">Estoque baixo (mín. {product.minStock})</Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700">Estoque OK</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-sm">
              <div>
                <p className="text-slate-500">Custo</p>
                <p className="font-medium">{formatCurrency(product.costPrice)}</p>
              </div>
              <div>
                <p className="text-slate-500">Venda</p>
                <p className="font-medium">{formatCurrency(product.salePrice)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <ArrowUpCircle className="h-4 w-4 text-emerald-600" /> Adicionar estoque
            </h3>
            <form action={addStock} className="space-y-3">
              <input type="hidden" name="id" value={product.id} />
              <Field label="Quantidade" htmlFor="qty-add">
                <Input id="qty-add" name="quantity" type="number" min={1} defaultValue={1} required />
              </Field>
              <Field label="Motivo (opcional)" htmlFor="reason-add">
                <Input id="reason-add" name="reason" placeholder="Ex: Compra de fornecedor" />
              </Field>
              <Button type="submit" variant="secondary" className="w-full">
                Adicionar
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <ArrowDownCircle className="h-4 w-4 text-red-600" /> Retirar estoque
            </h3>
            <form action={removeStock} className="space-y-3">
              <input type="hidden" name="id" value={product.id} />
              <Field label="Quantidade" htmlFor="qty-remove">
                <Input id="qty-remove" name="quantity" type="number" min={1} max={product.quantity} defaultValue={1} required />
              </Field>
              <Field label="Motivo (opcional)" htmlFor="reason-remove">
                <Input id="reason-remove" name="reason" placeholder="Ex: Ajuste de inventário" />
              </Field>
              <Button type="submit" variant="secondary" className="w-full">
                Retirar
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Movimentações recentes</h2>
            {product.stockMovements.length === 0 ? (
              <EmptyState title="Nenhuma movimentação registrada" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                      <th className="py-2 pr-4 font-medium">Data</th>
                      <th className="py-2 pr-4 font-medium">Tipo</th>
                      <th className="py-2 pr-4 font-medium">Quantidade</th>
                      <th className="py-2 pr-4 font-medium">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.stockMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 pr-4 text-slate-600">{formatDateTime(m.date)}</td>
                        <td className="py-2 pr-4">
                          {m.type === "ENTRADA" ? (
                            <Badge className="bg-emerald-100 text-emerald-700">Entrada</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">Saída</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4 font-medium">{m.quantity}</td>
                        <td className="py-2 pr-4 text-slate-600">{m.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
