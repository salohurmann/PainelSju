/**
 * Imprime só um documento (autorização, relatório, comprovante), em A4 e
 * sempre no tema claro, sem o resto da tela por trás.
 *
 * Uso: dê um `ref` ao elemento do documento e chame `imprimir(ref.current, 'Título')`.
 * Botões e controles dentro dele com `data-nao-imprimir` ficam de fora.
 */
export function imprimir(elemento: HTMLElement | null, titulo: string): void {
  if (!elemento) {
    window.print();
    return;
  }
  document.getElementById('area-impressao')?.remove();

  const area = document.createElement('div');
  area.id = 'area-impressao';
  area.setAttribute('aria-hidden', 'true');

  const cabecalho = document.createElement('div');
  cabecalho.className = 'impressao-cabecalho';
  const marca = document.createElement('strong');
  marca.textContent = 'Seju.';
  const orgao = document.createElement('span');
  orgao.textContent = 'Secretaria de Estado da Justiça e Cidadania do Paraná';
  const quando = document.createElement('span');
  quando.textContent = `${titulo} · impresso em ${new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;
  cabecalho.append(marca, orgao, quando);

  const copia = elemento.cloneNode(true) as HTMLElement;
  copia.querySelectorAll('[data-nao-imprimir], button').forEach(n => n.remove());
  copia.removeAttribute('id');

  area.append(cabecalho, copia);
  document.body.append(area);

  const tituloAnterior = document.title;
  document.title = titulo;
  document.documentElement.classList.add('imprimindo');

  let limpo = false;
  const limpar = () => {
    if (limpo) return;
    limpo = true;
    document.documentElement.classList.remove('imprimindo');
    document.title = tituloAnterior;
    area.remove();
    window.removeEventListener('afterprint', limpar);
  };
  window.addEventListener('afterprint', limpar);
  // Dá um quadro para o navegador montar a área antes de abrir a janela de impressão.
  requestAnimationFrame(() => {
    window.print();
    setTimeout(limpar, 1000);
  });
}
