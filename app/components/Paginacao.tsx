import Link from "next/link";

/**
 * A página 1 é canônica na raiz da seção (/mma, /noticias) e as demais moram em
 * <base>/pagina/n. Vale para categorias e para o acervo geral.
 */
export function urlDaPagina(base: string, pagina: number): string {
  return pagina <= 1 ? base : `${base}/pagina/${pagina}`;
}

const classeAtiva =
  "rounded-md border border-zinc-800 bg-[#242424] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#F97316] hover:text-[#F97316]";
const classeInativa =
  "rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-600";

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
      className="mt-10 flex items-center justify-between gap-4"
    >
      {pagina > 1 ? (
        <Link href={urlDaPagina(base, pagina - 1)} className={classeAtiva}>
          ← Anterior
        </Link>
      ) : (
        <span className={classeInativa}>← Anterior</span>
      )}

      <span className="text-sm text-zinc-500">
        Página {pagina} de {total}
      </span>

      {pagina < total ? (
        <Link href={urlDaPagina(base, pagina + 1)} className={classeAtiva}>
          Próxima →
        </Link>
      ) : (
        <span className={classeInativa}>Próxima →</span>
      )}
    </nav>
  );
}
