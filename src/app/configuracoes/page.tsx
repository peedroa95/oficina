import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/actions/settings";
import { PageHeader, Card, Field, Input, Button } from "@/components/ui";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações da oficina" description="Esses dados aparecem na nota de serviço impressa" />
      <Card className="p-6">
        <form action={updateSettings} className="space-y-4">
          {erro && (
            <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">{erro}</p>
          )}

          <Field label="Nome da oficina" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={settings.name} required />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CPF/CNPJ" htmlFor="document">
              <Input id="document" name="document" defaultValue={settings.document ?? ""} />
            </Field>
            <Field label="Telefone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp" htmlFor="whatsapp">
              <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp ?? ""} />
            </Field>
            <Field label="Logo (URL da imagem)" htmlFor="logo">
              <Input id="logo" name="logo" defaultValue={settings.logo ?? ""} placeholder="https://..." />
            </Field>
          </div>

          <Field label="Endereço" htmlFor="address">
            <Input id="address" name="address" defaultValue={settings.address ?? ""} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cidade" htmlFor="city">
              <Input id="city" name="city" defaultValue={settings.city ?? ""} />
            </Field>
            <Field label="Estado" htmlFor="state">
              <Input id="state" name="state" defaultValue={settings.state ?? ""} placeholder="UF" maxLength={2} />
            </Field>
          </div>

          <div className="pt-2">
            <Button type="submit">Salvar configurações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
