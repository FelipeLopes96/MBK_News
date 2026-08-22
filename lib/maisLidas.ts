import slugs from "@/content/mais-lidas.json";
import { getNoticiaPorSlug, type Noticia } from "@/lib/noticias";

/**
 * Ranking de mais lidas, curado pela redação em `content/mais-lidas.json` —
 * uma lista de slugs, da primeira para a quinta posição.
 *
 * É curado, e não medido, porque o site é estático e não há de onde ler
 * audiência no build: o Vercel Analytics coleta mas não expõe leitura, e
 * contador próprio exigiria sair do modelo estático. Preferi uma lista que a
 * redação controla a estampar "mais lidas" sobre um critério que não é
 * audiência — ordenar por data e chamar de mais lida seria mentir para o
 * leitor.
 *
 * Com a lista vazia o módulo não aparece, em vez de aparecer com o rótulo
 * errado.
 */

export const MAIS_LIDAS_NO_RANKING = 5;

export function getMaisLidas(): Noticia[] {
  return (slugs as string[])
    .slice(0, MAIS_LIDAS_NO_RANKING)
    .map((slug) => {
      const noticia = getNoticiaPorSlug(slug);

      // Slug errado no JSON sumiria da lista sem aviso, e o ranking apareceria
      // com uma posição a menos sem ninguém entender por quê.
      if (!noticia && process.env.NODE_ENV !== "production") {
        console.warn(
          `[mais-lidas] slug "${slug}" não corresponde a nenhuma matéria.`
        );
      }

      return noticia;
    })
    .filter((noticia): noticia is Noticia => noticia !== undefined);
}
