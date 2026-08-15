import FormularioDeLogin from "@/app/admin/login/FormularioDeLogin";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-extrabold tracking-tight text-white">
        Painel editorial
      </h1>
      <p className="mt-2 mb-8 text-sm text-zinc-500">
        Acesso restrito à redação de O Corner.
      </p>

      <FormularioDeLogin />
    </main>
  );
}
