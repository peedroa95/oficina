"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseMoney } from "@/lib/format";

function readProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    code: String(formData.get("code") || "").trim() || null,
    brand: String(formData.get("brand") || "").trim() || null,
    quantity: Math.max(0, Math.trunc(Number(formData.get("quantity") || 0))),
    minStock: Math.max(0, Math.trunc(Number(formData.get("minStock") || 0))),
    costPrice: parseMoney(String(formData.get("costPrice") || "0")),
    salePrice: parseMoney(String(formData.get("salePrice") || "0")),
  };
}

export async function createProduct(formData: FormData) {
  const data = readProductForm(formData);

  if (!data.name) {
    redirect(`/estoque/novo?erro=${encodeURIComponent("Informe o nome da peça/produto.")}`);
  }

  await prisma.product.create({ data });
  revalidatePath("/estoque");
  redirect(`/estoque?ok=${encodeURIComponent("Produto cadastrado com sucesso.")}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const { quantity: _quantity, ...data } = readProductForm(formData);
  void _quantity;

  if (!data.name) {
    redirect(`/estoque/${id}/editar?erro=${encodeURIComponent("Informe o nome da peça/produto.")}`);
  }

  await prisma.product.update({ where: { id }, data });
  revalidatePath("/estoque");
  redirect(`/estoque?ok=${encodeURIComponent("Produto atualizado com sucesso.")}`);
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id"));

  const usageCount = await prisma.serviceOrderProduct.count({ where: { productId: id } });
  if (usageCount > 0) {
    redirect(
      `/estoque?erro=${encodeURIComponent("Não é possível excluir: produto já foi usado em ordens de serviço.")}`
    );
  }

  await prisma.stockMovement.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/estoque");
  redirect(`/estoque?ok=${encodeURIComponent("Produto excluído com sucesso.")}`);
}

export async function addStock(formData: FormData) {
  const id = String(formData.get("id"));
  const quantity = Math.trunc(Number(formData.get("quantity") || 0));
  const reason = String(formData.get("reason") || "").trim() || null;

  if (quantity <= 0) {
    redirect(`/estoque/${id}?erro=${encodeURIComponent("Informe uma quantidade válida para entrada.")}`);
  }

  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { quantity: { increment: quantity } } }),
    prisma.stockMovement.create({ data: { productId: id, type: "ENTRADA", quantity, reason } }),
  ]);

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}?ok=${encodeURIComponent("Estoque atualizado com sucesso.")}`);
}

export async function removeStock(formData: FormData) {
  const id = String(formData.get("id"));
  const quantity = Math.trunc(Number(formData.get("quantity") || 0));
  const reason = String(formData.get("reason") || "").trim() || null;

  if (quantity <= 0) {
    redirect(`/estoque/${id}?erro=${encodeURIComponent("Informe uma quantidade válida para saída.")}`);
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.quantity < quantity) {
    redirect(`/estoque/${id}?erro=${encodeURIComponent("Estoque insuficiente para essa saída.")}`);
  }

  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { quantity: { decrement: quantity } } }),
    prisma.stockMovement.create({ data: { productId: id, type: "SAIDA", quantity, reason } }),
  ]);

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}?ok=${encodeURIComponent("Estoque atualizado com sucesso.")}`);
}
