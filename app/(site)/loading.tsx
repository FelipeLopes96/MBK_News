import Container from "@/app/components/Container";

/**
 * Estado de carregamento das páginas do portal.
 *
 * Quase tudo aqui é estático e pré-carregado pelo `Link`, então esta tela
 * raramente aparece — ela existe para a conexão ruim, onde a alternativa é o
 * leitor tocar num link e não ver nada acontecer.
 *
 * O esqueleto é deliberadamente genérico: um título e uma grade. Um esqueleto
 * que promete um layout diferente do que vai chegar é pior que nenhum, porque
 * a página "pula" quando o conteúdo entra.
 */
export default function Carregando() {
  return (
    <Container>
      {/* `aria-busy` e o texto oculto contam a mesma coisa a quem não vê o
          esqueleto piscando. */}
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando…</span>

        <div className="h-9 w-56 animate-pulse rounded bg-superficie" />
        <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-superficie" />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, indice) => (
            <div
              key={indice}
              className="overflow-hidden rounded-lg border border-linha bg-superficie"
            >
              <div className="aspect-video w-full animate-pulse bg-superficie-alta" />
              <div className="flex flex-col gap-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-superficie-alta" />
                <div className="h-4 w-full animate-pulse rounded bg-superficie-alta" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-superficie-alta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
