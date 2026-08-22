import NewsGrid from "@/app/components/NewsGrid";
import Container from "@/app/components/Container";
import Paginacao from "@/app/components/Paginacao";
import TituloDaPagina from "@/app/components/TituloDaPagina";
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
    <Container>
      <TituloDaPagina
        titulo={categoria.rotulo}
        descricao={`Notícias, resultados e bastidores de ${categoria.rotulo}.`}
      />

      <NewsGrid
        noticias={noticias}
        colunas={3}
        comAbertura={pagina === 1}
        preloadPrimeira
      />
      <Paginacao base={`/${categoria.slug}`} pagina={pagina} total={total} />
    </Container>
  );
}
