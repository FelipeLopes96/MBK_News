import type { ValorQualificado } from "@/lib/conteudo";

export type LinhaDaFicha = {
  rotulo: string;
  /** Valor simples ou valor com atribuição; linhas sem valor não aparecem. */
  valor?: string | ValorQualificado;
};

function partes(valor: LinhaDaFicha["valor"]): ValorQualificado | undefined {
  return typeof valor === "string" ? { valor } : valor;
}

/**
 * Ficha de dados das páginas de entidade — categoria, período, cartel.
 *
 * Uma linha pode vir com atribuição (`{ valor, qualificacao }`), e nesse caso a
 * atribuição é exibida junto do valor, em cor mais baixa: é o que impede que um
 * dado declarado pelo próprio personagem seja lido como número oficial. Linhas
 * atribuídas ocupam a largura toda, porque a atribuição não cabe numa coluna.
 */
export default function FichaDeEntidade({
  linhas,
  className = "mt-6",
}: {
  linhas: LinhaDaFicha[];
  className?: string;
}) {
  const preenchidas = linhas
    .map((linha) => ({ rotulo: linha.rotulo, ...partes(linha.valor) }))
    .filter((linha) => linha.valor);

  if (preenchidas.length === 0) {
    return null;
  }

  return (
    <dl
      className={`${className} grid grid-cols-1 gap-4 rounded-lg border border-linha bg-superficie p-5 sm:grid-cols-3`}
    >
      {preenchidas.map((linha) => (
        <div
          key={linha.rotulo}
          className={linha.qualificacao ? "sm:col-span-3" : undefined}
        >
          <dt className="text-[10px] font-bold uppercase tracking-widest text-texto-fraco">
            {linha.rotulo}
          </dt>
          <dd className="mt-1 text-sm font-medium text-texto">
            {linha.valor}
            {/* Entre parênteses, e não depois de vírgula, porque o valor em si
                já vem cheio de vírgulas ("25 vitórias, 4 derrotas e 1 empate"). */}
            {linha.qualificacao ? (
              <span className="font-normal text-texto-fraco">
                {" "}
                ({linha.qualificacao})
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
