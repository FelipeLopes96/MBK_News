"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { secoesDoArquivo } from "@/lib/navegacao";

/**
 * Barra de seções do Arquivo, em abas: permite pular de Lendas para
 * Organizações ou Momentos sem voltar para /arquivo.
 *
 * A seção atual é descoberta pela rota, então nenhuma página precisa se
 * declarar — e continua correta se a rota mudar de lugar.
 */
export default function NavDoArquivo() {
  const caminho = usePathname();

  return (
    <nav aria-label="Seções do Arquivo" className="mt-5 border-b border-zinc-800">
      <ul className="flex flex-wrap gap-x-6">
        {secoesDoArquivo.map((secao) => {
          // Também marca a aba nas páginas internas da seção, ex.:
          // /arquivo/lendas/royce-gracie continua sendo "Lendas".
          const ativa =
            caminho === secao.href || caminho.startsWith(`${secao.href}/`);

          return (
            <li key={secao.href}>
              <Link
                href={secao.href}
                aria-current={ativa ? "page" : undefined}
                className={`-mb-px inline-block border-b-2 pb-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] ${
                  ativa
                    ? "border-[#F97316] text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                {secao.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
