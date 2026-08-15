import Header from "@/app/components/Header";
import NewsGrid from "@/app/components/NewsGrid";
import Paginacao from "@/app/components/Paginacao";
import {
  getNoticiasDaPagina,
  getTotalDePaginas,
  type Categoria,
} from "@/lib/noticias";

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
        <Paginacao base={`/${categoria.slug}`} pagina={pagina} total={total} />
      </main>
    </div>
  );
}
