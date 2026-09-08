import { Field, Input, Textarea, Button, LinkButton } from "@/components/ui";
import type { Customer } from "@prisma/client";

export function CustomerForm({
  action,
  customer,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  customer?: Customer;
  errorMessage?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Field label="Nome completo" htmlFor="name" required>
        <Input id="name" name="name" defaultValue={customer?.name} required placeholder="Ex: João da Silva" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="CPF ou CNPJ" htmlFor="document">
          <Input id="document" name="document" defaultValue={customer?.document ?? ""} placeholder="000.000.000-00" />
        </Field>
        <Field label="Telefone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} placeholder="(00) 00000-0000" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" defaultValue={customer?.whatsapp ?? ""} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="Endereço" htmlFor="address">
          <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
        </Field>
      </div>

      <Field label="Observações" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} rows={3} />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Salvar</Button>
        <LinkButton href={customer ? `/clientes/${customer.id}` : "/clientes"} variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
