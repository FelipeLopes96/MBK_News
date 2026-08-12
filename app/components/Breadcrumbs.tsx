import Link from "next/link";

export type Migalha = {
  rotulo: string;
  /** Sem href, a migalha é a página atual. */
  href?: string;
};

/** Trilha de navegação — ex.: Arquivo › Organizações › PRIDE. */
export default function Breadcrumbs({ trilha }: { trilha: Migalha[] }) {
  if (trilha.length === 0) return null;

  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500">
        {trilha.map((migalha, indice) => {
          const ultima = indice === trilha.length - 1;

          return (
            <li key={`${migalha.rotulo}-${indice}`} className="flex items-center gap-2">
              {migalha.href && !ultima ? (
                <Link
                  href={migalha.href}
                  className="transition-colors hover:text-[#F97316]"
                >
                  {migalha.rotulo}
                </Link>
              ) : (
                <span aria-current={ultima ? "page" : undefined} className="text-zinc-400">
                  {migalha.rotulo}
                </span>
              )}

              {ultima ? null : (
                <span aria-hidden className="text-zinc-700">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
