export const money = (value: number | string) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value));
export const dateBR = (value: Date | string) => new Intl.DateTimeFormat('pt-BR').format(new Date(value));
export const statusLabel: Record<string,string> = {ABERTA:'Aberta',AGUARDANDO_DIAGNOSTICO:'Aguardando diagnóstico',AGUARDANDO_APROVACAO:'Aguardando aprovação',EM_ANDAMENTO:'Em andamento',AGUARDANDO_PECA:'Aguardando peça',FINALIZADA:'Finalizada',ENTREGUE:'Entregue',CANCELADA:'Cancelada'};
