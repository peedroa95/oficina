import { Field, Input, Textarea, Button, LinkButton } from "@/components/ui";
import type { Service } from "@prisma/client";

export function ServiceForm({
  action,
  service,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  service?: Service;
  errorMessage?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Field label="Nome do serviço" htmlFor="name" required>
        <Input id="name" name="name" defaultValue={service?.name} required placeholder="Ex: Troca de óleo" />
      </Field>

      <Field label="Descrição" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={service?.description ?? ""} rows={2} />
      </Field>

      <Field label="Valor padrão (R$)" htmlFor="defaultPrice" required>
        <Input
          id="defaultPrice"
          name="defaultPrice"
          type="number"
          step="0.01"
          min={0}
          defaultValue={service?.defaultPrice ?? 0}
          required
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Salvar</Button>
        <LinkButton href="/servicos" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
