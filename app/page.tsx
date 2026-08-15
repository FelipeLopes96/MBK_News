import EventosSidebar from "@/app/components/EventosSidebar";
import Header from "@/app/components/Header";
import HeroDestaque from "@/app/components/HeroDestaque";
import ListaCompacta from "@/app/components/ListaCompacta";
import NoticiaCard from "@/app/components/NoticiaCard";
import { getTodos as getArtigosDoArquivo } from "@/lib/arquivo";
import { getTodos as getReviewsDoArsenal } from "@/lib/arsenal";
import { getNoticiaDestaque, getTodasNoticias } from "@/lib/noticias";

export default function Home() {
  const destaque = getNoticiaDestaque();
  const ultimas = getTodasNoticias().filter(
    (noticia) => noticia.slug !== destaque?.slug
  );
  const reviews = getReviewsDoArsenal().slice(0, 3);

  // No mobile os cards da sidebar entram no meio das notícias; no desktop os
  // três blocos voltam a ser um grid contínuo. Daí cada bloco carregar a classe
  // de `order` que o coloca na posição certa da coluna única.
  const blocosDeNoticias = [
    { noticias: ultimas.slice(0, 3), ordem: "order-3" },
    { noticias: ultimas.slice(3, 6), ordem: "order-5" },
    { noticias: ultimas.slice(6), ordem: "order-8" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6 lg:py-10">
        {/*
          Abaixo de lg os dois grupos viram `display: contents`: seus filhos
          passam a ser itens desta coluna flex única e o `order` intercala
          notícias e sidebar. De lg em diante cada grupo volta a ser uma caixa —
          a principal como grid de 2 colunas (todos os cards nele, sem buracos
          entre os blocos) e a sidebar como pilha. Os `order` são crescentes
          dentro de cada grupo, então não mudam nada no desktop.
        */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Coluna principal */}
          <div className="contents lg:grid lg:grid-cols-2 lg:gap-6">
            {destaque && (
              <HeroDestaque noticia={destaque} className="order-1 sm:col-span-2" />
            )}

            <h2 className="order-2 mt-2 mb-2 border-b border-zinc-800 pb-3 text-xl font-bold tracking-tight text-white sm:col-span-2 lg:mt-6">
              Últimas Notícias
            </h2>

            {blocosDeNoticias.map((bloco) =>
              bloco.noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.slug}
                  noticia={noticia}
                  className={bloco.ordem}
                />
              ))
            )}

            {ultimas.length === 0 && (
              <p className="order-3 text-zinc-400 sm:col-span-2">
                Nenhuma notícia publicada ainda.
              </p>
            )}
          </div>

          {/*
            Sidebar. Entre sm e lg a página é um grid de 2 colunas de notícias,
            então esses cards ocupam a linha inteira; de lg em diante viram a
            coluna da direita e o col-span deixa de valer.
          */}
          <aside className="contents lg:flex lg:flex-col lg:gap-6">
            <div className="order-4 sm:col-span-2">
              <EventosSidebar />
            </div>

            <div className="order-6 sm:col-span-2">
              <ListaCompacta
                titulo="Arquivo do Corner"
                itens={getArtigosDoArquivo().slice(0, 3)}
                baseHref="/arquivo"
                verTodosHref="/arquivo"
              />
            </div>

            {/*
              Sem review publicada, `ListaCompacta` não renderiza nada — mas o
              wrapper continuaria contando como filho do flex e somando um
              `gap-6` de espaço morto no fim da coluna. Por isso a condição fica
              aqui fora, não dentro do componente.
            */}
            {reviews.length > 0 && (
              <div className="order-7 sm:col-span-2">
                <ListaCompacta
                  titulo="Arsenal"
                  itens={reviews}
                  baseHref="/arsenal"
                  verTodosHref="/arsenal"
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
