"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseMoney } from "@/lib/format";
import type { Prisma } from "@prisma/client";

async function recalculateTotals(tx: Prisma.TransactionClient, orderId: string) {
  const [servicesAgg, productsAgg, order] = await Promise.all([
    tx.serviceOrderService.aggregate({ where: { serviceOrderId: orderId }, _sum: { subtotal: true } }),
    tx.serviceOrderProduct.aggregate({ where: { serviceOrderId: orderId }, _sum: { subtotal: true } }),
    tx.serviceOrder.findUniqueOrThrow({ where: { id: orderId } }),
  ]);

  const servicesTotal = servicesAgg._sum.subtotal || 0;
  const productsTotal = productsAgg._sum.subtotal || 0;
  const total = Math.max(0, servicesTotal + productsTotal - order.discount);
  const paymentStatus = order.paidAmount <= 0 ? "PENDENTE" : order.paidAmount >= total ? "PAGO" : "PARCIAL";

  await tx.serviceOrder.update({
    where: { id: orderId },
    data: { servicesTotal, productsTotal, total, paymentStatus },
  });
}

export async function createServiceOrder(formData: FormData) {
  const customerId = String(formData.get("customerId") || "");
  const vehicleId = String(formData.get("vehicleId") || "");
  const mileage = Math.max(0, Math.trunc(Number(formData.get("mileage") || 0)));
  const reportedProblem = String(formData.get("reportedProblem") || "").trim() || null;

  if (!customerId || !vehicleId) {
    redirect(`/ordens/nova?erro=${encodeURIComponent("Selecione o cliente e o veículo.")}`);
  }

  const last = await prisma.serviceOrder.findFirst({ orderBy: { number: "desc" } });
  const number = (last?.number || 0) + 1;

  const order = await prisma.serviceOrder.create({
    data: { number, customerId, vehicleId, mileage, reportedProblem },
  });

  revalidatePath("/ordens");
  redirect(`/ordens/${order.id}?ok=${encodeURIComponent("Ordem de serviço aberta com sucesso.")}`);
}

export async function updateServiceOrderInfo(id: string, formData: FormData) {
  const mileage = Math.max(0, Math.trunc(Number(formData.get("mileage") || 0)));
  const reportedProblem = String(formData.get("reportedProblem") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const paymentMethod = String(formData.get("paymentMethod") || "") || null;

  await prisma.serviceOrder.update({
    where: { id },
    data: {
      mileage,
      reportedProblem,
      notes,
      paymentMethod: paymentMethod as never,
    },
  });

  revalidatePath(`/ordens/${id}`);
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Dados atualizados com sucesso.")}`);
}

export async function addServiceLine(id: string, formData: FormData) {
  const serviceId = String(formData.get("serviceId") || "") || null;
  const description = String(formData.get("description") || "").trim();
  const quantity = parseMoney(String(formData.get("quantity") || "1")) || 1;
  const unitPrice = parseMoney(String(formData.get("unitPrice") || "0"));

  if (!description) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Informe a descrição do serviço.")}`);
  }
  if (quantity <= 0 || unitPrice < 0) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Quantidade e valor devem ser positivos.")}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrderService.create({
      data: {
        serviceOrderId: id,
        serviceId,
        description,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
      },
    });
    await recalculateTotals(tx, id);
  });

  revalidatePath(`/ordens/${id}`);
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Serviço adicionado.")}`);
}

export async function removeServiceLine(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const orderId = String(formData.get("orderId"));

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrderService.delete({ where: { id: lineId } });
    await recalculateTotals(tx, orderId);
  });

  revalidatePath(`/ordens/${orderId}`);
  redirect(`/ordens/${orderId}?ok=${encodeURIComponent("Serviço removido.")}`);
}

export async function addProductLine(id: string, formData: FormData) {
  const productId = String(formData.get("productId") || "") || null;
  const description = String(formData.get("description") || "").trim();
  const quantity = parseMoney(String(formData.get("quantity") || "1")) || 1;
  const unitPrice = parseMoney(String(formData.get("unitPrice") || "0"));

  if (!description) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Informe a descrição da peça.")}`);
  }
  if (quantity <= 0 || unitPrice < 0) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Quantidade e valor devem ser positivos.")}`);
  }

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product && product.quantity < quantity) {
      redirect(
        `/ordens/${id}?erro=${encodeURIComponent(
          `Estoque insuficiente de "${product.name}" (disponível: ${product.quantity}).`
        )}`
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrderProduct.create({
      data: {
        serviceOrderId: id,
        productId,
        description,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
      },
    });
    await recalculateTotals(tx, id);
  });

  revalidatePath(`/ordens/${id}`);
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Peça adicionada.")}`);
}

