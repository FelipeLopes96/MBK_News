/**
 * Regras da busca — o que roda no navegador.
 *
 * Este módulo não pode importar nada que leia disco: quem filtra é a página de
 * resultados, no cliente. A montagem do índice, que precisa do conteúdo, vive
 * em `lib/indiceDeBusca.ts` e só roda no build. É a mesma separação que
 * `lib/navegacao.ts` faz com as categorias.
 */

export type TipoDeResultado =
  | "noticia"
  | "arquivo"
  | "arsenal"
  | "organizacao"
  | "lenda"
  | "momento";

export type ItemDoIndice = {
  titulo: string;
  href: string;
  /** Rótulo da procedência — categoria da matéria, tipo da entidade. */
  rotulo: string;
  tipo: TipoDeResultado;
  resumo?: string;
  /** Data ISO, quando o item tem uma. Ordena os resultados. */
  data?: string;
  /**
   * Texto em que a busca casa: título, resumo, rótulo e apelidos, já sem acento
   * e em minúsculas. Fica pronto no build para o cliente não normalizar o
   * acervo inteiro a cada tecla digitada.
   */
  chave: string;
};

/** Minúsculas e sem acento: é assim que "muay thái" acha "Muay Thai". */
export function normalizar(texto: string): string {
  return (
    texto
      .normalize("NFD")
      // Descarta os acentos que o NFD separou da letra.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
  );
}

/**
 * Filtra o índice por um termo livre. Todos os pedaços do termo precisam
 * aparecer no item — digitar mais palavras estreita o resultado em vez de
 * alargá-lo, que é o que se espera de uma busca.
 */
export function filtrar(indice: ItemDoIndice[], termo: string): ItemDoIndice[] {
  const pedacos = normalizar(termo).split(/\s+/).filter(Boolean);

  if (pedacos.length === 0) {
    return [];
  }

  return indice.filter((item) =>
    pedacos.every((pedaco) => item.chave.includes(pedaco))
  );
}
