import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CabecalhoDeEntidade from "@/app/components/CabecalhoDeEntidade";
import Header from "@/app/components/Header";
import NewsletterForm from "@/app/components/NewsletterForm";
import SecaoDaEntidade from "@/app/components/SecaoDaEntidade";
import { componentesDeMarkdown } from "@/app/components/markdownDeConteudo";
import { formatarData } from "@/lib/conteudo";
import { getMomento, getMomentos, getOrganizacao } from "@/lib/entidades";
import { metadataDaPagina } from "@/lib/seo";

export function generateStaticParams() {
  return getMomentos().map((momento) => ({ slug: momento.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/momentos/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const momento = getMomento(slug);

  if (!momento) {
    return { title: "Momento não encontrado | O Corner" };
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
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
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
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {organizacoes.length > 1 ? "Organizações" : "Organização"}
            </h2>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {organizacoes.map((organizacao) => (
                <Link
                  key={organizacao.slug}
                  href={`/arquivo/organizacoes/${organizacao.slug}`}
                  className="font-medium text-[#F97316] hover:underline"
                >
                  {organizacao.nomeCompleto ?? organizacao.nome}
                </Link>
              ))}
            </p>
          </div>
        ) : null}

        {ficha.length > 0 ? (
          <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-zinc-800 bg-[#242424] p-5 sm:grid-cols-2">
            {ficha.map((linha) => (
              <div key={linha.rotulo}>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {linha.rotulo}
                </dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {linha.valor}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <SecaoDaEntidade titulo="O que aconteceu" vazia={!momento.conteudo}>
          <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-lg prose-p:leading-8 prose-p:text-zinc-300 prose-a:text-[#F97316] prose-blockquote:border-l-[#F97316] prose-blockquote:text-zinc-400 prose-strong:text-white prose-li:text-lg prose-li:leading-8 prose-li:text-zinc-300">
            <Markdown components={componentesDeMarkdown}>
              {momento.conteudo}
            </Markdown>
          </div>
        </SecaoDaEntidade>

        <BlocoDeFontes fontes={momento.fontes} />

        <div className="mt-12">
          <NewsletterForm />
        </div>
      </main>
    </div>
  );
}
