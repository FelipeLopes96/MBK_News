import EventosSidebar from "@/app/components/EventosSidebar";
import Header from "@/app/components/Header";
import HeroDestaque from "@/app/components/HeroDestaque";
import ListaCompacta from "@/app/components/ListaCompacta";
import NewsGrid from "@/app/components/NewsGrid";
import NewsletterForm from "@/app/components/NewsletterForm";
import { getTodos as getArtigosDoArquivo } from "@/lib/arquivo";
import { getTodos as getReviewsDoArsenal } from "@/lib/arsenal";
import { getNoticiaDestaque, getTodasNoticias } from "@/lib/noticias";

export default function Home() {
  const destaque = getNoticiaDestaque();
  const ultimas = getTodasNoticias().filter(
    (noticia) => noticia.slug !== destaque?.slug
  );

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Coluna principal */}
          <div>
            {destaque && <HeroDestaque noticia={destaque} />}

            <section className="mt-12">
              <h2 className="border-b border-zinc-800 pb-3 text-xl font-bold tracking-tight text-white">
                Últimas Notícias
              </h2>
              <NewsGrid noticias={ultimas} colunas={2} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <EventosSidebar />
            <ListaCompacta
              titulo="Arquivo do Corner"
              itens={getArtigosDoArquivo().slice(0, 3)}
              baseHref="/arquivo"
              verTodosHref="/arquivo"
            />
            <ListaCompacta
              titulo="Arsenal"
              itens={getReviewsDoArsenal().slice(0, 3)}
              baseHref="/arsenal"
              verTodosHref="/arsenal"
            />
            <NewsletterForm />
          </aside>
        </div>
      </main>
    </div>
  );
}
