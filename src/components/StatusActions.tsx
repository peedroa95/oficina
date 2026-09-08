import { changeStatus } from "@/actions/serviceOrders";
import { Button } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

const FLOW: Record<string, { next: string; label: string } | undefined> = {
  ABERTA: { next: "EM_ANDAMENTO", label: "Iniciar atendimento" },
  EM_ANDAMENTO: { next: "FINALIZADA", label: "Finalizar OS" },
  FINALIZADA: { next: "ENTREGUE", label: "Marcar como entregue" },
};

export function StatusActions({ orderId, status }: { orderId: string; status: string }) {
  const action = changeStatus.bind(null, orderId);
  const next = FLOW[status];
  const canCancel = status === "ABERTA" || status === "EM_ANDAMENTO";

  if (!next && !canCancel) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {next && (
        <form action={action}>
          <input type="hidden" name="status" value={next.next} />
          <Button type="submit">{next.label}</Button>
        </form>
      )}
      {canCancel && (
        <form action={action}>
          <input type="hidden" name="status" value="CANCELADA" />
          <ConfirmSubmitButton confirmMessage="Cancelar esta ordem de serviço?">Cancelar OS</ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
