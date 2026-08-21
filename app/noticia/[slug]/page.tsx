import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import Etiqueta from "@/app/components/Etiqueta";
import Header from "@/app/components/Header";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import {
  formatarData,
  getNoticiaPorSlug,
  getTodasNoticias,
  rotuloDaCategoria,
} from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

export function generateStaticParams() {
  return getTodasNoticias().map((noticia) => ({ slug: noticia.slug }));
}

export async function generateMetadata(
  props: PageProps<"/noticia/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const noticia = getNoticiaPorSlug(slug);

  if (!noticia) {
    return { title: `Notícia não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: noticia.title,
    descricao: noticia.resumo,
    caminho: `/noticia/${noticia.slug}`,
    imagem: noticia.imagem?.url,
    tipo: "article",
  });
}

export default async function NoticiaPage(props: PageProps<"/noticia/[slug]">) {
  const { slug } = await props.params;
  const noticia = getNoticiaPorSlug(slug);

  if (!noticia) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-fundo">
      <Header />

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <ImagemNoticia
            src={noticia.imagem?.url}
            alt={noticia.title}
            sizes="(min-width: 768px) 768px, 100vw"
            posicao={noticia.imagem?.posicao}
            preload
          />
        </div>
        <CreditoDeImagem imagem={noticia.imagem} />

        <div className="mt-8 flex items-center gap-3">
          <Etiqueta href={`/${noticia.categoria}`}>
            {rotuloDaCategoria(noticia.categoria)}
          </Etiqueta>
          <time
            dateTime={noticia.date}
            className="text-xs font-semibold uppercase tracking-wide text-texto-fraco"
          >
            {formatarData(noticia.date)}
          </time>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-texto sm:text-4xl">
          {noticia.title}
        </h1>

        <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
          <Markdown components={componentesDeMarkdown}>
            {noticia.conteudo}
          </Markdown>
        </div>

        <BlocoDeFontes fontes={noticia.fontes} />

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-medium text-marca-clara hover:underline"
        >
          ← Voltar para as notícias
        </Link>
      </article>
    </div>
  );
}
