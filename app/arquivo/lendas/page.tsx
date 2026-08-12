import type { Metadata } from "next";
import ListagemDeEntidades from "@/app/components/ListagemDeEntidades";
import { getLendas } from "@/lib/entidades";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Lendas",
  descricao:
    "Os atletas que definiram eras nos esportes de combate: cartel, títulos, grandes lutas e legado.",
  caminho: "/arquivo/lendas",
});

export default function LendasPage() {
  return (
    <ListagemDeEntidades
      trilha={[{ rotulo: "Arquivo", href: "/arquivo" }, { rotulo: "Lendas" }]}
      titulo="Lendas"
      descricao="Os atletas que definiram eras — o que fizeram, contra quem, e o que ficou depois que pararam."
      entidades={getLendas()}
      mensagemVazia="Nenhuma lenda cadastrada ainda."
    />
  );
}
