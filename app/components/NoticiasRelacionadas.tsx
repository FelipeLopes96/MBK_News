import SectionHeader from "@/app/components/SectionHeader";
import NoticiaCard from "@/app/components/NoticiaCard";
import { getNoticiasRelacionadas, type Noticia } from "@/lib/noticias";

/** Quantas entram no bloco — duas ocupam a largura da coluna de leitura. */
const QUANTAS = 2;

/**
 * "Leia também" no fim da matéria.
 *
 * A escolha é por proximidade de assunto, não por recência: quem terminou de
 * ler sobre um card do UFC tende a querer outra do UFC, e não a próxima notícia
 * qualquer do acervo.
 */
export default function NoticiasRelacionadas({
  noticia,
}: {
  noticia: Noticia;
}) {
  const relacionadas = getNoticiasRelacionadas(noticia, QUANTAS);

  if (relacionadas.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <SectionHeader titulo="Leia também" />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {relacionadas.map((relacionada) => (
          <NoticiaCard key={relacionada.slug} noticia={relacionada} />
        ))}
      </div>
    </section>
  );
}
