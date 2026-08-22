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
 * fixas.
 *
 * Vídeos entra condicionalmente porque a seção só faz sentido com biblioteca
 * montada — item de menu que abre em "em breve" gasta o espaço mais nobre da
 * navegação sem levar a nada. Publicar o primeiro vídeo o traz sozinho.
 * `/eventos` entra aqui quando a rota existir.
 */
export function secoesPrincipais(
  categorias: { slug: string; rotulo: string }[],
  {
    comEventos = false,
    comVideos = false,
  }: { comEventos?: boolean; comVideos?: boolean } = {}
): ItemDeNavegacao[] {
  return [
    { href: "/noticias", rotulo: "Notícias" },
    ...categorias.map((categoria) => ({
      href: `/${categoria.slug}`,
      rotulo: categoria.rotulo,
    })),
    ...(comEventos ? [{ href: "/eventos", rotulo: "Eventos" }] : []),
    ...(comVideos ? [{ href: "/videos", rotulo: "Vídeos" }] : []),
    { href: "/arquivo", rotulo: "Arquivo", subitens: secoesDoArquivo },
    { href: "/arsenal", rotulo: "Arsenal" },
  ];
}
