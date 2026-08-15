import NoticiaCard from "@/app/components/NoticiaCard";
import type { Noticia } from "@/lib/noticias";

const colunasPorVariante = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

export default function NewsGrid({
  noticias,
  colunas = 3,
  preloadPrimeira = false,
  mensagemVazia = "Nenhuma notícia publicada nesta categoria ainda.",
}: {
  noticias: Noticia[];
  colunas?: 2 | 3;
  /** Marca a primeira imagem como LCP — use apenas quando o grid abre a página. */
  preloadPrimeira?: boolean;
  mensagemVazia?: string;
}) {
  if (noticias.length === 0) {
    return <p className="mt-8 text-zinc-400">{mensagemVazia}</p>;
  }

  return (
    <div
      className={`mt-8 grid grid-cols-1 gap-6 ${colunasPorVariante[colunas]}`}
    >
      {noticias.map((noticia, indice) => (
        <NoticiaCard
          key={noticia.slug}
          noticia={noticia}
          preload={preloadPrimeira && indice === 0}
        />
      ))}
    </div>
  );
}
