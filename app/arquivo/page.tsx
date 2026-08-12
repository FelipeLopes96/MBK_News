import type { Metadata } from "next";
import ConteudoCard from "@/app/components/ConteudoCard";
import ExplorarOArquivo from "@/app/components/ExplorarOArquivo";
import Header from "@/app/components/Header";
import { getTodos, rotuloDaCategoria } from "@/lib/arquivo";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Arquivo do Corner",
  descricao:
    "Histórias, guias e explicações sobre esportes de combate. Conteúdo de longa duração do O Corner.",
  caminho: "/arquivo",
});

export default function ArquivoPage() {
  const artigos = getTodos();

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Arquivo do Corner
        </h1>
        <p className="mt-2 text-zinc-400">
          Histórias, guias e explicações sobre esportes de combate — conteúdo
          que não perde a validade.
        </p>

        <ExplorarOArquivo />

        <h2 className="mt-12 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Conteúdos do Arquivo
        </h2>

        {artigos.length === 0 ? (
          <p className="mt-4 text-zinc-400">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artigos.map((artigo, indice) => (
              <ConteudoCard
                key={artigo.slug}
                href={`/arquivo/${artigo.slug}`}
                titulo={artigo.title}
                rotulo={rotuloDaCategoria(artigo.categoria)}
                resumo={artigo.resumo}
                imagem={artigo.imagem}
                preload={indice === 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
