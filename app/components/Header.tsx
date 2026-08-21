import Image from "next/image";
import Link from "next/link";
import CampoDeBusca from "@/app/components/CampoDeBusca";
import MenuMobile from "@/app/components/MenuMobile";
import Navegacao from "@/app/components/Navegacao";
import { secoesPrincipais } from "@/lib/navegacao";
import { categorias } from "@/lib/noticias";

/**
 * Cabeçalho do portal, em duas faixas.
 *
 * A faixa de cima é a marca e a busca; a de baixo, as seções. Numa linha só,
 * onze seções brigariam com o logo pelo espaço horizontal — é o formato que
 * jornal usa justamente porque a navegação de um portal não cabe ao lado da
 * marca. No mobile a segunda faixa não existe: as seções vão para o menu.
 *
 * Server Component: as categorias vêm do disco aqui e descem prontas para os
 * dois componentes de cliente.
 */
export default function Header() {
  const secoes = secoesPrincipais(categorias);

  return (
    <header className="sticky top-0 z-50 border-b border-linha bg-fundo/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca"
        >
          <Image
            src="/marca/mbk-news.png"
            alt="MBK News"
            width={620}
            height={218}
            // Está na barra fixa de toda página: carregar junto com o topo
            // evita o logo aparecendo depois do resto do cabeçalho.
            loading="eager"
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {/* Abaixo de lg a busca vive dentro do menu, onde há largura. */}
          <div className="hidden lg:block">
            <CampoDeBusca />
          </div>

          <MenuMobile secoes={secoes} />
        </div>
      </div>

      <nav
        aria-label="Seções do MBK News"
        className="hidden border-t border-linha lg:block"
      >
        <Navegacao itens={secoes} />
      </nav>
    </header>
  );
}
