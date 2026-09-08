import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, LinkButton, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const lowStock = products.filter((p) => p.quantity <= p.minStock);

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Controle de peças e produtos"
        action={
          <LinkButton href="/estoque/novo">
            <Plus className="h-4 w-4" /> Novo produto
          </LinkButton>
        }
      />

      {lowStock.length > 0 && (
        <Card className="p-4 mb-4 border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>{lowStock.length} produto(s)</strong> com estoque baixo:{" "}
            {lowStock.map((p) => p.name).join(", ")}
          </div>
        </Card>
      )}

      <Card>
        {products.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            action={<LinkButton href="/estoque/novo">Cadastrar produto</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Qtd.</th>
                  <th className="px-4 py-3 font-medium">Mínimo</th>
                  <th className="px-4 py-3 font-medium">Preço venda</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const low = p.quantity <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/estoque/${p.id}`} className="font-medium text-blue-600 hover:underline">
                          {p.name}
                        </Link>
                        {p.brand && <span className="text-slate-400 text-xs ml-1">({p.brand})</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.code || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{p.minStock}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(p.salePrice)}</td>
                      <td className="px-4 py-3">
                        {low ? (
                          <Badge className="bg-red-100 text-red-700">Estoque baixo</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
