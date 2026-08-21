import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import SectionHeader from "@/app/components/SectionHeader";
import { getLendas, getMomentos, getOrganizacoes } from "@/lib/entidades";

/** Plural correto sem depender de biblioteca: "1 lenda" / "4 lendas". */
function contagem(total: number, singular: string, plural: string): string {
  if (total === 0) return "Em breve";
  return `${total} ${total === 1 ? singular : plural}`;
}

/**
 * Entrada para os hubs do Arquivo (organizações, lendas, momentos), no topo de
 * /arquivo. Os totais vêm dos dados, então cadastrar um .md novo já atualiza
 * esta navegação.
 */
export default function ExplorarOArquivo() {
  const grupos = [
    {
      href: "/arquivo/organizacoes",
      titulo: "Organizações",
      descricao: "UFC, PRIDE, ONE, WGP e a história de cada uma.",
      total: contagem(getOrganizacoes().length, "organização", "organizações"),
    },
    {
      href: "/arquivo/lendas",
      titulo: "Lendas",
      descricao: "Os atletas que definiram eras no esporte.",
      total: contagem(getLendas().length, "lenda", "lendas"),
    },
    {
      href: "/arquivo/momentos",
      titulo: "Momentos",
      descricao: "Os eventos e as lutas que mudaram o rumo do esporte.",
      total: contagem(getMomentos().length, "momento", "momentos"),
    },
  ];

  return (
    <section className="mt-8">
      {/* "Além do Octógono" saiu: a metáfora é do MMA e o portal cobre também
          boxe, muay thai, kickboxing e wrestling. */}
      <SectionHeader titulo="A história do esporte" variante="rotulo" />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {grupos.map((grupo) => (
          <Link
            key={grupo.href}
            href={grupo.href}
            className="group flex flex-col rounded-lg border border-linha bg-superficie p-5 transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
          >
            <Etiqueta variante="texto">{grupo.total}</Etiqueta>
            <span className="mt-2 text-lg font-semibold text-texto transition-colors group-hover:text-marca-clara">
              {grupo.titulo}
            </span>
            <span className="mt-1 text-sm leading-6 text-texto-suave">
              {grupo.descricao}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
