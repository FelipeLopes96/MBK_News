import { NOME_DO_SITE, REDES_SOCIAIS, urlDoSite } from "@/lib/seo";
import type { Noticia } from "@/lib/noticias";

/**
 * Dados estruturados da matéria, no vocabulário `NewsArticle` do schema.org.
 *
 * É a mesma informação que já está visível na página — manchete, foto, data,
 * assinatura, veículo — repetida numa forma que agregador de notícias e
 * buscador leem sem adivinhar. Para um portal jornalístico isso é o que
 * qualifica a matéria como notícia datada e assinada, e não como página
 * qualquer.
 *
 * Fica ao lado do conteúdo de propósito: se a página mudar, o dado muda com
 * ela, em vez de virar uma descrição paralela que envelhece sozinha.
 */
export default function DadosEstruturados({ noticia }: { noticia: Noticia }) {
  const url = new URL(`/noticia/${noticia.slug}`, urlDoSite).toString();

  const dados = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.title,
    description: noticia.resumo,
    datePublished: noticia.date,
    // Sem histórico de edição no conteúdo, a data de publicação é o melhor
    // dado disponível — e omitir seria pior do que repetir.
    dateModified: noticia.date,
    articleSection: noticia.categoria,
    keywords: noticia.tags.length > 0 ? noticia.tags.join(", ") : undefined,
    inLanguage: "pt-BR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: noticia.autor },
    publisher: {
      "@type": "Organization",
      name: NOME_DO_SITE,
      logo: {
        "@type": "ImageObject",
        url: new URL("/marca/mbk-news.png", urlDoSite).toString(),
      },
      // `sameAs` é como o buscador entende que o portal e o perfil na rede
      // social são o mesmo veículo, e não duas entidades parecidas.
      sameAs: REDES_SOCIAIS.map(({ url: perfil }) => perfil),
    },
    ...(noticia.imagem
      ? { image: [new URL(noticia.imagem.url, urlDoSite).toString()] }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // O conteúdo é JSON serializado por nós, não entrada de terceiro.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
