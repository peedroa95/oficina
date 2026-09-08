"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/settings";

export async function updateSettings(formData: FormData) {
  const settings = await getSettings();

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    redirect(`/configuracoes?erro=${encodeURIComponent("Informe o nome da oficina.")}`);
  }

  await prisma.workshopSettings.update({
    where: { id: settings.id },
    data: {
      name,
      document: String(formData.get("document") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      whatsapp: String(formData.get("whatsapp") || "").trim() || null,
      address: String(formData.get("address") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      logo: String(formData.get("logo") || "").trim() || null,
    },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/", "layout");
  redirect(`/configuracoes?ok=${encodeURIComponent("Configurações salvas com sucesso.")}`);
}
