export type ItemDeNavegacao = {
  href: string;
  rotulo: string;
  /** Sub-seções, que o menu mobile expande no lugar. */
  subitens?: ItemDeNavegacao[];
};

/**
 * Navegação do portal.
 *
 * Vive aqui, e não em `lib/noticias.ts`, porque tanto a barra de seções quanto
 * o menu mobile rodam no cliente: importar um módulo que lê disco (`fs`)
 * arrastaria a leitura para o bundle do navegador. Daí as categorias entrarem
 * por parâmetro — quem as carrega é o Header, no servidor.
 */

/** Sub-seções do Arquivo, na ordem em que aparecem na navegação. */
export const secoesDoArquivo: ItemDeNavegacao[] = [
  { href: "/arquivo/organizacoes", rotulo: "Organizações" },
  { href: "/arquivo/lendas", rotulo: "Lendas" },
  { href: "/arquivo/momentos", rotulo: "Momentos" },
];

/**
 * Seções da barra principal: o acervo geral, uma por modalidade e as seções
 * fixas. `/videos` e `/eventos` entram aqui quando as rotas existirem — não
 * antes, para a barra não levar a lugar nenhum.
 */
export function secoesPrincipais(
  categorias: { slug: string; rotulo: string }[]
): ItemDeNavegacao[] {
  return [
    { href: "/noticias", rotulo: "Notícias" },
    ...categorias.map((categoria) => ({
      href: `/${categoria.slug}`,
      rotulo: categoria.rotulo,
    })),
    { href: "/arquivo", rotulo: "Arquivo", subitens: secoesDoArquivo },
    { href: "/arsenal", rotulo: "Arsenal" },
  ];
}
