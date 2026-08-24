/** Item que é sempre uma página: modalidade, sub-seção do Arquivo, link do rodapé. */
export type ItemDeNavegacao = {
  href: string;
  rotulo: string;
};

/**
 * Item da barra principal. O `href` é opcional aqui, e só aqui: "Modalidades"
 * abre a lista das seis, mas não é uma página do portal. Nos subitens ele
 * continua obrigatório — sub-seção sem endereço não levaria a lugar nenhum.
 */
export type SecaoDeNavegacao = {
  href?: string;
  rotulo: string;
  /** Sub-seções, que a barra abre num menu e o mobile expande no lugar. */
  subitens?: ItemDeNavegacao[];
};

/** Chave estável para listar: agrupador não tem href. */
export function chaveDoItem(secao: SecaoDeNavegacao): string {
  return secao.href ?? secao.rotulo;
}

/**
 * Os endereços que fazem uma seção ser a atual — o dela, se tiver, e os dos
 * subitens. É o que marca "Modalidades" quando o leitor está em /boxe.
 */
export function enderecosDoItem(secao: SecaoDeNavegacao): string[] {
  return [
    ...(secao.href ? [secao.href] : []),
    ...(secao.subitens ?? []).map((subitem) => subitem.href),
  ];
}

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
 * Seções da barra principal: o acervo geral, o grupo das modalidades e as seções
 * fixas.
 *
 * As seis modalidades ficam sob um item só. Enfileiradas, elas eram seis dos
 * onze itens da barra e empurravam Arquivo e Arsenal para fora da tela em
 * notebook — a barra virava uma faixa de rolagem horizontal, que é onde item de
 * navegação vai para nunca ser visto. Agrupadas, sobram seis itens e todos
 * caberem de uma vez.
 *
 * Vídeos entra condicionalmente porque a seção só faz sentido com biblioteca
 * montada — item de menu que abre em "em breve" gasta o espaço mais nobre da
 * navegação sem levar a nada. Publicar o primeiro vídeo o traz sozinho.
 */
export function secoesPrincipais(
  categorias: { slug: string; rotulo: string }[],
  {
    comEventos = false,
    comVideos = false,
  }: { comEventos?: boolean; comVideos?: boolean } = {}
): SecaoDeNavegacao[] {
  return [
    { href: "/noticias", rotulo: "Notícias" },
    {
      rotulo: "Modalidades",
      subitens: categorias.map((categoria) => ({
        href: `/${categoria.slug}`,
        rotulo: categoria.rotulo,
      })),
    },
    ...(comEventos ? [{ href: "/eventos", rotulo: "Eventos" }] : []),
    ...(comVideos ? [{ href: "/videos", rotulo: "Vídeos" }] : []),
    { href: "/arquivo", rotulo: "Arquivo", subitens: secoesDoArquivo },
    { href: "/arsenal", rotulo: "Arsenal" },
  ];
}
