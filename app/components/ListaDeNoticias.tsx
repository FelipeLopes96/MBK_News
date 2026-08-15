import Header from "@/app/components/Header";
import NewsGrid from "@/app/components/NewsGrid";
import Paginacao from "@/app/components/Paginacao";
import { getNoticiasDaPaginaGeral, getTotalDePaginasGeral } from "@/lib/noticias";

/** Raiz da seção — a paginação e os links da home partem daqui. */
export const BASE_DE_NOTICIAS = "/noticias";

export default function ListaDeNoticias({ pagina }: { pagina: number }) {
  const total = getTotalDePaginasGeral();
  const noticias = getNoticiasDaPaginaGeral(pagina);

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Todas as Notícias
        </h1>
        <p className="mt-2 text-zinc-400">
          O acervo completo do Corner, da mais recente para a mais antiga.
        </p>

        <NewsGrid
          noticias={noticias}
          colunas={3}
          preloadPrimeira
          mensagemVazia="Nenhuma notícia publicada ainda."
        />
        <Paginacao base={BASE_DE_NOTICIAS} pagina={pagina} total={total} />
      </main>
    </div>
  );
}
