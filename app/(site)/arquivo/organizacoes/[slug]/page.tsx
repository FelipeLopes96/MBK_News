import type { Metadata } from "next";
import Container from "@/app/components/Container";
import { notFound, permanentRedirect } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CabecalhoDeEntidade from "@/app/components/CabecalhoDeEntidade";
import ConteudoCard from "@/app/components/ConteudoCard";
import GradeDeEntidades from "@/app/components/GradeDeEntidades";
import NewsGrid from "@/app/components/NewsGrid";
import SecaoDaEntidade from "@/app/components/SecaoDaEntidade";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import { getPorOrganizacao, rotuloDaCategoria } from "@/lib/arquivo";
import {
  getLendasDaOrganizacao,
  getMomentosDaOrganizacao,
  getOrganizacao,
  getOrganizacoes,
} from "@/lib/entidades";
import { getNoticiasPorOrganizacao } from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

/** Teto do bloco de notícias: o hub é acervo, não feed. */
const NOTICIAS_NO_HUB = 4;

export function generateStaticParams() {
  return getOrganizacoes().map((organizacao) => ({ slug: organizacao.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/organizacoes/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const organizacao = getOrganizacao(slug);

  if (!organizacao) {
    return { title: `Organização não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: organizacao.nome,
    descricao: organizacao.resumo,
    caminho: `/arquivo/organizacoes/${organizacao.slug}`,
    imagem: organizacao.imagem?.url,
    tipo: "article",
  });
}

export default async function OrganizacaoPage(
  props: PageProps<"/arquivo/organizacoes/[slug]">
) {
  const { slug } = await props.params;
  const organizacao = getOrganizacao(slug);

  if (!organizacao) {
    notFound();
  }

  // Chegou por um alias: manda para a URL canônica em vez de servir o mesmo
  // conteúdo em dois endereços.
  if (slug !== organizacao.slug) {
    permanentRedirect(`/arquivo/organizacoes/${organizacao.slug}`);
  }

  // Tudo aqui é descoberto pelos dados: marcar uma lenda, um momento ou um
  // artigo com o slug desta organização já o faz aparecer nas seções abaixo.
  const lendas = getLendasDaOrganizacao(organizacao);
  const momentos = getMomentosDaOrganizacao(organizacao);
  const artigos = getPorOrganizacao(organizacao);
  const noticias = getNoticiasPorOrganizacao(organizacao).slice(
    0,
    NOTICIAS_NO_HUB
  );

  const ficha = [
    { rotulo: "Modalidade", valor: organizacao.modalidade },
    { rotulo: "Fundação", valor: organizacao.fundacao },
    { rotulo: "Encerramento", valor: organizacao.encerramento },
    { rotulo: "Período", valor: organizacao.periodo },
    { rotulo: "Status", valor: organizacao.status },
    { rotulo: "País", valor: organizacao.pais },
    { rotulo: "Sede", valor: organizacao.sede },
    { rotulo: "Proprietário", valor: organizacao.proprietario },
  ].filter((linha) => linha.valor);

  return (
    <Container largura="leitura">
      <CabecalhoDeEntidade
        trilha={[
          { rotulo: "Arquivo", href: "/arquivo" },
          { rotulo: "Organizações", href: "/arquivo/organizacoes" },
          { rotulo: organizacao.nome },
        ]}
        rotulo="Organização"
        titulo={organizacao.nome}
        nomeSecundario={organizacao.nomeCompleto}
        subtitulo={organizacao.tagline}
        resumo={organizacao.resumo}
        imagem={organizacao.imagem}
      />

      {ficha.length > 0 ? (
        <dl className="mt-8 grid grid-cols-1 gap-4 rounded-lg border border-linha bg-superficie p-5 sm:grid-cols-3">
          {ficha.map((linha) => (
            <div key={linha.rotulo}>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-texto-fraco">
                {linha.rotulo}
              </dt>
              <dd className="mt-1 text-sm font-medium text-texto">
                {linha.valor}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <SecaoDaEntidade
        titulo={organizacao.tituloDaHistoria ?? "História"}
        vazia={!organizacao.conteudo}
      >
        <div className={classeDoCorpoDaMateria}>
          <Markdown components={componentesDeMarkdown}>
            {organizacao.conteudo}
          </Markdown>
        </div>
      </SecaoDaEntidade>

      <SecaoDaEntidade titulo="Legado" vazia={!organizacao.legado}>
        <p className="text-lg leading-8 text-texto-corpo">{organizacao.legado}</p>
      </SecaoDaEntidade>

      {/*
        Notícias marcadas com esta organização no frontmatter. É o que liga o
        acervo histórico à cobertura do dia: quem chega pela história do UFC
        encontra o que saiu esta semana sobre ele.
      */}
      <SecaoDaEntidade titulo="No noticiário" vazia={noticias.length === 0}>
        <NewsGrid noticias={noticias} colunas={2} className="mt-0" />
      </SecaoDaEntidade>

      <SecaoDaEntidade
        titulo={`Lendas do ${organizacao.nome}`}
        vazia={lendas.length === 0}
      >
        <GradeDeEntidades entidades={lendas} comOrganizacao={false} />
      </SecaoDaEntidade>

      <SecaoDaEntidade
        titulo="Momentos históricos"
        vazia={momentos.length === 0}
      >
        <GradeDeEntidades entidades={momentos} />
      </SecaoDaEntidade>

      <SecaoDaEntidade
        titulo="Conteúdos relacionados"
        vazia={artigos.length === 0}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {artigos.map((artigo) => (
            <ConteudoCard
              key={artigo.slug}
              href={`/arquivo/${artigo.slug}`}
              titulo={artigo.title}
              rotulo={rotuloDaCategoria(artigo.categoria)}
              resumo={artigo.resumo}
              imagem={artigo.imagem}
            />
          ))}
        </div>
      </SecaoDaEntidade>

      <BlocoDeFontes fontes={organizacao.fontes} />
    </Container>
  );
}
