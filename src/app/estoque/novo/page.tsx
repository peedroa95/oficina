import { createProduct } from "@/actions/products";
import { ProductForm } from "@/components/ProductForm";
import { PageHeader, Card } from "@/components/ui";

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="max-w-xl">
      <PageHeader title="Novo produto" />
      <Card className="p-6">
        <ProductForm action={createProduct} errorMessage={erro} />
      </Card>
    </div>
  );
}
