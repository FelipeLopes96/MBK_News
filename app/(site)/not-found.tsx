import PaginaNaoEncontrada from "@/app/components/PaginaNaoEncontrada";

/**
 * 404 das rotas do portal: `notFound()` chamado numa página e endereço recusado
 * por `dynamicParams = false`.
 *
 * A casca — Header e Footer — vem do layout do `(site)`, então aqui só entra o
 * conteúdo. O gêmeo em `app/not-found.tsx` cobre o endereço que não casa rota
 * alguma, onde esse layout não roda.
 *
 * Sem `metadata` aqui: `not-found` não aceita o export, e a tela herda o título
 * do site. Testado — o título não muda. Quem quiser um título próprio precisa da
 * convenção `global-not-found`, que exige declarar html e body por conta.
 */
export default function NaoEncontrado() {
  return <PaginaNaoEncontrada />;
}
