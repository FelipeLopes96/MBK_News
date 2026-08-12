import Link from "next/link";
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
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Explorar o Arquivo
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {grupos.map((grupo) => (
          <Link
            key={grupo.href}
            href={grupo.href}
            className="group flex flex-col rounded-lg border border-zinc-800 bg-[#242424] p-5 transition-colors hover:border-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-[#F97316]">
              {grupo.total}
            </span>
            <span className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-[#F97316]">
              {grupo.titulo}
            </span>
            <span className="mt-1 text-sm leading-6 text-zinc-400">
              {grupo.descricao}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
