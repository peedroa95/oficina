"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function readCustomerForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    document: String(formData.get("document") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    whatsapp: String(formData.get("whatsapp") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createCustomer(formData: FormData) {
  const data = readCustomerForm(formData);

  if (!data.name) {
    redirect(`/clientes/novo?erro=${encodeURIComponent("Informe o nome do cliente.")}`);
  }

  const customer = await prisma.customer.create({ data });
  revalidatePath("/clientes");
  redirect(`/clientes/${customer.id}?ok=${encodeURIComponent("Cliente cadastrado com sucesso.")}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const data = readCustomerForm(formData);

  if (!data.name) {
    redirect(`/clientes/${id}/editar?erro=${encodeURIComponent("Informe o nome do cliente.")}`);
  }

  await prisma.customer.update({ where: { id }, data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}?ok=${encodeURIComponent("Cliente atualizado com sucesso.")}`);
}

export async function deleteCustomer(formData: FormData) {
  const id = String(formData.get("id"));

  const vehicleCount = await prisma.vehicle.count({ where: { customerId: id } });
  const orderCount = await prisma.serviceOrder.count({ where: { customerId: id } });

  if (vehicleCount > 0 || orderCount > 0) {
    redirect(
      `/clientes/${id}?erro=${encodeURIComponent(
        "Não é possível excluir: cliente possui veículos ou ordens de serviço vinculadas."
      )}`
    );
  }

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect(`/clientes?ok=${encodeURIComponent("Cliente excluído com sucesso.")}`);
}
