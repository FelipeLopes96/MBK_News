import Image from "next/image";
import Link from "next/link";
import MenuMobile, { type LinkDoMenu } from "@/app/components/MenuMobile";
import { secoesDoArquivo } from "@/lib/navegacao";
import { categorias } from "@/lib/noticias";

const secoes = [
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/arsenal", rotulo: "Arsenal" },
];

/**
 * Mesma navegação da barra, em lista única — é o que o menu mobile mostra. O
 * Arquivo leva suas sub-seções, que o menu expande no lugar em vez de exigir
 * uma parada na página do Arquivo para escolher.
 */
const linksDoMenu: LinkDoMenu[] = [
  { href: "/noticias", rotulo: "Notícias" },
  ...categorias.map((categoria) => ({
    href: `/${categoria.slug}`,
    rotulo: categoria.rotulo,
  })),
  ...secoes.map((secao) =>
    secao.href === "/arquivo" ? { ...secao, subitens: secoesDoArquivo } : secao
  ),
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-linha bg-fundo text-texto">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        {/* A tagline saiu daqui: com nove seções na barra, o espaço horizontal é
            todo da navegação. Ela continua no Footer. */}
        <Link href="/" className="shrink-0">
          <Image
            src="/marca/mbk-news.png"
            alt="MBK News"
            width={620}
            height={218}
            // Está na barra fixa de toda página: carregar junto com o topo
            // evita o logo aparecendo depois do resto do cabeçalho.
            loading="eager"
            className="h-9 w-auto"
          />
        </Link>

        {/* Abaixo de lg os links não cabem na linha: viram o menu de hambúrguer. */}
        <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium lg:flex lg:text-base">
          <Link
            href="/noticias"
            className="transition-colors hover:text-marca-clara"
          >
            Notícias
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/${categoria.slug}`}
              className="transition-colors hover:text-marca-clara"
            >
              {categoria.rotulo}
            </Link>
          ))}

          <span aria-hidden="true" className="h-4 w-px bg-linha-forte" />

          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="transition-colors hover:text-marca-clara"
            >
              {secao.rotulo}
            </Link>
          ))}
        </nav>

        <MenuMobile links={linksDoMenu} />
      </div>
    </header>
  );
}
