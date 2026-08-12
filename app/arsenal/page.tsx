import type { Metadata } from "next";
import ConteudoCard from "@/app/components/ConteudoCard";
import Header from "@/app/components/Header";
import { getTodos, rotuloDaCategoria } from "@/lib/arsenal";

export const metadata: Metadata = {
  title: "Arsenal | O Corner",
  description:
    "Rankings e análises de equipamentos de combate: luvas, caneleiras, shorts e proteção testados pelo O Corner.",
};

export default function ArsenalPage() {
  const reviews = getTodos();

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Arsenal
        </h1>
        <p className="mt-2 text-zinc-400">
          Rankings e análises de equipamento — o que vale o dinheiro e o que
          não vale.
        </p>

        {reviews.length === 0 ? (
          <p className="mt-8 text-zinc-400">Nenhuma análise publicada ainda.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, indice) => (
              <ConteudoCard
                key={review.slug}
                href={`/arsenal/${review.slug}`}
                titulo={review.title}
                rotulo={rotuloDaCategoria(review.categoria)}
                resumo={review.resumo}
                imagem={review.imagem}
                preload={indice === 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
