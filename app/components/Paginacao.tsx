import Link from "next/link";

/**
 * A página 1 é canônica na raiz da seção (/mma, /noticias) e as demais moram em
 * <base>/pagina/n. Vale para categorias e para o acervo geral.
 */
export function urlDaPagina(base: string, pagina: number): string {
  return pagina <= 1 ? base : `${base}/pagina/${pagina}`;
}

/**
 * Janela de páginas mostrada: sempre a primeira, a última e a vizinhança da
 * atual, com reticências no que for pulado. Assim a barra não cresce junto com
 * o acervo — e, ao contrário de só "anterior/próxima", o leitor consegue pular
 * para o fim do arquivo em um clique.
 */
function janela(pagina: number, total: number): (number | "…")[] {
  const marcos = [1, total, pagina - 1, pagina, pagina + 1];
  const paginas = [...new Set(marcos)]
    .filter((numero) => numero >= 1 && numero <= total)
    .sort((a, b) => a - b);

  return paginas.flatMap((numero, indice) => {
    const anterior = paginas[indice - 1];
    const pulou = anterior !== undefined && numero - anterior > 1;
    return pulou ? ["…" as const, numero] : [numero];
  });
}

/**
 * `min-h-11` no celular: 44px é o alvo de toque confortável. De sm em diante o
 * ponteiro é preciso e o botão volta ao tamanho que o desenho pede.
 */
const alvoDeToque = "inline-flex min-h-11 items-center sm:min-h-9";

const classeDeSeta =
  `${alvoDeToque} rounded-md border border-linha bg-superficie px-3 text-sm font-medium text-texto transition-colors hover:border-marca hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca sm:px-4`;
const classeDeSetaInativa =
  `${alvoDeToque} rounded-md border border-linha/60 px-3 text-sm font-medium text-texto-fraco/70 sm:px-4`;

export default function Paginacao({
  base,
  pagina,
  total,
}: {
  /** Raiz da seção, sem barra final. Ex.: "/mma", "/noticias". */
  base: string;
  pagina: number;
  total: number;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-between gap-3"
    >
      {pagina > 1 ? (
        <Link href={urlDaPagina(base, pagina - 1)} className={classeDeSeta}>
          <span aria-hidden="true">←</span>
          <span className="ml-1.5 hidden sm:inline">Anterior</span>
          <span className="sr-only">Página anterior</span>
        </Link>
      ) : (
        <span className={classeDeSetaInativa} aria-hidden="true">
          ←<span className="ml-1.5 hidden sm:inline">Anterior</span>
        </span>
      )}

      <p className="sr-only">
        Página {pagina} de {total}
      </p>

      <ol className="flex items-center gap-1">
        {janela(pagina, total).map((item, indice) =>
          item === "…" ? (
            <li
              key={`salto-${indice}`}
              aria-hidden="true"
              className="px-1 text-sm text-texto-fraco/70"
            >
              …
            </li>
          ) : (
            <li key={item}>
              {item === pagina ? (
                <span
                  aria-current="page"
                  className={`${alvoDeToque} min-w-11 justify-center rounded-md bg-marca px-2.5 text-sm font-semibold text-texto sm:min-w-9`}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={urlDaPagina(base, item)}
                  className={`${alvoDeToque} min-w-11 justify-center rounded-md px-2.5 text-sm font-medium text-texto-suave transition-colors hover:bg-superficie hover:text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca sm:min-w-9`}
                >
                  {item}
                </Link>
              )}
            </li>
          )
        )}
      </ol>

      {pagina < total ? (
        <Link href={urlDaPagina(base, pagina + 1)} className={classeDeSeta}>
          <span className="mr-1.5 hidden sm:inline">Próxima</span>
          <span aria-hidden="true">→</span>
          <span className="sr-only">Próxima página</span>
        </Link>
      ) : (
        <span className={classeDeSetaInativa} aria-hidden="true">
          <span className="mr-1.5 hidden sm:inline">Próxima</span>→
        </span>
      )}
    </nav>
  );
}
