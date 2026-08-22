import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Container from "@/app/components/Container";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import DadosEstruturados from "@/app/components/DadosEstruturados";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import MaisLidas from "@/app/components/MaisLidas";
import NoticiasRelacionadas from "@/app/components/NoticiasRelacionadas";
import ShareButtons from "@/app/components/ShareButtons";
import TagsDaMateria from "@/app/components/TagsDaMateria";
import VideosRelacionados from "@/app/components/VideosRelacionados";
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
import { metadataDaPagina, NOME_DO_SITE, urlDoSite } from "@/lib/seo";

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
    publicadoEm: noticia.date,
    autor: noticia.autor,
    secao: rotuloDaCategoria(noticia.categoria),
    tags: noticia.tags,
  });
}

export default async function NoticiaPage(props: PageProps<"/noticia/[slug]">) {
  const { slug } = await props.params;
  const noticia = getNoticiaPorSlug(slug);

  if (!noticia) {
    notFound();
  }

  const rotulo = rotuloDaCategoria(noticia.categoria);

  return (
    <Container largura="leitura" como="article">
      <DadosEstruturados noticia={noticia} />

      <Breadcrumbs
        trilha={[
          { rotulo: "Notícias", href: "/noticias" },
          { rotulo, href: `/${noticia.categoria}` },
          { rotulo: noticia.title },
        ]}
      />

      {/*
        Manchete antes da foto, e não depois: quem abre a matéria vem para ler o
        que aconteceu. A foto entra em seguida, já com o texto lido — é a ordem
        que jornal usa, e a que o leitor espera.
      */}
      <header className="mt-5">
        <Etiqueta href={`/${noticia.categoria}`}>{rotulo}</Etiqueta>

        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-texto sm:text-[2.75rem] sm:leading-[1.1]">
          {noticia.title}
        </h1>

        {/* O olho da matéria; sem ele, o resumo faz esse papel. */}
        <p className="mt-4 text-lg leading-8 text-texto-corpo sm:text-xl sm:leading-9">
          {noticia.subtitulo ?? noticia.resumo}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-linha pt-4 text-xs font-semibold uppercase tracking-wide">
          <span className="text-texto-corpo">{noticia.autor}</span>
          <span aria-hidden="true" className="text-texto-fraco/70">
            •
          </span>
          <time dateTime={noticia.date} className="text-texto-fraco">
            {formatarData(noticia.date)}
          </time>
        </div>
      </header>

      <figure className="mt-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <ImagemNoticia
            src={noticia.imagem?.url}
            alt={noticia.title}
            sizes="(min-width: 768px) 768px, 100vw"
            posicao={noticia.imagem?.posicao}
            preload
          />
        </div>
        <figcaption>
          <CreditoDeImagem imagem={noticia.imagem} />
        </figcaption>
      </figure>

      <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
        <Markdown components={componentesDeMarkdown}>
          {noticia.conteudo}
        </Markdown>
      </div>

      <TagsDaMateria tags={noticia.tags} />

      <ShareButtons
        titulo={noticia.title}
        url={new URL(`/noticia/${noticia.slug}`, urlDoSite).toString()}
      />

      <BlocoDeFontes fontes={noticia.fontes} />

      {/*
        Vídeos ligados a esta matéria. A relação é declarada dentro do vídeo,
        então publicar um vídeo apontando para cá já o faz aparecer — sem editar
        o `.md` da matéria.
      */}
      <VideosRelacionados slugDaNoticia={noticia.slug} />

      <NoticiasRelacionadas noticia={noticia} />

      {/* Na coluna de leitura o ranking fecha a página; sem lista curada em
          `content/mais-lidas.json`, não renderiza. */}
      <MaisLidas className="mt-12" />
    </Container>
  );
}
