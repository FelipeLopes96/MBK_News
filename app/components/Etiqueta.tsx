import Link from "next/link";

/**
 * Etiqueta de seção — categoria da matéria, tipo de entidade, "AO VIVO".
 *
 * Existe porque este pedaço de marcação estava repetido em seis lugares, com
 * padding, tamanho e cor divergindo em cada um. Aqui a variante escolhe o peso
 * visual e nada mais precisa ser decidido no chamador.
 */

export type VarianteDeEtiqueta = "solida" | "texto" | "urgente";

const classes: Record<VarianteDeEtiqueta, string> = {
  /** Pastilha cheia: usada onde a etiqueta compete com foto ou manchete. */
  solida:
    "rounded bg-marca px-2 py-0.5 text-[10px] text-texto sm:px-2.5 sm:py-1 sm:text-xs",
  /** Só o rótulo, para dentro de card — a pastilha pesaria demais ali. */
  texto: "text-[10px] text-marca-clara sm:text-xs",
  /** Reservada a breaking news e transmissão ao vivo. */
  urgente:
    "rounded bg-urgente px-2 py-0.5 text-[10px] text-fundo sm:px-2.5 sm:py-1 sm:text-xs",
};

export default function Etiqueta({
  children,
  variante = "solida",
  href,
  className = "",
}: {
  children: React.ReactNode;
  variante?: VarianteDeEtiqueta;
  /** Com href a etiqueta vira link para a seção. */
  href?: string;
  className?: string;
}) {
  const classe = `inline-block font-bold uppercase tracking-wide ${classes[variante]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${classe} transition-opacity hover:opacity-90`}
      >
        {children}
      </Link>
    );
  }

  return <span className={classe}>{children}</span>;
}
