import Link from "next/link";
import { Search as SearchIcon, Users, Car, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Input, Button, EmptyState } from "@/components/ui";
import { formatCurrency, STATUS_LABELS } from "@/lib/format";
import type { Prisma } from "@prisma/client";

type VehicleWithCustomer = Prisma.VehicleGetPayload<{ include: { customer: true } }>;
type OrderWithRelations = Prisma.ServiceOrderGetPayload<{ include: { customer: true; vehicle: true } }>;

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  let customers: Awaited<ReturnType<typeof prisma.customer.findMany>> = [];
  let vehicles: VehicleWithCustomer[] = [];
  let orders: OrderWithRelations[] = [];

  if (query) {
    const numericQuery = Number(query.replace(/\D/g, ""));

    [customers, vehicles, orders] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: [{ name: { contains: query } }, { phone: { contains: query } }, { whatsapp: { contains: query } }],
        },
        take: 10,
      }),
      prisma.vehicle.findMany({
        where: {
          OR: [{ plate: { contains: query } }, { brand: { contains: query } }, { model: { contains: query } }],
        },
        include: { customer: true },
        take: 10,
      }),
      prisma.serviceOrder.findMany({
        where: numericQuery ? { number: numericQuery } : { id: "__none__" },
        include: { customer: true, vehicle: true },
        take: 10,
      }),
    ]);
  }

  const hasResults = customers.length > 0 || vehicles.length > 0 || orders.length > 0;

  return (
    <div>
      <PageHeader title="Busca rápida" description="Cliente, telefone, placa, modelo ou número da OS" />

      <Card className="p-4 mb-6">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={query} placeholder="Digite para buscar..." className="pl-9" autoFocus />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </Card>

      {!query ? (
        <EmptyState title="Digite algo para buscar" description="Você pode buscar por nome, telefone, placa, modelo ou número da OS." />
      ) : !hasResults ? (
        <EmptyState title="Nenhum resultado encontrado" />
      ) : (
        <div className="space-y-6">
          {customers.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Clientes
              </h2>
              <ul className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <li key={c.id} className="py-2">
                    <Link href={`/clientes/${c.id}`} className="text-blue-600 hover:underline font-medium">
                      {c.name}
                    </Link>
                    <span className="text-slate-500 text-sm ml-2">{c.whatsapp || c.phone}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {vehicles.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Car className="h-4 w-4" /> Veículos
              </h2>
              <ul className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <li key={v.id} className="py-2">
                    <Link href={`/veiculos/${v.id}`} className="text-blue-600 hover:underline font-mono font-medium">
                      {v.plate}
                    </Link>
                    <span className="text-slate-600 text-sm ml-2">
                      {v.brand} {v.model} · {v.customer.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {orders.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Ordens de serviço
              </h2>
              <ul className="divide-y divide-slate-100">
                {orders.map((os) => (
                  <li key={os.id} className="py-2 flex items-center justify-between">
                    <div>
                      <Link href={`/ordens/${os.id}`} className="text-blue-600 hover:underline font-medium">
                        #{String(os.number).padStart(4, "0")}
                      </Link>
                      <span className="text-slate-600 text-sm ml-2">
                        {os.customer.name} · {os.vehicle.plate}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatCurrency(os.total)} · {STATUS_LABELS[os.status]}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
