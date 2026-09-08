"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Select, Input, Button } from "@/components/ui";

type ProductOption = { id: string; name: string; salePrice: number; quantity: number };

export function ProductLineForm({
  action,
  products,
}: {
  action: (formData: FormData) => void;
  products: ProductOption[];
}) {
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [productId, setProductId] = useState("");

  function handleCatalogChange(id: string) {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) {
      setDescription(product.name);
      setUnitPrice(String(product.salePrice));
    }
  }

  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-50 rounded-lg p-3">
      <input type="hidden" name="productId" value={productId} />

      <div className="sm:col-span-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">Do estoque</label>
        <Select value={productId} onChange={(e) => handleCatalogChange(e.target.value)}>
          <option value="">Personalizado...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (estoque: {p.quantity})
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
          placeholder="Ex: Filtro de óleo"
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
        <Button type="submit" className="w-full" title="Adicionar peça">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
