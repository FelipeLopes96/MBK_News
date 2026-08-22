import type { MetadataRoute } from "next";
import { getTodos as getArtigos } from "@/lib/arquivo";
import { getTodos as getReviews } from "@/lib/arsenal";
import { getLendas, getMomentos, getOrganizacoes } from "@/lib/entidades";
import {
  categorias,
  getNoticiasPorCategoria,
  getTodasNoticias,
  getTotalDePaginas,
  getTotalDePaginasGeral,
} from "@/lib/noticias";
import { urlDoSite } from "@/lib/seo";
import { getTodosOsVideos } from "@/lib/videos";

/**
 * Sitemap do portal.
 *
 * É gerado a partir do próprio conteúdo, e não escrito à mão: publicar uma
 * matéria já a coloca aqui. A `lastModified` vem da data do conteúdo — para o
 * buscador, dizer "mudou agora" em toda página a cada build é o mesmo que não
 * dizer nada.
 *
 * Ficam fora /admin (interno) e /busca (página de resultado, não conteúdo).
 */

function url(caminho: string): string {
  return new URL(caminho, urlDoSite).toString();
}

/** Data ISO mais recente de uma lista, para as páginas de listagem. */
function maisRecente(datas: string[]): Date | undefined {
  const ordenadas = datas.filter(Boolean).sort((a, b) => b.localeCompare(a));
  return ordenadas[0] ? new Date(ordenadas[0]) : undefined;
}

/** Página 1 é canônica na raiz da seção; as demais moram em /pagina/n. */
function paginasDaSecao(base: string, total: number): string[] {
  return Array.from({ length: Math.max(0, total - 1) }, (_, indice) =>
    `${base}/pagina/${indice + 2}`
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const noticias = getTodasNoticias();
  const artigos = getArtigos();
  const reviews = getReviews();
  const organizacoes = getOrganizacoes();
  const lendas = getLendas();
  const momentos = getMomentos();

  const atualizacaoDasNoticias = maisRecente(noticias.map((n) => n.date));

  const home: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      lastModified: atualizacaoDasNoticias,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const acervo: MetadataRoute.Sitemap = [
    {
      url: url("/noticias"),
      lastModified: atualizacaoDasNoticias,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...paginasDaSecao("/noticias", getTotalDePaginasGeral()).map((caminho) => ({
      url: url(caminho),
      lastModified: atualizacaoDasNoticias,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  const secoesDeCategoria: MetadataRoute.Sitemap = categorias.flatMap(
    (categoria) => {
      const daCategoria = getNoticiasPorCategoria(categoria.slug);
      const atualizacao = maisRecente(daCategoria.map((n) => n.date));

      return [
        {
          url: url(`/${categoria.slug}`),
          lastModified: atualizacao,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
        ...paginasDaSecao(
          `/${categoria.slug}`,
          getTotalDePaginas(categoria.slug)
        ).map((caminho) => ({
          url: url(caminho),
          lastModified: atualizacao,
          changeFrequency: "weekly" as const,
          priority: 0.4,
        })),
      ];
    }
  );

  const materias: MetadataRoute.Sitemap = noticias.map((noticia) => ({
    url: url(`/noticia/${noticia.slug}`),
    lastModified: new Date(noticia.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const arquivo: MetadataRoute.Sitemap = [
    {
      url: url("/arquivo"),
      lastModified: maisRecente(artigos.map((a) => a.date)),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...artigos.map((artigo) => ({
      url: url(`/arquivo/${artigo.slug}`),
      lastModified: new Date(artigo.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  // Entidades do Arquivo são conteúdo histórico: mudam pouco e não têm data de
  // publicação, então vão sem `lastModified`.
  const entidades: MetadataRoute.Sitemap = [
    { caminho: "/arquivo/organizacoes", itens: organizacoes },
    { caminho: "/arquivo/lendas", itens: lendas },
    { caminho: "/arquivo/momentos", itens: momentos },
  ].flatMap(({ caminho, itens }) => [
    {
      url: url(caminho),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...itens.map((item) => ({
      url: url(`${caminho}/${item.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ]);

  // A biblioteca só entra no sitemap quando existe: uma seção vazia indexada é
  // uma URL que o buscador visita para não achar nada.
  const videos = getTodosOsVideos();
  const secaoDeVideos: MetadataRoute.Sitemap =
    videos.length === 0
      ? []
      : [
          {
            url: url("/videos"),
            lastModified: maisRecente(videos.map((v) => v.publicadoEm)),
            changeFrequency: "weekly",
            priority: 0.8,
          },
          ...videos.map((video) => ({
            url: url(`/videos/${video.slug}`),
            lastModified: video.publicadoEm
              ? new Date(video.publicadoEm)
              : undefined,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          })),
        ];

  const arsenal: MetadataRoute.Sitemap = [
    {
      url: url("/arsenal"),
      lastModified: maisRecente(reviews.map((r) => r.date)),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...reviews.map((review) => ({
      url: url(`/arsenal/${review.slug}`),
      lastModified: new Date(review.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [
    ...home,
    ...acervo,
    ...secoesDeCategoria,
    ...materias,
    ...secaoDeVideos,
    ...arquivo,
    ...entidades,
    ...arsenal,
  ];
}
