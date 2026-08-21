import Link from "next/link";
import SectionHeader from "@/app/components/SectionHeader";
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
    <section className="rounded-lg border border-linha bg-superficie p-6">
      <SectionHeader
        titulo={titulo}
        variante="modulo"
        acao={{ rotulo: "Ver todos", href: verTodosHref }}
      />

      <ul className="mt-4 divide-y divide-linha">
        {itens.map((item) => (
          <li key={item.slug} className="py-3 first:pt-0 last:pb-0">
            <Link
              href={`${baseHref}/${item.slug}`}
              className="text-sm font-medium leading-snug text-texto-corpo transition-colors hover:text-marca-clara"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
