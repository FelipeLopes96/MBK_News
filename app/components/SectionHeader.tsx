import Link from "next/link";

/**
 * Cabeçalho de bloco — "Últimas Notícias", "Próximos Eventos", "Mais Lidas".
 *
 * Duas variantes, porque o site usa dois pesos diferentes de abertura de bloco:
 * `secao` abre uma seção da página, com filete embaixo; `modulo` nomeia um card
 * de sidebar, onde um título grande brigaria com o conteúdo. A ação opcional é a
 * linha "Ver todos" que vários módulos repetiam à mão.
 */

export type VarianteDeCabecalho = "secao" | "modulo" | "rotulo";

export default function SectionHeader({
  titulo,
  variante = "secao",
  acao,
  className = "",
}: {
  titulo: string;
  variante?: VarianteDeCabecalho;
  /** Link à direita do título, ex.: { rotulo: "Ver todos", href: "/videos" }. */
  acao?: { rotulo: string; href: string };
  className?: string;
}) {
  if (variante === "rotulo") {
    return (
      <h2
        className={`text-xs font-bold uppercase tracking-widest text-texto-fraco ${className}`}
      >
        {titulo}
      </h2>
    );
  }

  const ehSecao = variante === "secao";

  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        ehSecao ? "border-b border-linha pb-3" : ""
      } ${className}`}
    >
      <h2
        className={
          ehSecao
            ? "font-manchete text-2xl font-bold uppercase tracking-wide text-texto"
            : "text-sm font-bold uppercase tracking-wide text-texto"
        }
      >
        {titulo}
      </h2>

      {acao ? (
        <Link
          href={acao.href}
          className="shrink-0 text-xs font-medium text-marca-clara hover:underline"
        >
          {acao.rotulo}
        </Link>
      ) : null}
    </div>
  );
}
