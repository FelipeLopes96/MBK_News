import Link from "next/link";
import Header from "@/app/components/Header";
import NewsGrid from "@/app/components/NewsGrid";
import {
  getNoticiasDaPagina,
  getTotalDePaginas,
  type Categoria,
} from "@/lib/noticias";

/** A página 1 mora em /categoria; as demais em /categoria/pagina/n. */
function urlDaPagina(slug: string, pagina: number): string {
  return pagina <= 1 ? `/${slug}` : `/${slug}/pagina/${pagina}`;
}

function Paginacao({ slug, pagina, total }: { slug: string; pagina: number; total: number }) {
  if (total <= 1) return null;

  const classeAtiva =
    "rounded-md border border-zinc-800 bg-[#242424] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#F97316] hover:text-[#F97316]";
  const classeInativa =
    "rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-600";

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-between gap-4"
    >
      {pagina > 1 ? (
        <Link href={urlDaPagina(slug, pagina - 1)} className={classeAtiva}>
          ← Anterior
        </Link>
      ) : (
        <span className={classeInativa}>← Anterior</span>
      )}

      <span className="text-sm text-zinc-500">
        Página {pagina} de {total}
      </span>

      {pagina < total ? (
        <Link href={urlDaPagina(slug, pagina + 1)} className={classeAtiva}>
          Próxima →
        </Link>
      ) : (
        <span className={classeInativa}>Próxima →</span>
      )}
    </nav>
  );
}

export default function ListaDeCategoria({
  categoria,
  pagina,
}: {
  categoria: Categoria;
  pagina: number;
}) {
  const total = getTotalDePaginas(categoria.slug);
  const noticias = getNoticiasDaPagina(categoria.slug, pagina);

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {categoria.rotulo}
        </h1>
        <p className="mt-2 text-zinc-400">
          Tudo o que rolou no mundo do {categoria.rotulo}.
        </p>

        <NewsGrid noticias={noticias} colunas={3} preloadPrimeira />
        <Paginacao slug={categoria.slug} pagina={pagina} total={total} />
      </main>
    </div>
  );
}
