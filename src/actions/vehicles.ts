"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function readVehicleForm(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") || ""),
    plate: String(formData.get("plate") || "").trim().toUpperCase(),
    brand: String(formData.get("brand") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: String(formData.get("year") || "").trim() || null,
    color: String(formData.get("color") || "").trim() || null,
    mileage: Number(formData.get("mileage") || 0),
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createVehicle(formData: FormData) {
  const data = readVehicleForm(formData);

  if (!data.customerId || !data.plate || !data.brand || !data.model) {
    redirect(
      `/veiculos/novo?clienteId=${data.customerId}&erro=${encodeURIComponent(
        "Preencha cliente, placa, marca e modelo."
      )}`
    );
  }

  const vehicle = await prisma.vehicle.create({ data });
  revalidatePath("/veiculos");
  revalidatePath(`/clientes/${data.customerId}`);
  redirect(`/veiculos/${vehicle.id}?ok=${encodeURIComponent("Veículo cadastrado com sucesso.")}`);
}

export async function updateVehicle(id: string, formData: FormData) {
  const data = readVehicleForm(formData);

  if (!data.customerId || !data.plate || !data.brand || !data.model) {
    redirect(`/veiculos/${id}/editar?erro=${encodeURIComponent("Preencha cliente, placa, marca e modelo.")}`);
  }

  await prisma.vehicle.update({ where: { id }, data });
  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${id}`);
  redirect(`/veiculos/${id}?ok=${encodeURIComponent("Veículo atualizado com sucesso.")}`);
}

export async function deleteVehicle(formData: FormData) {
  const id = String(formData.get("id"));
  const customerId = String(formData.get("customerId"));

  const orderCount = await prisma.serviceOrder.count({ where: { vehicleId: id } });
  if (orderCount > 0) {
    redirect(
      `/veiculos/${id}?erro=${encodeURIComponent(
        "Não é possível excluir: veículo possui ordens de serviço vinculadas."
      )}`
    );
  }

  await prisma.vehicle.delete({ where: { id } });
  revalidatePath("/veiculos");
  redirect(`/clientes/${customerId}?ok=${encodeURIComponent("Veículo excluído com sucesso.")}`);
}
