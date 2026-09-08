import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteService } from "@/actions/services";
import { PageHeader, Card, LinkButton, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency } from "@/lib/format";

export default async function ServicosPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços oferecidos pela oficina"
        action={
          <LinkButton href="/servicos/novo">
            <Plus className="h-4 w-4" /> Novo serviço
          </LinkButton>
        }
      />

      <Card>
        {services.length === 0 ? (
          <EmptyState
            title="Nenhum serviço cadastrado"
            action={<LinkButton href="/servicos/novo">Cadastrar serviço</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Valor padrão</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.description || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(s.defaultPrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/servicos/${s.id}/editar`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deleteService}>
                          <input type="hidden" name="id" value={s.id} />
                          <DeleteButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
