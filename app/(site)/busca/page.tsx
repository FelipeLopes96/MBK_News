import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/app/components/Container";
import ResultadosDaBusca from "@/app/components/ResultadosDaBusca";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import { getIndiceDeBusca } from "@/lib/indiceDeBusca";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = {
  ...metadataDaPagina({
    titulo: "Busca",
    descricao:
      "Busque matérias, atletas, organizações e conteúdo histórico do MBK News.",
    caminho: "/busca",
  }),
  // Página de resultado não é conteúdo: fora do índice dos buscadores.
  robots: { index: false, follow: true },
};

export default function BuscaPage() {
  return (
    <Container largura="leitura">
      <TituloDaPagina titulo="Busca" />

      {/*
        O índice é montado no build e entregue inteiro ao componente cliente.
        O Suspense existe porque quem lê `?q=` é o cliente: sem ele, a página
        deixaria de ser estática.
      */}
      <Suspense
        fallback={<p className="mt-6 text-texto-fraco">Carregando busca…</p>}
      >
        <ResultadosDaBusca indice={getIndiceDeBusca()} />
      </Suspense>
    </Container>
  );
}
