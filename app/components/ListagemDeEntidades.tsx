import Breadcrumbs, { type Migalha } from "@/app/components/Breadcrumbs";
import Container from "@/app/components/Container";
import GradeDeEntidades from "@/app/components/GradeDeEntidades";
import GradeFiltravel from "@/app/components/GradeFiltravel";
import NavDoArquivo from "@/app/components/NavDoArquivo";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import {
  modalidadesPresentes,
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
  filtros,
}: {
  trilha: Migalha[];
  titulo: string;
  descricao: string;
  entidades: Entidade[];
  mensagemVazia: string;
  /**
   * Liga os filtros acima da grade. Cada dimensão é declarada porque nem toda
   * listagem quer as duas: filtrar organização por organização, na listagem de
   * organizações, seria circular — ali só modalidade separa alguma coisa.
   *
   * O singular e o plural são do que está listado ("lenda"/"lendas"), usados na
   * linha de contagem.
   */
  filtros?: {
    porOrganizacao?: boolean;
    porModalidade?: boolean;
    singular: string;
    plural: string;
  };
}) {
  return (
    <Container>
      <Breadcrumbs trilha={trilha} />

      <NavDoArquivo />

      <TituloDaPagina titulo={titulo} descricao={descricao} className="mt-6" />

      {entidades.length === 0 ? (
        <p className="mt-8 text-texto-suave">{mensagemVazia}</p>
      ) : filtros ? (
        // O mapeamento acontece aqui, no servidor: a grade filtrável é
        // Client Component e não pode ler o disco para resolver os rótulos.
        <GradeFiltravel
          cards={entidades.map((entidade) => paraCardDeEntidade(entidade))}
          filtros={
            filtros.porOrganizacao ? organizacoesPresentes(entidades) : []
          }
          modalidades={
            filtros.porModalidade ? modalidadesPresentes(entidades) : []
          }
          contagem={filtros}
        />
      ) : (
        <div className="mt-8">
          <GradeDeEntidades entidades={entidades} preloadPrimeiro />
        </div>
      )}
    </Container>
  );
}
