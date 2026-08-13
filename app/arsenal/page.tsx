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
          Rankings e análises de equipamento.
        </p>

        {/* Enquanto não houver nenhum .md em content/arsenal, a seção fica em
            espera. Basta publicar o primeiro arquivo para a grade voltar. */}
        {reviews.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-zinc-800 px-6 py-20 text-center">
            <p className="text-2xl font-semibold text-white">Em breve</p>
            <p className="mt-3 max-w-md text-zinc-400">
              Estamos preparando as primeiras análises de equipamento. Volte
              em breve para conferir.
            </p>
          </div>
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
