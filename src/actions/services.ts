"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseMoney } from "@/lib/format";

function readServiceForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    defaultPrice: parseMoney(String(formData.get("defaultPrice") || "0")),
  };
}

export async function createService(formData: FormData) {
  const data = readServiceForm(formData);

  if (!data.name) {
    redirect(`/servicos/novo?erro=${encodeURIComponent("Informe o nome do serviço.")}`);
  }
  if (data.defaultPrice < 0) {
    redirect(`/servicos/novo?erro=${encodeURIComponent("O valor não pode ser negativo.")}`);
  }

  await prisma.service.create({ data });
  revalidatePath("/servicos");
  redirect(`/servicos?ok=${encodeURIComponent("Serviço cadastrado com sucesso.")}`);
}

export async function updateService(id: string, formData: FormData) {
  const data = readServiceForm(formData);

  if (!data.name) {
    redirect(`/servicos/${id}/editar?erro=${encodeURIComponent("Informe o nome do serviço.")}`);
  }
  if (data.defaultPrice < 0) {
    redirect(`/servicos/${id}/editar?erro=${encodeURIComponent("O valor não pode ser negativo.")}`);
  }

  await prisma.service.update({ where: { id }, data });
  revalidatePath("/servicos");
  redirect(`/servicos?ok=${encodeURIComponent("Serviço atualizado com sucesso.")}`);
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.service.delete({ where: { id } });
  revalidatePath("/servicos");
  redirect(`/servicos?ok=${encodeURIComponent("Serviço excluído com sucesso.")}`);
}
