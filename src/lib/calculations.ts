export type PricedItem={quantity:number;unitPrice:number};
export function orderTotal(services:PricedItem[],products:PricedItem[],discount:number){if(discount<0||[...services,...products].some(i=>i.quantity<=0||i.unitPrice<0))throw new Error('Valores da ordem são inválidos.');return Math.max(0,[...services,...products].reduce((sum,i)=>sum+i.quantity*i.unitPrice,0)-discount)}
export function paymentSituation(total:number,paid:number):'PENDENTE'|'PARCIAL'|'PAGO'{if(paid<=0)return 'PENDENTE';return paid>=total?'PAGO':'PARCIAL'}
