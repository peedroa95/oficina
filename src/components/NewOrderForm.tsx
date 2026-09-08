"use client";

import { useMemo, useState } from "react";
import { Field, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";

type VehicleOption = { id: string; plate: string; brand: string; model: string; mileage: number };
type CustomerOption = { id: string; name: string; vehicles: VehicleOption[] };

export function NewOrderForm({
  action,
  customers,
  defaultCustomerId,
  defaultVehicleId,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  customers: CustomerOption[];
  defaultCustomerId?: string;
  defaultVehicleId?: string;
  errorMessage?: string;
}) {
  const initialCustomerId =
    defaultCustomerId || customers.find((c) => c.vehicles.some((v) => v.id === defaultVehicleId))?.id || "";

  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [vehicleId, setVehicleId] = useState(defaultVehicleId || "");

  const vehicles = useMemo(
    () => customers.find((c) => c.id === customerId)?.vehicles || [],
    [customers, customerId]
  );

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <form action={action} className="space-y-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Field label="Cliente" htmlFor="customerId" required>
        <Select
          id="customerId"
          name="customerId"
          required
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setVehicleId("");
          }}
        >
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

      <Field label="Veículo" htmlFor="vehicleId" required>
        <Select
          id="vehicleId"
          name="vehicleId"
          required
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          disabled={!customerId}
        >
          <option value="" disabled>
            {customerId ? "Selecione o veículo" : "Selecione o cliente primeiro"}
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate} — {v.brand} {v.model}
            </option>
          ))}
        </Select>
        {customerId && vehicles.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Este cliente não possui veículos cadastrados.{" "}
            <a href={`/veiculos/novo?clienteId=${customerId}`} className="underline">
              Cadastrar veículo
            </a>
          </p>
        )}
      </Field>

      <Field label="Quilometragem atual" htmlFor="mileage">
        <Input
          id="mileage"
          name="mileage"
          type="number"
          min={0}
          defaultValue={selectedVehicle?.mileage ?? 0}
          key={selectedVehicle?.id}
        />
      </Field>

      <Field label="Problema informado pelo cliente" htmlFor="reportedProblem">
        <Textarea id="reportedProblem" name="reportedProblem" rows={3} placeholder="Descreva o que o cliente relatou..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Abrir ordem de serviço</Button>
        <LinkButton href="/ordens" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
