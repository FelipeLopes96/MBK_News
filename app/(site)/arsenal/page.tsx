import type { Metadata } from "next";
import Container from "@/app/components/Container";
import ConteudoCard from "@/app/components/ConteudoCard";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import { getTodos, rotuloDaCategoria } from "@/lib/arsenal";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Arsenal",
  descricao:
    "Rankings e análises de equipamentos de combate: luvas, caneleiras, shorts e proteção testados pela redação do MBK News.",
  caminho: "/arsenal",
});

export default function ArsenalPage() {
  const reviews = getTodos();

  return (
    <Container>
      <TituloDaPagina
        titulo="Arsenal"
        descricao="Rankings e análises de equipamento."
      />

      {/* Enquanto não houver nenhum .md em content/arsenal, a seção fica em
          espera. Basta publicar o primeiro arquivo para a grade voltar. */}
      {reviews.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-linha px-6 py-20 text-center">
          <p className="text-2xl font-semibold text-texto">Em breve</p>
          <p className="mt-3 max-w-md text-texto-suave">
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
    </Container>
  );
}
