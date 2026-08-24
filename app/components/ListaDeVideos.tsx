import Container from "@/app/components/Container";
import MenuSuspenso, { type ItemDoMenu } from "@/app/components/MenuSuspenso";
import Paginacao from "@/app/components/Paginacao";
import SectionHeader from "@/app/components/SectionHeader";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import VideoCard from "@/app/components/VideoCard";
import { categorias, rotuloDaCategoria } from "@/lib/noticias";
import {
  getModalidadesComVideo,
  getTotalDePaginasDaBiblioteca,
  getVideosDaBiblioteca,
  getVideosDaPagina,
  getVideosParaGrade,
  paraCardDeVideo,
} from "@/lib/videos";

/**
 * A biblioteca de vídeos, inteira ou recortada por modalidade.
 *
 * Uma peça só para as quatro rotas — /videos, /videos/pagina/n,
 * /videos/modalidade/x e /videos/modalidade/x/pagina/n — porque as quatro
 * mostram a mesma tela com listas diferentes. Antes a página era única e
 * filtrava no cliente; o filtro passou para a URL quando ganhou paginação, senão
 * escolher "Boxe" na página 2 mostraria só os vídeos de boxe daquela fatia, sem
 * nenhum sinal de que o resultado está errado.
 *
 * O recorte na URL vem com dois ganhos de brinde: a página segue estática e cada
 * modalidade ganha endereço próprio, compartilhável e indexável.
 */

export const DESCRICAO_DA_BIBLIOTECA =
  "Entrevistas, coletivas, análises e cobertura em vídeo do MBK News: MMA, boxe, muay thai, jiu-jitsu, kickboxing e wrestling.";

/** Descrição das páginas de uma modalidade. Aqui para as duas rotas dela. */
export function descricaoDaModalidade(rotulo: string): string {
  return `Entrevistas, coletivas, análises e cobertura em vídeo de ${rotulo} no MBK News.`;
}

/** Raiz da listagem, que a paginação usa para montar os links. */
export function baseDaListagem(modalidade?: string): string {
  return modalidade ? `/videos/modalidade/${modalidade}` : "/videos";
}

export default function ListaDeVideos({
  modalidade,
  pagina,
}: {
  /** Slug da modalidade. Ausente, a lista é a biblioteca inteira. */
  modalidade?: string;
  pagina: number;
}) {
  const doRecorte = getVideosDaBiblioteca(modalidade);

  // O destaque abre a página 1 e sai da grade — apareceria duas vezes.
  const [principal] = doRecorte;

  const total = getTotalDePaginasDaBiblioteca(modalidade);
  const naGrade = getVideosDaPagina(
    getVideosParaGrade(modalidade),
    pagina
  ).map((video) => paraCardDeVideo(video, rotuloDaCategoria(video.categoria)));

  const modalidades = getModalidadesComVideo(categorias);
  /**
   * Com uma modalidade só não há o que escolher: o menu apenas repetiria o que a
   * grade inteira já diz.
   */
  const vaiFiltrar = modalidades.length > 1;

  const itensDoMenu: ItemDoMenu[] = [
    { href: "/videos", rotulo: "Todas as modalidades" },
    ...modalidades.map((categoria) => ({
      href: `/videos/modalidade/${categoria.slug}`,
      rotulo: categoria.rotulo,
    })),
  ];

  const rotuloDoRecorte = modalidade ? rotuloDaCategoria(modalidade) : "";
  const quantos = doRecorte.length;

  return (
    <Container>
      <TituloDaPagina
        titulo="Vídeos"
        descricao="Entrevistas, coletivas, análises e cobertura em vídeo."
      />

      {quantos === 0 ? (
        // Mesmo tratamento do Arsenal sem review: a seção existe e diz que está
        // em preparação, em vez de mostrar uma grade vazia.
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-linha px-6 py-20 text-center">
          <p className="font-manchete text-2xl font-bold uppercase tracking-wide text-texto">
            Em breve
          </p>
          <p className="mt-3 max-w-md text-texto-suave">
            A biblioteca de vídeos do MBK News está sendo montada. Volte em
            breve para conferir.
          </p>
        </div>
      ) : (
        <>
          {vaiFiltrar ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-linha pb-5">
              <MenuSuspenso
                rotulo="Modalidades"
                itens={itensDoMenu}
                variante="campo"
                selecionado={rotuloDoRecorte || undefined}
              />
              <p aria-live="polite" className="text-xs text-texto-fraco">
                {quantos === 1 ? "1 vídeo" : `${quantos} vídeos`}
                {rotuloDoRecorte ? ` em ${rotuloDoRecorte}` : ""}
                {total > 1 ? ` — página ${pagina} de ${total}` : ""}
              </p>
            </div>
          ) : null}

          {/* O card grande abre a listagem, para o bloco ser reconhecido como
              vídeo de longe. Só na primeira página. */}
          {principal && pagina === 1 ? (
            <section className="mt-8">
              <SectionHeader titulo="Em destaque" />
              <div className="mt-6">
                <VideoCard
                  video={paraCardDeVideo(
                    principal,
                    rotuloDaCategoria(principal.categoria)
                  )}
                  variante="destaque"
                  preload
                />
              </div>
            </section>
          ) : null}

          {naGrade.length > 0 ? (
            <section className="mt-12">
              <SectionHeader
                titulo={pagina === 1 ? "Todos os vídeos" : "Mais vídeos"}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {naGrade.map((video) => (
                  <VideoCard key={video.slug} video={video} />
                ))}
              </div>
            </section>
          ) : null}

          <Paginacao
            base={baseDaListagem(modalidade)}
            pagina={pagina}
            total={total}
          />
        </>
      )}
    </Container>
  );
}
