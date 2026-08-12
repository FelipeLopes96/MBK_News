import type { Metadata } from "next";
import ListagemDeEntidades from "@/app/components/ListagemDeEntidades";
import { getMomentos } from "@/lib/entidades";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Momentos históricos",
  descricao:
    "Os eventos e as lutas que mudaram o rumo dos esportes de combate.",
  caminho: "/arquivo/momentos",
});

export default function MomentosPage() {
  return (
    <ListagemDeEntidades
      trilha={[{ rotulo: "Arquivo", href: "/arquivo" }, { rotulo: "Momentos" }]}
      titulo="Momentos históricos"
      descricao="Os eventos e as lutas que mudaram o rumo do esporte."
      entidades={getMomentos()}
      mensagemVazia="Nenhum momento histórico publicado ainda."
    />
  );
}
