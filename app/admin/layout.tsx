import type { Metadata } from "next";

/**
 * O painel é interno: `noindex` para não aparecer em busca nem em preview de
 * link. O acesso em si é barrado pelo `proxy.ts` e pela checagem de sessão
 * dentro de cada Server Action — isto aqui é só higiene de SEO.
 */
export const metadata: Metadata = {
  title: "Painel editorial | O Corner",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex-1 bg-[#141414]">{children}</div>;
}
