import { prisma } from "@/lib/prisma";

export async function getSettings() {
  let settings = await prisma.workshopSettings.findFirst();
  if (!settings) {
    settings = await prisma.workshopSettings.create({
      data: { name: "Minha Oficina" },
    });
  }
  return settings;
}
