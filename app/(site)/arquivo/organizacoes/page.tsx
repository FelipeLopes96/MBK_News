import type { Metadata } from "next";
import ListagemDeEntidades from "@/app/components/ListagemDeEntidades";
import { getOrganizacoes } from "@/lib/entidades";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Organizações",
  descricao:
    "As organizações que moldaram os esportes de combate: história, lendas e momentos decisivos de cada uma.",
  caminho: "/arquivo/organizacoes",
});

export default function OrganizacoesPage() {
  return (
    <ListagemDeEntidades
      trilha={[
        { rotulo: "Arquivo", href: "/arquivo" },
        { rotulo: "Organizações" },
      ]}
      titulo="Organizações"
      descricao="As organizações que moldaram o esporte. Cada uma reúne a própria história, suas lendas e seus momentos decisivos."
      entidades={getOrganizacoes()}
      mensagemVazia="Nenhuma organização cadastrada ainda."
      // Só modalidade: filtrar organização por organização seria circular.
      filtros={{
        porModalidade: true,
        singular: "organização",
        plural: "organizações",
      }}
    />
  );
}
