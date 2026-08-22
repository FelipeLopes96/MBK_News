import NewsGrid from "@/app/components/NewsGrid";
import Container from "@/app/components/Container";
import Paginacao from "@/app/components/Paginacao";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import { getNoticiasDaPaginaGeral, getTotalDePaginasGeral } from "@/lib/noticias";

/** Raiz da seção — a paginação e os links da home partem daqui. */
export const BASE_DE_NOTICIAS = "/noticias";

/**
 * Descrição da seção, compartilhada pela página 1 e pelas paginadas. Estava
 * duplicada literalmente nas duas rotas, e as duas já citavam uma lista de
 * modalidades desatualizada.
 */
export const DESCRICAO_DO_ACERVO =
  "O acervo completo de notícias do MBK News: MMA, boxe, muay thai, jiu-jitsu, kickboxing e wrestling, da mais recente para a mais antiga.";

export default function ListaDeNoticias({ pagina }: { pagina: number }) {
  const total = getTotalDePaginasGeral();
  const noticias = getNoticiasDaPaginaGeral(pagina);

  return (
    <Container>
      <TituloDaPagina
        titulo="Todas as Notícias"
        descricao="O acervo completo do MBK News, da mais recente para a mais antiga."
      />

      <NewsGrid
        noticias={noticias}
        colunas={3}
        // Só na primeira página: a partir da segunda, a matéria do topo não é a
        // mais importante — é só a próxima da fila.
        comAbertura={pagina === 1}
        preloadPrimeira
        mensagemVazia="Nenhuma notícia publicada ainda."
      />
      <Paginacao base={BASE_DE_NOTICIAS} pagina={pagina} total={total} />
    </Container>
  );
}
