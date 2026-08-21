import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

/**
 * Casca do portal.
 *
 * O Header era importado à mão por doze páginas e o Footer vivia no layout
 * raiz — o que o fazia aparecer também no painel editorial. Com o route group,
 * a casca do site fica num lugar só e o `/admin`, que é interno, fica de fora
 * dela. Route group não entra na URL: as rotas continuam em /, /noticias,
 * /mma e assim por diante.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
