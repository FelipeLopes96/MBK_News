import Link from "next/link";
import Container from "@/app/components/Container";
import EventosSidebar from "@/app/components/EventosSidebar";
import HeroDestaque from "@/app/components/HeroDestaque";
import ListaCompacta from "@/app/components/ListaCompacta";
import { BASE_DE_NOTICIAS } from "@/app/components/ListaDeNoticias";
import MaisLidas from "@/app/components/MaisLidas";
import NoticiaCard from "@/app/components/NoticiaCard";
import SectionHeader from "@/app/components/SectionHeader";
import VideosEmDestaque from "@/app/components/VideosEmDestaque";
import { getTodos as getArtigosDoArquivo } from "@/lib/arquivo";
import { getTodos as getReviewsDoArsenal } from "@/lib/arsenal";
import { getNoticiaDestaque, getTodasNoticias } from "@/lib/noticias";

/**
 * Hierarquia da home: uma manchete, duas chamadas secundárias e o feed.
 *
 * O teto existe para a home não crescer junto com o acervo — o que passa daqui
 * vive em /noticias, que pagina o histórico completo.
 */
const SECUNDARIAS = 2;
const NOTICIAS_NO_FEED = 6;

/**
 * A lateral traz a agenda, que depende de que dia é hoje. Sem revalidação, o
 * que fica no ar é a agenda do último deploy — e um evento do fim de semana
 * passado continuaria listado como próximo.
 */
export const revalidate = 3600;

export default function Home() {
  const destaque = getNoticiaDestaque();
  const restantes = getTodasNoticias().filter(
    (noticia) => noticia.slug !== destaque?.slug
  );

  const secundarias = restantes.slice(0, SECUNDARIAS);
  const feed = restantes.slice(SECUNDARIAS, SECUNDARIAS + NOTICIAS_NO_FEED);

  return (
    <Container>
      {/*
        Duas colunas de lg em diante; abaixo disso, uma só, e a coluna lateral
        vira a sequência de seções no fim da página. É o que o layout anterior
        fazia com `display: contents` e nove classes de `order` intercalando
        sidebar e notícias — funcionava, mas cada módulo novo (Mais lidas,
        Vídeos) exigia renumerar tudo.
      */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-8">
          {destaque ? <HeroDestaque noticia={destaque} /> : null}

          {secundarias.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {secundarias.map((noticia) => (
                <NoticiaCard
                  key={noticia.slug}
                  noticia={noticia}
                  variante="media"
                />
              ))}
            </div>
          ) : null}

          <section>
            <SectionHeader titulo="Últimas Notícias" />

            {feed.length === 0 ? (
              <p className="mt-6 text-texto-suave">
                {destaque
                  ? "Nenhuma outra notícia publicada ainda."
                  : "Nenhuma notícia publicada ainda."}
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {feed.map((noticia) => (
                    <NoticiaCard key={noticia.slug} noticia={noticia} />
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Link
                    href={BASE_DE_NOTICIAS}
                    className="rounded-md border border-linha bg-superficie px-5 py-2.5 text-sm font-medium text-texto transition-colors hover:border-marca hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
                  >
                    Ver todas as notícias →
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>

        {/*
          Cada módulo se esconde sozinho quando não tem conteúdo, e como não há
          `div` de embrulho em volta deles, um módulo ausente não deixa buraco
          de `gap` na coluna.
        */}
        <aside className="flex flex-col gap-6">
          <EventosSidebar />
          <VideosEmDestaque />
          <MaisLidas />
          <ListaCompacta
            titulo="Arquivo MBK News"
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
        </aside>
      </div>
    </Container>
  );
}
