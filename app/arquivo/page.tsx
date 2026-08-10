import type { Metadata } from "next";
import ConteudoCard from "@/app/components/ConteudoCard";
import Header from "@/app/components/Header";
import { getTodos, rotuloDaCategoria } from "@/lib/arquivo";

export const metadata: Metadata = {
  title: "Arquivo do Corner | O Corner",
  description:
    "Histórias, guias e explicações sobre esportes de combate. Conteúdo de longa duração do O Corner.",
};

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

        {artigos.length === 0 ? (
          <p className="mt-8 text-zinc-400">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artigos.map((artigo, indice) => (
              <ConteudoCard
                key={artigo.slug}
                item={artigo}
                href={`/arquivo/${artigo.slug}`}
                rotuloCategoria={rotuloDaCategoria(artigo.categoria)}
                preload={indice === 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
