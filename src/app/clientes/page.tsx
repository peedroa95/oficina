import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, LinkButton, Input, EmptyState } from "@/components/ui";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { whatsapp: { contains: q } },
            { document: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { vehicles: true, serviceOrders: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes da oficina"
        action={
          <LinkButton href="/clientes/novo">
            <Plus className="h-4 w-4" /> Novo cliente
          </LinkButton>
        }
      />

      <Card className="p-4 mb-4">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, telefone ou CPF/CNPJ..."
              className="pl-9"
            />
          </div>
        </form>
      </Card>

      <Card>
        {customers.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Cadastre o primeiro cliente para começar."
            action={<LinkButton href="/clientes/novo">Cadastrar cliente</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                  <th className="px-4 py-3 font-medium">Veículos</th>
                  <th className="px-4 py-3 font-medium">OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${c.id}`} className="font-medium text-blue-600 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.whatsapp || c.phone || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.document || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{c._count.vehicles}</td>
                    <td className="px-4 py-3 text-slate-600">{c._count.serviceOrders}</td>
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
