import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, LinkButton, Input, EmptyState } from "@/components/ui";
import { formatMileage } from "@/lib/format";

export default async function VeiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const vehicles = await prisma.vehicle.findMany({
    where: q
      ? {
          OR: [
            { plate: { contains: q } },
            { brand: { contains: q } },
            { model: { contains: q } },
            { customer: { name: { contains: q } } },
          ],
        }
      : undefined,
    orderBy: { plate: "asc" },
    include: { customer: true },
  });

  return (
    <div>
      <PageHeader
        title="Veículos"
        description="Cadastro de veículos vinculados a clientes"
        action={
          <LinkButton href="/veiculos/novo">
            <Plus className="h-4 w-4" /> Novo veículo
          </LinkButton>
        }
      />

      <Card className="p-4 mb-4">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={q} placeholder="Buscar por placa, marca, modelo ou cliente..." className="pl-9" />
          </div>
        </form>
      </Card>

      <Card>
        {vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo encontrado"
            action={<LinkButton href="/veiculos/novo">Cadastrar veículo</LinkButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-medium">Placa</th>
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/veiculos/${v.id}`} className="font-mono font-semibold text-blue-600 hover:underline">
                        {v.plate}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {v.brand} {v.model} {v.year && `(${v.year})`}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${v.customer.id}`} className="text-slate-600 hover:underline">
                        {v.customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatMileage(v.mileage)}</td>
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
