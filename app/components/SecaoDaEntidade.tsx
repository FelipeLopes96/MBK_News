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
  variante = "rotulo",
}: {
  titulo: string;
  children: ReactNode;
  /** Force `true` quando o conteúdo interno é opcional e está ausente. */
  vazia?: boolean;
  /**
   * `rotulo` é o padrão: um rótulo curto e discreto sobre o bloco ("Títulos",
   * "Legado"). Use `titulo` quando o texto é o título da própria matéria — aí
   * ele precisa pesar mais que os subtítulos que vêm abaixo dele, senão a
   * hierarquia da página fica invertida.
   */
  variante?: "rotulo" | "titulo";
}) {
  if (vazia) return null;

  const ehTitulo = variante === "titulo";

  return (
    <section className="mt-12">
      <h2
        className={
          ehTitulo
            ? "text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl"
            : "text-xs font-bold uppercase tracking-widest text-zinc-500"
        }
      >
        {titulo}
      </h2>
      <div className={ehTitulo ? "mt-6" : "mt-4"}>{children}</div>
    </section>
  );
}
