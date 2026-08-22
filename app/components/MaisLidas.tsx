import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import SectionHeader from "@/app/components/SectionHeader";
import { getMaisLidas } from "@/lib/maisLidas";
import { rotuloDaCategoria } from "@/lib/noticias";

/**
 * Ranking das mais lidas, numerado.
 *
 * O número é o elemento de design do bloco: em condensada e grande, ele
 * substitui a imagem que os outros módulos usam para se distinguir — e mantém a
 * sidebar leve, que é o que a lista precisa para não competir com o feed.
 *
 * Sem lista curada em `content/mais-lidas.json`, o módulo não renderiza.
 */
export default function MaisLidas() {
  const noticias = getMaisLidas();

  if (noticias.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-linha bg-superficie p-6">
      <SectionHeader titulo="Mais lidas" variante="modulo" />

      <ol className="mt-4 divide-y divide-linha">
        {noticias.map((noticia, indice) => (
          <li key={noticia.slug} className="py-3.5 first:pt-0 last:pb-0">
            <Link
              href={`/noticia/${noticia.slug}`}
              className="group flex gap-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              <span
                aria-hidden="true"
                className="font-manchete text-2xl font-bold leading-none text-texto-fraco/70 transition-colors group-hover:text-marca-clara"
              >
                {String(indice + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <Etiqueta variante="texto">
                  {rotuloDaCategoria(noticia.categoria)}
                </Etiqueta>
                <p className="mt-1 text-sm font-medium leading-snug text-texto-corpo transition-colors group-hover:text-marca-clara">
                  {noticia.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
