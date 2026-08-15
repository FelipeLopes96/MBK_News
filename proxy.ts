import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_DA_SESSAO, tokenValido } from "@/lib/admin/token";

/**
 * Barreira de borda do painel: sem sessão, `/admin` vira `/admin/login`.
 * É uma checagem otimista — quem valida de verdade é cada Server Action, que é
 * um endpoint público e não depende de a tela ter sido renderizada.
 */
export function proxy(request: NextRequest) {
  const autenticado = tokenValido(
    request.cookies.get(COOKIE_DA_SESSAO)?.value
  );
  const noLogin = request.nextUrl.pathname === "/admin/login";

  if (!autenticado && !noLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (autenticado && noLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// `/admin` vem listado à parte do padrão com curinga para não depender de o
// `:path*` casar com o caminho-raiz.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
