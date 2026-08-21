import type { Metadata } from "next";
import Container from "@/app/components/Container";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CabecalhoDeEntidade from "@/app/components/CabecalhoDeEntidade";
import SecaoDaEntidade from "@/app/components/SecaoDaEntidade";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import { formatarData } from "@/lib/conteudo";
import { getMomento, getMomentos, getOrganizacao } from "@/lib/entidades";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

export function generateStaticParams() {
  return getMomentos().map((momento) => ({ slug: momento.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/momentos/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const momento = getMomento(slug);

  if (!momento) {
    return { title: `Momento não encontrado | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: momento.nome,
    descricao: momento.resumo,
    caminho: `/arquivo/momentos/${momento.slug}`,
    imagem: momento.imagem?.url,
    tipo: "article",
  });
}

/** Data completa quando vem em ISO; só o ano quando é o que existe. */
function dataLegivel(data: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(data) ? formatarData(data) : data;
}

export default async function MomentoPage(
  props: PageProps<"/arquivo/momentos/[slug]">
) {
  const { slug } = await props.params;
  const momento = getMomento(slug);

  if (!momento) {
    notFound();
  }

  const organizacoes = momento.organizacoes
    .map((referencia) => getOrganizacao(referencia))
    .filter((organizacao) => organizacao !== undefined);

  const ficha = [
    { rotulo: "Data", valor: momento.data ? dataLegivel(momento.data) : undefined },
    { rotulo: "Local", valor: momento.local },
  ].filter((linha) => linha.valor);

  return (
    <Container largura="leitura">
      <CabecalhoDeEntidade
        trilha={[
          { rotulo: "Arquivo", href: "/arquivo" },
          { rotulo: "Momentos", href: "/arquivo/momentos" },
          { rotulo: momento.nome },
        ]}
        rotulo="Momento histórico"
        titulo={momento.nome}
        resumo={momento.resumo}
        imagem={momento.imagem}
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

      {ficha.length > 0 ? (
        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-linha bg-superficie p-5 sm:grid-cols-2">
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

      <SecaoDaEntidade titulo="O que aconteceu" vazia={!momento.conteudo}>
        <div className={classeDoCorpoDaMateria}>
          <Markdown components={componentesDeMarkdown}>
            {momento.conteudo}
          </Markdown>
        </div>
      </SecaoDaEntidade>

      <BlocoDeFontes fontes={momento.fontes} />
    </Container>
  );
}
