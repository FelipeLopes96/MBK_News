import type { Metadata } from "next";
import ListaDeNoticias from "@/app/components/ListaDeNoticias";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Todas as Notícias",
  descricao:
    "O acervo completo de notícias do O Corner: MMA, boxe, jiu-jitsu e muay thai, da mais recente para a mais antiga.",
  caminho: "/noticias",
});

export default function NoticiasPage() {
  return <ListaDeNoticias pagina={1} />;
}
