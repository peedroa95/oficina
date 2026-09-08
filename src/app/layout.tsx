import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Flash } from "@/components/Flash";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sistema Oficina",
  description: "Controle interno da oficina mecânica",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">
        <div className="lg:flex">
          <Sidebar workshopName={settings.name} />
          <main className="flex-1 min-w-0 p-4 lg:p-8">
            <Suspense fallback={null}>
              <Flash />
            </Suspense>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
