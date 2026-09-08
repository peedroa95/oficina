"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Select, Input, Button } from "@/components/ui";

type ServiceOption = { id: string; name: string; defaultPrice: number };

export function ServiceLineForm({
  action,
  services,
}: {
  action: (formData: FormData) => void;
  services: ServiceOption[];
}) {
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [serviceId, setServiceId] = useState("");

  function handleCatalogChange(id: string) {
    setServiceId(id);
    const service = services.find((s) => s.id === id);
    if (service) {
      setDescription(service.name);
      setUnitPrice(String(service.defaultPrice));
    }
  }

  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-50 rounded-lg p-3">
      <input type="hidden" name="serviceId" value={serviceId} />

      <div className="sm:col-span-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">Do catálogo</label>
        <Select value={serviceId} onChange={(e) => handleCatalogChange(e.target.value)}>
          <option value="">Personalizado...</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
        <Input
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Troca de óleo"
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Qtd.</label>
        <Input name="quantity" type="number" step="0.01" min={0.01} defaultValue={1} required />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">Valor unit. (R$)</label>
        <Input
          name="unitPrice"
          type="number"
          step="0.01"
          min={0}
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-1">
        <Button type="submit" className="w-full" title="Adicionar serviço">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
