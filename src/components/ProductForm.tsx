import { Field, Input, Button, LinkButton } from "@/components/ui";
import type { Product } from "@prisma/client";

export function ProductForm({
  action,
  product,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  product?: Product;
  errorMessage?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {errorMessage && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Field label="Nome do produto" htmlFor="name" required>
        <Input id="name" name="name" defaultValue={product?.name} required placeholder="Ex: Óleo 5W30" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Código" htmlFor="code">
          <Input id="code" name="code" defaultValue={product?.code ?? ""} placeholder="Ex: OL-5W30" />
        </Field>
        <Field label="Marca" htmlFor="brand">
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Quantidade em estoque" htmlFor="quantity" required>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            defaultValue={product?.quantity ?? 0}
            required
            disabled={!!product}
          />
        </Field>
        <Field label="Estoque mínimo" htmlFor="minStock">
          <Input id="minStock" name="minStock" type="number" min={0} defaultValue={product?.minStock ?? 0} />
        </Field>
      </div>
      {product && (
        <p className="text-xs text-slate-500 -mt-2">
          Para ajustar a quantidade, use "Adicionar estoque" ou "Retirar estoque" na página do produto.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Preço de custo (R$)" htmlFor="costPrice">
          <Input id="costPrice" name="costPrice" type="number" step="0.01" min={0} defaultValue={product?.costPrice ?? 0} />
        </Field>
        <Field label="Preço de venda (R$)" htmlFor="salePrice" required>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min={0}
            defaultValue={product?.salePrice ?? 0}
            required
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Salvar</Button>
        <LinkButton href="/estoque" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
