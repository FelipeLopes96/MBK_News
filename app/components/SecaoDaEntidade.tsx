import type { ReactNode } from "react";

/**
 * Bloco de seção das páginas de entidade (História, Lendas, Momentos,
 * Conteúdos relacionados). Nada é renderizado quando não há conteúdo — é o que
 * evita blocos vazios nas entidades ainda incompletas.
 */
export default function SecaoDaEntidade({
  titulo,
  children,
  vazia = false,
}: {
  titulo: string;
  children: ReactNode;
  /** Force `true` quando o conteúdo interno é opcional e está ausente. */
  vazia?: boolean;
}) {
  if (vazia) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
