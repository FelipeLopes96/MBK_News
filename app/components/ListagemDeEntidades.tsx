import Breadcrumbs, { type Migalha } from "@/app/components/Breadcrumbs";
import Container from "@/app/components/Container";
import GradeDeEntidades from "@/app/components/GradeDeEntidades";
import GradeFiltravel from "@/app/components/GradeFiltravel";
import NavDoArquivo from "@/app/components/NavDoArquivo";
import {
  organizacoesPresentes,
  paraCardDeEntidade,
  type Entidade,
} from "@/lib/entidades";

/**
 * Página de listagem de entidades do Arquivo — organizações, lendas, momentos.
 * Mesma largura, espaçamento e grade das páginas /arquivo e /arsenal.
 */
export default function ListagemDeEntidades({
  trilha,
  titulo,
  descricao,
  entidades,
  mensagemVazia,
  filtroPorOrganizacao,
}: {
  trilha: Migalha[];
  titulo: string;
  descricao: string;
  entidades: Entidade[];
  mensagemVazia: string;
  /**
   * Liga o filtro por organização acima da grade. O singular e o plural são do
   * que está listado ("lenda"/"lendas"), usados na linha de contagem.
   */
  filtroPorOrganizacao?: { singular: string; plural: string };
}) {
  return (
    <Container>
      <Breadcrumbs trilha={trilha} />

      <NavDoArquivo />

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-texto">
        {titulo}
      </h1>
      <p className="mt-2 text-texto-suave">{descricao}</p>

      {entidades.length === 0 ? (
        <p className="mt-8 text-texto-suave">{mensagemVazia}</p>
      ) : filtroPorOrganizacao ? (
        // O mapeamento acontece aqui, no servidor: a grade filtrável é
        // Client Component e não pode ler o disco para resolver os rótulos.
        <GradeFiltravel
          cards={entidades.map((entidade) => paraCardDeEntidade(entidade))}
          filtros={organizacoesPresentes(entidades)}
          contagem={filtroPorOrganizacao}
        />
      ) : (
        <div className="mt-8">
          <GradeDeEntidades entidades={entidades} preloadPrimeiro />
        </div>
      )}
    </Container>
  );
}
