import NewsGrid from "@/app/components/NewsGrid";
import Container from "@/app/components/Container";
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
    <Container>
      <h1 className="text-3xl font-bold tracking-tight text-texto">
        {categoria.rotulo}
      </h1>
      <p className="mt-2 text-texto-suave">
        Tudo o que rolou no mundo do {categoria.rotulo}.
      </p>

      <NewsGrid noticias={noticias} colunas={3} preloadPrimeira />
      <Paginacao base={`/${categoria.slug}`} pagina={pagina} total={total} />
    </Container>
  );
}
