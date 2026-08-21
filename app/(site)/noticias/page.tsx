import type { Metadata } from "next";
import ListaDeNoticias, {
  DESCRICAO_DO_ACERVO,
} from "@/app/components/ListaDeNoticias";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Todas as Notícias",
  descricao: DESCRICAO_DO_ACERVO,
  caminho: "/noticias",
});

export default function NoticiasPage() {
  return <ListaDeNoticias pagina={1} />;
}
