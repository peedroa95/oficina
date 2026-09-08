"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseMoney } from "@/lib/format";

export async function createExpense(formData: FormData) {
  const description = String(formData.get("description") || "").trim();
  const amount = parseMoney(String(formData.get("amount") || "0"));
  const category = String(formData.get("category") || "").trim() || null;
  const dateInput = String(formData.get("date") || "");
  const date = dateInput ? new Date(`${dateInput}T12:00:00`) : new Date();

  if (!description) {
    redirect(`/financeiro?erro=${encodeURIComponent("Informe a descrição da saída.")}`);
  }
  if (amount <= 0) {
    redirect(`/financeiro?erro=${encodeURIComponent("Informe um valor válido.")}`);
  }

  await prisma.financialTransaction.create({
    data: { type: "SAIDA", description, amount, category, date },
  });

  revalidatePath("/financeiro");
  redirect(`/financeiro?ok=${encodeURIComponent("Saída registrada com sucesso.")}`);
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id"));

  const transaction = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!transaction) redirect(`/financeiro?erro=${encodeURIComponent("Lançamento não encontrado.")}`);

  if (transaction.serviceOrderId) {
    redirect(
      `/financeiro?erro=${encodeURIComponent("Não é possível excluir lançamentos gerados por ordens de serviço.")}`
    );
  }

  await prisma.financialTransaction.delete({ where: { id } });
  revalidatePath("/financeiro");
  redirect(`/financeiro?ok=${encodeURIComponent("Lançamento excluído.")}`);
}
