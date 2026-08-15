import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CabecalhoDeEntidade from "@/app/components/CabecalhoDeEntidade";
import FichaDeEntidade from "@/app/components/FichaDeEntidade";
import Header from "@/app/components/Header";
import NotaDoEditor from "@/app/components/NotaDoEditor";
import SecaoDaEntidade from "@/app/components/SecaoDaEntidade";
import { componentesDeMarkdown } from "@/app/components/markdownDeConteudo";
import { getLenda, getLendas, getOrganizacao } from "@/lib/entidades";
import { metadataDaPagina } from "@/lib/seo";

export function generateStaticParams() {
  return getLendas().map((lenda) => ({ slug: lenda.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/lendas/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const lenda = getLenda(slug);

  if (!lenda) {
    return { title: "Lenda não encontrada | O Corner" };
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
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
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

        <FichaDeEntidade linhas={ficha} />

        <SecaoDaEntidade titulo="Títulos" vazia={lenda.titulos.length === 0}>
          <ul className="space-y-3">
            {lenda.titulos.map((titulo) => (
              <li
                key={titulo.titulo}
                className="flex gap-2 text-base leading-7 text-zinc-300"
              >
                <span aria-hidden className="text-[#F97316]">
                  ▪
                </span>
                <span>
                  {titulo.titulo}
                  {titulo.local ? (
                    <span className="text-zinc-400"> · {titulo.local}</span>
                  ) : null}
                  {/* A atribuição fica sob o título, e não ao lado, para o
                      leitor ver de imediato de onde vem a informação. */}
                  {titulo.qualificacao ? (
                    <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
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
          <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-lg prose-p:leading-8 prose-p:text-zinc-300 prose-a:text-[#F97316] prose-blockquote:border-l-[#F97316] prose-blockquote:text-zinc-400 prose-strong:text-white prose-li:text-lg prose-li:leading-8 prose-li:text-zinc-300">
            <Markdown components={componentesDeMarkdown}>
              {lenda.conteudo}
            </Markdown>
          </div>
        </SecaoDaEntidade>

        <SecaoDaEntidade
          titulo="Grandes lutas"
          vazia={lenda.grandesLutas.length === 0}
        >
          <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-[#242424]">
            {lenda.grandesLutas.map((luta) => {
              const contexto = [luta.evento, luta.ano]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={`${luta.titulo}-${luta.ano ?? ""}`} className="p-5">
                  <p className="text-base font-semibold leading-snug text-white">
                    {luta.titulo}
                  </p>
                  {contexto ? (
                    <p className="mt-1 text-xs text-zinc-500">{contexto}</p>
                  ) : null}
                  {luta.resultado ? (
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {luta.resultado}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </SecaoDaEntidade>

        <SecaoDaEntidade titulo="Legado" vazia={!lenda.legado}>
          <p className="text-lg leading-8 text-zinc-300">{lenda.legado}</p>
        </SecaoDaEntidade>

        <BlocoDeFontes fontes={lenda.fontes} />

        <NotaDoEditor nota={lenda.notaDoEditor} />
      </main>
    </div>
  );
}
