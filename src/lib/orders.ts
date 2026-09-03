import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from './prisma';

export async function changeOrderStatus(id:string,status:OrderStatus){
 return prisma.$transaction(async tx=>{
  const order=await tx.serviceOrder.findUniqueOrThrow({where:{id},include:{products:true}});
  if(status==='FINALIZADA'&&!order.stockDeducted){
   for(const item of order.products){const product=await tx.product.findUniqueOrThrow({where:{id:item.productId}});if(product.quantity<item.quantity)throw new Error(`Estoque insuficiente para ${product.name}`);await tx.product.update({where:{id:product.id},data:{quantity:{decrement:item.quantity}}});await tx.stockMovement.create({data:{productId:product.id,serviceOrderId:id,type:'SAIDA',quantity:item.quantity,reason:`Baixa da OS #${order.number}`}})}
   return tx.serviceOrder.update({where:{id},data:{status,stockDeducted:true,completedAt:new Date()}});
  }
  if(status==='CANCELADA'&&order.stockDeducted){for(const item of order.products){await tx.product.update({where:{id:item.productId},data:{quantity:{increment:item.quantity}}});await tx.stockMovement.create({data:{productId:item.productId,serviceOrderId:id,type:'ESTORNO',quantity:item.quantity,reason:`Cancelamento da OS #${order.number}`}})}return tx.serviceOrder.update({where:{id},data:{status,stockDeducted:false}})}
  return tx.serviceOrder.update({where:{id},data:{status}});
 });
}
export async function receivePayment(orderId:string,amount:number,method:string){
 if(amount<=0)throw new Error('Informe um valor positivo.');
 return prisma.$transaction(async tx=>{
  const order=await tx.serviceOrder.findUniqueOrThrow({where:{id:orderId},include:{payments:true}});
  const paid=order.payments.reduce((sum,p)=>sum+Number(p.amount),0),remaining=Number(order.total)-paid;
  if(amount>remaining+0.001)throw new Error('O pagamento é maior que o valor restante.');
  const payment=await tx.payment.create({data:{serviceOrderId:orderId,amount:new Prisma.Decimal(amount),method}});
  await tx.financialTransaction.create({data:{description:`Recebimento OS #${order.number}`,category:'Venda de serviços',type:'ENTRADA',amount:new Prisma.Decimal(amount),paymentMethod:method,paymentId:payment.id}});
  const totalPaid=paid+amount; await tx.serviceOrder.update({where:{id:orderId},data:{paymentStatus:totalPaid>=Number(order.total)?PaymentStatus.PAGO:PaymentStatus.PARCIAL,paymentMethod:method}});
  return payment;
 });
}
