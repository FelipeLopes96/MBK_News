import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Container from "@/app/components/Container";
import Etiqueta from "@/app/components/Etiqueta";
import SectionHeader from "@/app/components/SectionHeader";
import VideoCard from "@/app/components/VideoCard";
import VideoEmbed from "@/app/components/VideoEmbed";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import { formatarData } from "@/lib/datas";
import { rotuloDaCategoria } from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";
import {
  getNoticiasDoVideo,
  getTodosOsVideos,
  getVideoPorSlug,
  getVideosRelacionados,
  paraCardDeVideo,
} from "@/lib/videos";
import { urlDeAssistir, urlDoEmbed } from "@/lib/youtube";

/** Quantos outros vídeos são oferecidos no fim da página. */
const RELACIONADOS = 4;

export function generateStaticParams() {
  return getTodosOsVideos().map((video) => ({ slug: video.slug }));
}

export async function generateMetadata(
  props: PageProps<"/videos/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const video = getVideoPorSlug(slug);

  if (!video) {
    return { title: `Vídeo não encontrado | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: video.title,
    descricao: video.descricao,
    caminho: `/videos/${video.slug}`,
    imagem: video.thumbnail,
    tipo: "article",
  });
}

export default async function VideoPage(props: PageProps<"/videos/[slug]">) {
  const { slug } = await props.params;
  const video = getVideoPorSlug(slug);

  if (!video) {
    notFound();
  }

  const noticias = getNoticiasDoVideo(video);
  const relacionados = getVideosRelacionados(video, RELACIONADOS);

  return (
    <Container largura="leitura" como="article">
      <Breadcrumbs
        trilha={[
          { rotulo: "Vídeos", href: "/videos" },
          { rotulo: video.title },
        ]}
      />

      <div className="mt-5">
        {/*
          O player é o primeiro elemento da página, mas só carrega o iframe no
          clique — quem chega pelo link não paga um megabyte de JavaScript para
          ler o título.
        */}
        <VideoEmbed
          videoId={video.videoId}
          titulo={video.title}
          thumbnail={video.thumbnail}
          formato={video.formato}
          urlDoEmbed={urlDoEmbed(video.videoId)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Etiqueta href={`/${video.categoria}`}>
          {rotuloDaCategoria(video.categoria)}
        </Etiqueta>

        {video.publicadoEm ? (
          <time
            dateTime={video.publicadoEm}
            className="text-xs font-semibold uppercase tracking-wide text-texto-fraco"
          >
            {formatarData(video.publicadoEm)}
          </time>
        ) : null}

        {video.duracao ? (
          <>
            <span aria-hidden="true" className="text-texto-fraco/70">
              •
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-fraco">
              {video.duracao}
            </span>
          </>
        ) : null}
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-texto sm:text-3xl">
        {video.title}
      </h1>

      {video.descricao ? (
        <p className="mt-4 text-lg leading-8 text-texto-corpo">
          {video.descricao}
        </p>
      ) : null}

      {/* Crédito da origem: o vídeo é incorporado, não nosso. */}
      <p className="mt-4 text-xs leading-5 text-texto-fraco">
        {video.canal ? `Canal: ${video.canal} · ` : null}
        <a
          href={urlDeAssistir(video.videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-linha-forte transition-colors hover:text-marca-clara"
        >
          Assistir no YouTube
        </a>
      </p>

      {video.conteudo ? (
        <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
          <Markdown components={componentesDeMarkdown}>
            {video.conteudo}
          </Markdown>
        </div>
      ) : null}

      {noticias.length > 0 ? (
        <section className="mt-12">
          <SectionHeader titulo="Notícias relacionadas" />
          <ul className="mt-4 divide-y divide-linha border-t border-linha">
            {noticias.map((noticia) => (
              <li key={noticia.slug}>
                <Link
                  href={`/noticia/${noticia.slug}`}
                  className="group flex flex-col gap-1.5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
                >
                  <Etiqueta variante="texto">
                    {rotuloDaCategoria(noticia.categoria)}
                  </Etiqueta>
                  <span className="font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara">
                    {noticia.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relacionados.length > 0 ? (
        <section className="mt-12">
          <SectionHeader titulo="Mais vídeos" />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {relacionados.map((outro) => (
              <VideoCard
                key={outro.slug}
                video={paraCardDeVideo(
                  outro,
                  rotuloDaCategoria(outro.categoria)
                )}
              />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
