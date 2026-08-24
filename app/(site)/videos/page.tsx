import type { Metadata } from "next";
import ListaDeVideos, {
  DESCRICAO_DA_BIBLIOTECA,
} from "@/app/components/ListaDeVideos";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Vídeos",
  descricao: DESCRICAO_DA_BIBLIOTECA,
  caminho: "/videos",
});

export default function VideosPage() {
  return <ListaDeVideos pagina={1} />;
}
