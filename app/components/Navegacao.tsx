"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuSuspenso, { type ItemDoMenu } from "@/app/components/MenuSuspenso";
import {
  chaveDoItem,
  enderecosDoItem,
  type SecaoDeNavegacao,
} from "@/lib/navegacao";

/**
 * Barra de seções do portal, com a seção atual marcada.
 *
 * A seção ativa é descoberta pela rota, e não declarada por página: nenhuma
 * tela precisa se anunciar, e a marcação continua certa se a rota mudar de
 * lugar. É o mesmo princípio que a barra do Arquivo já usava.
 *
 * Item com subitens abre um menu em vez de virar link — as seis modalidades
 * enfileiradas estouravam a largura da barra. Quando o item também é uma página,
 * como o Arquivo, ela entra no menu como primeira opção: sem isso, agrupar
 * tornaria /arquivo inalcançável pela navegação.
 *
 * Recebe os itens por prop porque a lista nasce das categorias, que vivem num
 * módulo que lê o disco — importá-lo aqui arrastaria `node:fs` para o bundle do
 * navegador.
 */
export default function Navegacao({ itens }: { itens: SecaoDeNavegacao[] }) {
  const caminho = usePathname();

  /** Vale para a seção e para o que está dentro dela: /mma/pagina/2 é "MMA". */
  const ativa = (href: string) =>
    caminho === href || caminho.startsWith(`${href}/`);

  /*
   * Sem `overflow-x-auto` aqui, ao contrário da versão enfileirada: um eixo em
   * `auto` promove o outro para `auto` pela especificação, e o painel do menu,
   * que é posicionado fora da caixa da barra, era recortado na altura da linha —
   * o menu abria e não aparecia. Com seis itens não há mais o que rolar, e o
   * `flex-wrap` cobre o caso de uma seção nova entrar.
   */
  return (
    <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-6 px-6">
      {itens.map((item) => {
        const dentroDoGrupo = enderecosDoItem(item).some(ativa);

        if (item.subitens?.length) {
          const itensDoMenu: ItemDoMenu[] = [
            // O item que também é página abre o menu com ela; agrupador puro,
            // como "Modalidades", não tem página para oferecer.
            ...(item.href
              ? [{ href: item.href, rotulo: `Tudo em ${item.rotulo}` }]
              : []),
            ...item.subitens.map((subitem) => ({
              href: subitem.href ?? "",
              rotulo: subitem.rotulo,
            })),
          ];

          return (
            <li key={chaveDoItem(item)} className="shrink-0">
              <MenuSuspenso
                rotulo={item.rotulo}
                itens={itensDoMenu}
                ativo={dentroDoGrupo}
              />
            </li>
          );
        }

        return (
          <li key={chaveDoItem(item)} className="shrink-0">
            <Link
              href={item.href ?? "/"}
              aria-current={dentroDoGrupo ? "page" : undefined}
              className={`inline-block border-b-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca ${
                dentroDoGrupo
                  ? "border-marca text-texto"
                  : "border-transparent text-texto-suave hover:text-texto"
              }`}
            >
              {item.rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
