import type { Fonte } from "@/lib/conteudo";

/**
 * Fontes consultadas, listadas no fim da matéria ou da página de entidade.
 * Fontes com `url` viram link; as demais aparecem como texto.
 */
export default function BlocoDeFontes({
  fontes,
  titulo = "Fontes",
}: {
  fontes: Fonte[];
  titulo?: string;
}) {
  if (fontes.length === 0) {
    return null;
  }

  return (
    <aside className="mt-12 border-t border-linha pt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-texto-fraco">
        {titulo}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-texto-suave">
        {fontes.map((fonte, indice) => (
          <li key={`${fonte.rotulo}-${indice}`}>
            {fonte.url ? (
              <a
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-linha-forte transition-colors hover:text-marca-clara"
              >
                {fonte.rotulo}
              </a>
            ) : (
              fonte.rotulo
            )}
            {fonte.tipo ? (
              <span className="text-texto-fraco/70"> ({fonte.tipo})</span>
            ) : null}
            {indice < fontes.length - 1 ? (
              <span aria-hidden className="ml-2 text-texto-fraco/50">
                •
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
