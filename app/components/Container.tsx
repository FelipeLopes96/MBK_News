/**
 * Faixa central de conteúdo.
 *
 * Duas larguras, e não uma qualquer por página: `conteudo` para grades e
 * listagens, `leitura` para texto corrido — onde a linha longa cansa a vista e
 * a medida precisa ser mais estreita. Antes cada tela repetia o `mx-auto
 * w-full max-w-… px-6 py-10` na mão, e as medidas já divergiam entre elas.
 */
export type LarguraDoContainer = "conteudo" | "leitura";

const larguras: Record<LarguraDoContainer, string> = {
  conteudo: "max-w-6xl",
  leitura: "max-w-3xl",
};

/**
 * O espaçamento vertical é prop, e não classe extra do chamador, porque duas
 * classes `py-` na mesma lista não têm ordem garantida: quem ganha é a que vem
 * depois no CSS, não na string.
 */
export type EspacamentoDoContainer = "padrao" | "compacto" | "nenhum";

const espacamentos: Record<EspacamentoDoContainer, string> = {
  padrao: "py-10",
  compacto: "py-6",
  nenhum: "",
};

export default function Container({
  children,
  largura = "conteudo",
  espacamento = "padrao",
  como: Como = "div",
  className = "",
}: {
  children: React.ReactNode;
  largura?: LarguraDoContainer;
  espacamento?: EspacamentoDoContainer;
  /** Elemento renderizado — use `article` em página de leitura. */
  como?: "div" | "article" | "section";
  className?: string;
}) {
  return (
    <Como
      className={`mx-auto w-full ${larguras[largura]} px-6 ${espacamentos[espacamento]} ${className}`}
    >
      {children}
    </Como>
  );
}
