"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Menu suspenso de links.
 *
 * Compartilhado pela barra de navegação — que agrupa as seis modalidades e as
 * seções do Arquivo em vez de enfileirar onze itens — e pelo filtro da
 * biblioteca de vídeos. Eram dois menus com o mesmo comportamento de abrir,
 * fechar e marcar o item atual; o segundo a ser escrito ia divergir do primeiro
 * no fechamento por Escape, que é o tipo de detalhe que ninguém lembra de
 * repetir.
 *
 * Os itens são links de verdade, e não botões: o recorte escolhido tem endereço
 * próprio, então pode ser compartilhado, aberto em nova aba e indexado.
 */

export type ItemDoMenu = {
  href: string;
  rotulo: string;
};

type Props = {
  /** Texto do botão quando nada está selecionado — ex.: "Modalidades". */
  rotulo: string;
  itens: ItemDoMenu[];
  /**
   * Aparência. `nav` acompanha a barra de seções; `campo` desenha uma caixa,
   * para o filtro parecer um controle de formulário.
   */
  variante?: "nav" | "campo";
  /**
   * Rótulo do item atual, mostrado no botão no lugar de `rotulo`. Em `nav` o
   * botão mantém o nome do grupo — quem diz onde você está é o filete embaixo.
   */
  selecionado?: string;
  /** `true` quando a rota atual está dentro do grupo. */
  ativo?: boolean;
};

export default function MenuSuspenso({
  rotulo,
  itens,
  variante = "nav",
  selecionado,
  ativo = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const painelId = useId();
  const caminho = usePathname();

  /**
   * Navegou: o painel não pode continuar aberto sobre a página nova. A
   * comparação é durante a renderização, e não num efeito — assim o painel já
   * sai fechado no mesmo passo, sem o quadro intermediário em que ele aparece
   * aberto sobre a tela que acabou de trocar.
   */
  const [caminhoDoPainel, setCaminhoDoPainel] = useState(caminho);
  if (caminho !== caminhoDoPainel) {
    setCaminhoDoPainel(caminho);
    setAberto(false);
  }

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: PointerEvent) {
      if (!caixa.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
        // Devolve o foco ao botão: sem isto o Escape deixa o foco no vazio e a
        // navegação por teclado recomeça do topo da página.
        caixa.current?.querySelector("button")?.focus();
      }
    }

    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const ehNav = variante === "nav";

  const classeDoBotao = ehNav
    ? `inline-flex items-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca ${
        ativo
          ? "border-marca text-texto"
          : "border-transparent text-texto-suave hover:text-texto"
      }`
    : `inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca sm:min-h-9 ${
        selecionado
          ? "border-marca bg-marca text-texto"
          : "border-linha bg-superficie text-texto-corpo hover:border-linha-forte hover:text-texto"
      }`;

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((estava) => !estava)}
        aria-expanded={aberto}
        aria-controls={painelId}
        className={classeDoBotao}
      >
        {/* Em `campo` o botão assume o nome do recorte atual, porque ali ele é o
            próprio estado do filtro. */}
        <span>{!ehNav && selecionado ? selecionado : rotulo}</span>
        <span
          aria-hidden="true"
          className={`text-[0.7em] transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {aberto && (
        <ul
          id={painelId}
          // `min-w-full` e não `w-full`: o painel acompanha a largura do botão
          // quando ela basta, e cresce quando o nome da seção é mais longo.
          className="absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-md border border-linha-forte bg-superficie py-1 shadow-lg shadow-black/40"
        >
          {itens.map((item) => {
            const atual =
              caminho === item.href || caminho.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={atual ? "page" : undefined}
                  className={`block whitespace-nowrap px-4 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca ${
                    atual
                      ? "bg-marca/15 font-semibold text-marca-clara"
                      : "text-texto-corpo hover:bg-superficie-alta hover:text-texto"
                  }`}
                >
                  {item.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
