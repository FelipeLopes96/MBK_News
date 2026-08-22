import NoticiaCard from "@/app/components/NoticiaCard";
import type { Noticia } from "@/lib/noticias";

const colunasPorVariante = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

/** A chamada de abertura ocupa a linha inteira, qualquer que seja a grade. */
const spanPorVariante = {
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
} as const;

export default function NewsGrid({
  noticias,
  colunas = 3,
  comAbertura = false,
  preloadPrimeira = false,
  className = "mt-8",
  mensagemVazia = "Nenhuma notícia publicada nesta categoria ainda.",
}: {
  noticias: Noticia[];
  colunas?: 2 | 3;
  /** Espaçamento externo. Dentro de um bloco de seção, o padrão sobra. */
  className?: string;
  /**
   * Dá à primeira matéria o peso de chamada de abertura. Use só onde a
   * listagem começa — na página 2 de um acervo, destacar a matéria do topo
   * seria arbitrário: ela não é a mais importante, é só a próxima da fila.
   */
  comAbertura?: boolean;
  /** Marca a primeira imagem como LCP — use apenas quando o grid abre a página. */
  preloadPrimeira?: boolean;
  mensagemVazia?: string;
}) {
  if (noticias.length === 0) {
    return <p className={`${className} text-texto-suave`}>{mensagemVazia}</p>;
  }

  // Com duas matérias ou menos a abertura não cria hierarquia nenhuma: sobraria
  // um card gigante e um só embaixo.
  const abertura = comAbertura && noticias.length > 2;

  return (
    <div
      className={`${className} grid grid-cols-1 gap-6 ${colunasPorVariante[colunas]}`}
    >
      {noticias.map((noticia, indice) => {
        const ehAbertura = abertura && indice === 0;

        return (
          <NoticiaCard
            key={noticia.slug}
            noticia={noticia}
            variante={ehAbertura ? "lead" : "padrao"}
            className={ehAbertura ? spanPorVariante[colunas] : ""}
            preload={preloadPrimeira && indice === 0}
          />
        );
      })}
    </div>
  );
}
