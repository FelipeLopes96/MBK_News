import Link from "next/link";
import CampoDeBusca from "@/app/components/CampoDeBusca";
import Container from "@/app/components/Container";
import SectionHeader from "@/app/components/SectionHeader";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import { getProximosEventos } from "@/lib/eventos";
import { getTodosOsVideos } from "@/lib/videos";
import { getTodos as getReviewsDoArsenal } from "@/lib/arsenal";

/**
 * A tela de endereço que não existe.
 *
 * Escrita uma vez e usada pelos dois `not-found`: o do route group `(site)`,
 * que já vem com a casca do portal, e o da raiz, que precisa montá-la à mão.
 *
 * O que ela oferece é busca, e não um botão de "voltar ao início". Quem cai
 * aqui quase sempre queria uma matéria específica — clicou num link velho ou o
 * slug mudou —, e mandá-la para a home é fazê-la recomeçar do zero. O campo é o
 * mesmo do menu mobile, na variante de largura cheia.
 *
 * As descrições das seções não são escritas aqui: são as que cada página já usa
 * na própria abertura. Um texto novo para as mesmas seções seria uma segunda
 * versão para manter.
 */

/** Quantos cartões a fileira mostra. Três enche a linha nos dois layouts. */
const SECOES_OFERECIDAS = 3;

export default function PaginaNaoEncontrada() {
  /*
   * Só seção com conteúdo entra, na ordem da navegação. Oferecer Vídeos numa
   * biblioteca vazia seria mandar quem já errou o endereço para uma tela de "em
   * breve" — o segundo beco sem saída seguido.
   */
  const candidatas = [
    {
      href: "/noticias",
      titulo: "Notícias",
      descricao: "O acervo completo do MBK News, da mais recente para a mais antiga.",
      tem: true,
    },
    {
      href: "/videos",
      titulo: "Vídeos",
      descricao: "Entrevistas, coletivas, análises e cobertura em vídeo.",
      tem: getTodosOsVideos().length > 0,
    },
    {
      href: "/eventos",
      titulo: "Eventos",
      descricao:
        "Os próximos eventos dos esportes de combate, do mais próximo ao mais distante.",
      tem: getProximosEventos().length > 0,
    },
    {
      href: "/arquivo",
      titulo: "Arquivo",
      descricao: "Histórias, guias e explicações sobre esportes de combate.",
      tem: true,
    },
    {
      href: "/arsenal",
      titulo: "Arsenal",
      descricao: "Rankings e análises de equipamento.",
      tem: getReviewsDoArsenal().length > 0,
    },
  ];

  const secoes = candidatas
    .filter((secao) => secao.tem)
    .slice(0, SECOES_OFERECIDAS);

  return (
    <Container>
      <TituloDaPagina
        titulo="Página não encontrada"
        descricao="O endereço que você abriu não existe ou saiu do ar."
      />

      <div className="mt-8 max-w-xl">
        <CampoDeBusca variante="cheia" />
      </div>

      <section className="mt-12">
        <SectionHeader titulo="Por onde continuar" variante="rotulo" />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="group flex flex-col rounded-lg border border-linha bg-superficie p-5 transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              <span className="text-lg font-semibold text-texto transition-colors group-hover:text-marca-clara">
                {secao.titulo}
              </span>
              <span className="mt-1 text-sm leading-6 text-texto-suave">
                {secao.descricao}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
