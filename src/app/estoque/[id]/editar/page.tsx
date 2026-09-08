import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/actions/products";
import { ProductForm } from "@/components/ProductForm";
import { PageHeader, Card } from "@/components/ui";

export default async function EditarProdutoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div className="max-w-xl">
      <PageHeader title="Editar produto" />
      <Card className="p-6">
        <ProductForm action={action} product={product} errorMessage={erro} />
      </Card>
    </div>
  );
}
