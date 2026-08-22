import type { Metadata } from "next";
import Container from "@/app/components/Container";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CabecalhoDeEntidade from "@/app/components/CabecalhoDeEntidade";
import FichaDeEntidade from "@/app/components/FichaDeEntidade";
import NotaDoEditor from "@/app/components/NotaDoEditor";
import SecaoDaEntidade from "@/app/components/SecaoDaEntidade";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import NewsGrid from "@/app/components/NewsGrid";
import VideoCard from "@/app/components/VideoCard";
import { getLenda, getLendas, getOrganizacao } from "@/lib/entidades";
import {
  getNoticiasDoAtleta,
  rotuloDaCategoria as rotuloDaCategoriaDeNoticia,
} from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";
import { getVideosDoAtleta, paraCardDeVideo } from "@/lib/videos";

/** Tetos dos blocos: a página é ficha histórica, não feed do atleta. */
const NOTICIAS_NA_LENDA = 4;
const VIDEOS_NA_LENDA = 4;

export function generateStaticParams() {
  return getLendas().map((lenda) => ({ slug: lenda.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/lendas/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const lenda = getLenda(slug);

  if (!lenda) {
    return { title: `Lenda não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: lenda.nome,
    descricao: lenda.resumo,
    caminho: `/arquivo/lendas/${lenda.slug}`,
    imagem: lenda.imagem?.url,
    tipo: "article",
  });
}

export default async function LendaPage(
  props: PageProps<"/arquivo/lendas/[slug]">
) {
  const { slug } = await props.params;
  const lenda = getLenda(slug);

  if (!lenda) {
    notFound();
  }

  // Organizações resolvidas a partir dos slugs do frontmatter; as que ainda não
  // têm .md cadastrado simplesmente não viram link.
  const organizacoes = lenda.organizacoes
    .map((referencia) => getOrganizacao(referencia))
    .filter((organizacao) => organizacao !== undefined);

  const noticias = getNoticiasDoAtleta([lenda.nome, lenda.apelido]).slice(
    0,
    NOTICIAS_NA_LENDA
  );
  const videos = getVideosDoAtleta([lenda.nome, lenda.apelido]).slice(
    0,
    VIDEOS_NA_LENDA
  );

  const ficha = [
    { rotulo: "Modalidade", valor: lenda.modalidade },
    { rotulo: "Categoria", valor: lenda.categoria },
    { rotulo: "Período", valor: lenda.periodo },
    { rotulo: "Cartel", valor: lenda.cartel },
    {
      rotulo: "Primeira luta profissional",
      valor: lenda.primeiraLutaProfissional,
    },
  ];

  return (
    <Container largura="leitura">
      <CabecalhoDeEntidade
        trilha={[
          { rotulo: "Arquivo", href: "/arquivo" },
          { rotulo: "Lendas", href: "/arquivo/lendas" },
          { rotulo: lenda.nome },
        ]}
        rotulo="Lenda"
        titulo={lenda.nome}
        subtitulo={lenda.apelido ? `“${lenda.apelido}”` : undefined}
        resumo={lenda.resumo}
        imagem={lenda.imagem}
      />

      {organizacoes.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-texto-fraco">
            {organizacoes.length > 1 ? "Organizações" : "Organização"}
          </h2>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {organizacoes.map((organizacao) => (
              <Link
                key={organizacao.slug}
                href={`/arquivo/organizacoes/${organizacao.slug}`}
                className="font-medium text-marca-clara hover:underline"
              >
                {organizacao.nomeCompleto ?? organizacao.nome}
              </Link>
            ))}
          </p>
        </div>
      ) : null}

      <FichaDeEntidade linhas={ficha} />

      <SecaoDaEntidade titulo="Títulos" vazia={lenda.titulos.length === 0}>
        <ul className="space-y-3">
          {lenda.titulos.map((titulo) => (
            <li
              key={titulo.titulo}
              className="flex gap-2 text-base leading-7 text-texto-corpo"
            >
              <span aria-hidden className="text-marca-clara">
                ▪
              </span>
              <span>
                {titulo.titulo}
                {titulo.local ? (
                  <span className="text-texto-suave"> · {titulo.local}</span>
                ) : null}
                {/* A atribuição fica sob o título, e não ao lado, para o
                    leitor ver de imediato de onde vem a informação. */}
                {titulo.qualificacao ? (
                  <span className="mt-0.5 block text-xs leading-5 text-texto-fraco">
                    {titulo.qualificacao}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </SecaoDaEntidade>

      {/* Com título próprio, a matéria tem manchete; sem ele, "História" é só
          o rótulo da seção. */}
      <SecaoDaEntidade
        titulo={lenda.tituloDaHistoria ?? "História"}
        variante={lenda.tituloDaHistoria ? "titulo" : "rotulo"}
        vazia={!lenda.conteudo}
      >
        <div className={classeDoCorpoDaMateria}>
          <Markdown components={componentesDeMarkdown}>
            {lenda.conteudo}
          </Markdown>
        </div>
      </SecaoDaEntidade>

      <SecaoDaEntidade
        titulo="Grandes lutas"
        vazia={lenda.grandesLutas.length === 0}
      >
        <ul className="divide-y divide-linha rounded-lg border border-linha bg-superficie">
          {lenda.grandesLutas.map((luta) => {
            const contexto = [luta.evento, luta.ano]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={`${luta.titulo}-${luta.ano ?? ""}`} className="p-5">
                <p className="text-base font-semibold leading-snug text-texto">
                  {luta.titulo}
                </p>
                {contexto ? (
                  <p className="mt-1 text-xs text-texto-fraco">{contexto}</p>
                ) : null}
                {luta.resultado ? (
                  <p className="mt-2 text-sm leading-6 text-texto-suave">
                    {luta.resultado}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </SecaoDaEntidade>

      <SecaoDaEntidade titulo="Legado" vazia={!lenda.legado}>
        <p className="text-lg leading-8 text-texto-corpo">{lenda.legado}</p>
      </SecaoDaEntidade>

      {/*
        Notícias e vídeos são encontrados pelas tags — o nome e o apelido do
        atleta já são tag na cobertura. Sem lista dentro da lenda para manter em
        dia, e sem risco de as duas pontas discordarem.
      */}
      <SecaoDaEntidade titulo="No noticiário" vazia={noticias.length === 0}>
        <NewsGrid noticias={noticias} colunas={2} className="mt-0" />
      </SecaoDaEntidade>

      <SecaoDaEntidade titulo="Em vídeo" vazia={videos.length === 0}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {videos.map((video) => (
            <VideoCard
              key={video.slug}
              video={paraCardDeVideo(
                video,
                rotuloDaCategoriaDeNoticia(video.categoria)
              )}
            />
          ))}
        </div>
      </SecaoDaEntidade>

      <BlocoDeFontes fontes={lenda.fontes} />

      <NotaDoEditor nota={lenda.notaDoEditor} />
    </Container>
  );
}
