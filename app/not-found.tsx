import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import PaginaNaoEncontrada from "@/app/components/PaginaNaoEncontrada";

/**
 * 404 de endereço que não casa rota alguma — /foo/bar/baz.
 *
 * Esse caso é recusado na roteagem, antes de qualquer layout rodar, então o
 * layout do `(site)` não entra e o Header e o Footer precisam ser montados aqui.
 * Repetir a casca é o preço de o portal ter a sua num route group: sem isso, o
 * leitor cairia numa tela solta, sem navegação nem marca, e sem nem saber em que
 * site está.
 */
export default function NaoEncontradoGlobal() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PaginaNaoEncontrada />
      </main>
      <Footer />
    </>
  );
}
