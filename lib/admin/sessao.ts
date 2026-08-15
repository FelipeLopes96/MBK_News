import { cookies } from "next/headers";
import { COOKIE_DA_SESSAO, criarToken, iguais, tokenValido } from "@/lib/admin/token";

/**
 * O painel tem um login único compartilhado pela redação: não há cadastro nem
 * banco de usuários, só a senha em `ADMIN_SENHA`. A sessão é um cookie assinado
 * — não guarda nada além do prazo de validade, então não há o que vazar se o
 * cookie for lido.
 */

export function senhaConfere(senha: string): boolean {
  const esperada = process.env.ADMIN_SENHA;
  if (!esperada) {
    throw new Error("ADMIN_SENHA não definida — o painel não sobe sem ela.");
  }
  return iguais(senha, esperada);
}

export async function abrirSessao(): Promise<void> {
  const { token, expiraEm } = criarToken();
  const armazem = await cookies();

  armazem.set(COOKIE_DA_SESSAO, token, {
    httpOnly: true,
    // Em dev o site roda em http; exigir HTTPS aqui impediria o login local.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

export async function fecharSessao(): Promise<void> {
  const armazem = await cookies();
  armazem.delete(COOKIE_DA_SESSAO);
}

/**
 * Checagem de verdade da sessão, feita no servidor a cada uso. O `proxy.ts`
 * barra o tráfego óbvio na borda, mas Server Actions são endpoints públicos:
 * quem tiver o ID da action consegue chamá-la sem passar pela tela. Toda ação
 * do painel começa por aqui.
 */
export async function temSessao(): Promise<boolean> {
  const armazem = await cookies();
  return tokenValido(armazem.get(COOKIE_DA_SESSAO)?.value);
}