export async function removeProductLine(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const orderId = String(formData.get("orderId"));

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrderProduct.delete({ where: { id: lineId } });
    await recalculateTotals(tx, orderId);
  });

  revalidatePath(`/ordens/${orderId}`);
  redirect(`/ordens/${orderId}?ok=${encodeURIComponent("Peça removida.")}`);
}

export async function updateDiscount(id: string, formData: FormData) {
  const discount = Math.max(0, parseMoney(String(formData.get("discount") || "0")));

  await prisma.$transaction(async (tx) => {
    await tx.serviceOrder.update({ where: { id }, data: { discount } });
    await recalculateTotals(tx, id);
  });

  revalidatePath(`/ordens/${id}`);
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Desconto atualizado.")}`);
}

export async function registerPayment(id: string, formData: FormData) {
  const method = String(formData.get("method") || "DINHEIRO");
  const amount = parseMoney(String(formData.get("amount") || "0"));

  if (amount <= 0) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Informe um valor de pagamento válido.")}`);
  }

  const order = await prisma.serviceOrder.findUniqueOrThrow({ where: { id } });
  const remaining = order.total - order.paidAmount;
  if (amount > remaining + 0.009) {
    redirect(
      `/ordens/${id}?erro=${encodeURIComponent(
        `Valor maior que o restante a pagar (${remaining.toFixed(2)}).`
      )}`
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: { serviceOrderId: id, method: method as never, amount },
    });

    const newPaidAmount = order.paidAmount + amount;
    const paymentStatus = newPaidAmount <= 0 ? "PENDENTE" : newPaidAmount >= order.total ? "PAGO" : "PARCIAL";

    await tx.serviceOrder.update({
      where: { id },
      data: { paidAmount: newPaidAmount, paymentStatus, paymentMethod: method as never },
    });

    await tx.financialTransaction.create({
      data: {
        type: "ENTRADA",
        description: `Pagamento OS #${String(order.number).padStart(4, "0")}`,
        amount,
        category: "Ordem de serviço",
        serviceOrderId: id,
      },
    });
  });

  revalidatePath(`/ordens/${id}`);
  revalidatePath("/financeiro");
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Pagamento registrado.")}`);
}

const VALID_STATUSES = ["ABERTA", "EM_ANDAMENTO", "FINALIZADA", "ENTREGUE", "CANCELADA"];

export async function changeStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");

  if (!VALID_STATUSES.includes(status)) {
    redirect(`/ordens/${id}?erro=${encodeURIComponent("Status inválido.")}`);
  }

  const order = await prisma.serviceOrder.findUniqueOrThrow({
    where: { id },
    include: { products: true },
  });

  if (status === "FINALIZADA" && !order.stockDeducted) {
    try {
      await prisma.$transaction(async (tx) => {
        for (const line of order.products) {
          if (!line.productId) continue;
          const product = await tx.product.findUniqueOrThrow({ where: { id: line.productId } });
          if (product.quantity < line.quantity) {
            throw new Error(
              `Estoque insuficiente de "${product.name}" para finalizar (disponível: ${product.quantity}, necessário: ${line.quantity}).`
            );
          }
        }
        for (const line of order.products) {
          if (!line.productId) continue;
          await tx.product.update({
            where: { id: line.productId },
            data: { quantity: { decrement: line.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: line.productId,
              type: "SAIDA",
              quantity: line.quantity,
              reason: `Uso na OS #${String(order.number).padStart(4, "0")}`,
            },
          });
        }
        await tx.serviceOrder.update({ where: { id }, data: { status, stockDeducted: true } });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao finalizar a ordem.";
      redirect(`/ordens/${id}?erro=${encodeURIComponent(message)}`);
    }
  } else {
    await prisma.serviceOrder.update({ where: { id }, data: { status: status as never } });
  }

  revalidatePath(`/ordens/${id}`);
  revalidatePath("/estoque");
  revalidatePath("/dashboard");
  redirect(`/ordens/${id}?ok=${encodeURIComponent("Status atualizado.")}`);
}

export async function deleteServiceOrder(formData: FormData) {
  const id = String(formData.get("id"));

  const order = await prisma.serviceOrder.findUniqueOrThrow({ where: { id } });
  if (order.status !== "ABERTA") {
    redirect(
      `/ordens/${id}?erro=${encodeURIComponent(
        "Só é possível excluir ordens com status Aberta. Utilize Cancelar para as demais."
      )}`
    );
  }

  await prisma.serviceOrder.delete({ where: { id } });
  revalidatePath("/ordens");
  redirect(`/ordens?ok=${encodeURIComponent("Ordem de serviço excluída.")}`);
}
