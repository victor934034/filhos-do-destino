/**
 * Aparece na hora do clique, enquanto a página seguinte busca dados no banco (agora
 * remoto — sem isso a tela ficava parada na anterior até tudo chegar, parecendo travada).
 * Um `loading.tsx` só aqui cobre a navegação entre QUALQUER página dentro de /app,
 * porque o layout (barra lateral) não desmonta — só o conteúdo principal é trocado.
 */
export default function CarregandoApp() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-10 w-10 animate-ping rounded-full border border-ouro/50" />
        <span className="h-3 w-3 rotate-45 animate-pulse bg-ouro" />
      </span>
    </div>
  );
}
