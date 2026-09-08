import { Field, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";
import type { Vehicle, Customer } from "@prisma/client";

export function VehicleForm({
  action,
  vehicle,
  customers,
  defaultCustomerId,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  vehicle?: Vehicle;
  customers: Customer[];
  defaultCustomerId?: string;
  errorMessage?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Field label="Cliente" htmlFor="customerId" required>
        <Select id="customerId" name="customerId" defaultValue={vehicle?.customerId ?? defaultCustomerId ?? ""} required>
          <option value="" disabled>
            Selecione o cliente
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Placa" htmlFor="plate" required>
          <Input
            id="plate"
            name="plate"
            defaultValue={vehicle?.plate}
            required
            placeholder="ABC1D23"
            className="uppercase"
          />
        </Field>
        <Field label="Quilometragem" htmlFor="mileage">
          <Input id="mileage" name="mileage" type="number" min={0} defaultValue={vehicle?.mileage ?? 0} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Marca" htmlFor="brand" required>
          <Input id="brand" name="brand" defaultValue={vehicle?.brand} required placeholder="Ex: Chevrolet" />
        </Field>
        <Field label="Modelo" htmlFor="model" required>
          <Input id="model" name="model" defaultValue={vehicle?.model} required placeholder="Ex: Onix" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ano" htmlFor="year">
          <Input id="year" name="year" defaultValue={vehicle?.year ?? ""} placeholder="2020" />
        </Field>
        <Field label="Cor" htmlFor="color">
          <Input id="color" name="color" defaultValue={vehicle?.color ?? ""} placeholder="Prata" />
        </Field>
      </div>

      <Field label="Observações" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={vehicle?.notes ?? ""} rows={3} />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Salvar</Button>
        <LinkButton href={vehicle ? `/veiculos/${vehicle.id}` : "/veiculos"} variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
