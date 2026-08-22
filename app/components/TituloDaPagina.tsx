/**
 * Abertura de página: o `h1` e a linha de apoio.
 *
 * Vale para toda listagem do portal — acervo, categoria, Arquivo, Arsenal,
 * busca. Cada tela escrevia o seu com um tamanho e um peso diferentes; com um
 * componente, mudar a abertura muda em todas de uma vez.
 *
 * A condensada aparece aqui porque título de seção é texto curto: é onde ela
 * dá o tom de veículo esportivo sem custar legibilidade.
 */
export default function TituloDaPagina({
  titulo,
  descricao,
  className = "",
}: {
  titulo: string;
  descricao?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <h1 className="font-manchete text-3xl font-bold uppercase tracking-wide text-texto sm:text-4xl">
        {titulo}
      </h1>

      {descricao ? (
        <p className="mt-2 max-w-2xl text-texto-suave">{descricao}</p>
      ) : null}
    </header>
  );
}
