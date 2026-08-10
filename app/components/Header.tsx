import Link from "next/link";
import MenuMobile from "@/app/components/MenuMobile";
import { categorias } from "@/lib/noticias";

const secoes = [
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/arsenal", rotulo: "Arsenal" },
];

/** Mesma navegação da barra, em lista única — é o que o menu mobile mostra. */
const linksDoMenu = [
  { href: "/", rotulo: "Notícias" },
  ...categorias.map((categoria) => ({
    href: `/${categoria.slug}`,
    rotulo: categoria.rotulo,
  })),
  ...secoes,
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#1A1A1A] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href="/"
            className="shrink-0 text-2xl font-extrabold tracking-tight text-[#F97316]"
          >
            O Corner
          </Link>

          {/* Tagline só a partir de lg — abaixo disso não cabe ao lado do menu. */}
          <span aria-hidden="true" className="hidden text-zinc-600 lg:inline">
            |
          </span>
          <span className="hidden truncate text-base text-zinc-400 lg:inline">
            A referência digital em esportes de combate
          </span>
        </div>

        {/* Abaixo de lg os links não cabem na linha: viram o menu de hambúrguer. */}
        <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium lg:flex lg:text-base">
          <Link href="/" className="transition-colors hover:text-[#F97316]">
            Notícias
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/${categoria.slug}`}
              className="transition-colors hover:text-[#F97316]"
            >
              {categoria.rotulo}
            </Link>
          ))}

          <span aria-hidden="true" className="h-4 w-px bg-zinc-800" />

          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="transition-colors hover:text-[#F97316]"
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
