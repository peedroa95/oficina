import {statusLabel} from '@/lib/format';
const colors:Record<string,string>={ABERTA:'bg-blue-100 text-blue-700',AGUARDANDO_APROVACAO:'bg-orange-100 text-orange-700',EM_ANDAMENTO:'bg-amber-100 text-amber-700',FINALIZADA:'bg-emerald-100 text-emerald-700',ENTREGUE:'bg-emerald-100 text-emerald-700',CANCELADA:'bg-red-100 text-red-700',AGUARDANDO_PECA:'bg-purple-100 text-purple-700',AGUARDANDO_DIAGNOSTICO:'bg-slate-100 text-slate-700'};
export function StatusBadge({status}:{status:string}){return <span className={`badge ${colors[status]||'bg-slate-100'}`}>{statusLabel[status]||status}</span>}
