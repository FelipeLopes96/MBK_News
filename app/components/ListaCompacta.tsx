import Link from "next/link";
import type { ItemDeConteudo } from "@/lib/conteudo";

/** Card de sidebar: só os títulos, como lista de links. */
export default function ListaCompacta({
  titulo,
  itens,
  baseHref,
  verTodosHref,
}: {
  titulo: string;
  itens: ItemDeConteudo[];
  /** Prefixo da rota de leitura, ex.: "/arquivo". */
  baseHref: string;
  verTodosHref: string;
}) {
  if (itens.length === 0) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-[#242424] p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">
          {titulo}
        </h2>
        <Link
          href={verTodosHref}
          className="text-xs font-medium text-[#F97316] hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <ul className="mt-4 divide-y divide-zinc-800">
        {itens.map((item) => (
          <li key={item.slug} className="py-3 first:pt-0 last:pb-0">
            <Link
              href={`${baseHref}/${item.slug}`}
              className="text-sm font-medium leading-snug text-zinc-300 transition-colors hover:text-[#F97316]"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
