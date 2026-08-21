"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ItemDeNavegacao } from "@/lib/navegacao";

/**
 * Barra de seções do portal, com a seção atual marcada.
 *
 * A seção ativa é descoberta pela rota, e não declarada por página: nenhuma
 * tela precisa se anunciar, e a marcação continua certa se a rota mudar de
 * lugar. É o mesmo princípio que a barra do Arquivo já usava.
 *
 * Recebe os itens por prop porque a lista nasce das categorias, que vivem num
 * módulo que lê o disco — importá-lo aqui arrastaria `node:fs` para o bundle do
 * navegador.
 */
export default function Navegacao({ itens }: { itens: ItemDeNavegacao[] }) {
  const caminho = usePathname();

  /** Vale para a seção e para o que está dentro dela: /mma/pagina/2 é "MMA". */
  const ativa = (href: string) =>
    caminho === href || caminho.startsWith(`${href}/`);

  return (
    <ul className="mx-auto flex max-w-6xl gap-x-6 overflow-x-auto px-6">
      {itens.map((item) => (
        <li key={item.href} className="shrink-0">
          <Link
            href={item.href}
            aria-current={ativa(item.href) ? "page" : undefined}
            className={`-mb-px inline-block border-b-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca ${
              ativa(item.href)
                ? "border-marca text-texto"
                : "border-transparent text-texto-suave hover:text-texto"
            }`}
          >
            {item.rotulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}
