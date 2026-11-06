/**
 * Converte para PNG transparente 512x512 com margem de 4px
 * Idêntico ao padrão funcional do Zap Figurinhas
 */
async function converterParaPNG(blob) {
  const bitmap = await createImageBitmap(blob);
  const tamanho = 512;
  const margem = 4;

  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');

  // Fundo transparente
  ctx.clearRect(0, 0, tamanho, tamanho);

  // Escala mantendo proporção com margem de 4px
  const maxWidth = tamanho - (margem * 2);
  const maxHeight = tamanho - (margem * 2);
  const escala = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height);

  const width = bitmap.width * escala;
  const height = bitmap.height * escala;

  const x = (tamanho - width) / 2;
  const y = (tamanho - height) / 2;

  ctx.drawImage(bitmap, x, y, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((res) => {
      if (res) resolve(res);
      else reject(new Error('Erro ao converter imagem no canvas'));
    }, 'image/png');
  });
}

/**
 * Grava a imagem na Área de Transferência (Clipboard)
 * Otimizado para o botão "Colar" do teclado Android aparecer instantaneamente
 */
export async function copiarFigurinha(url) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard não suportado');
  }

  // 1. Resolve o download e a conversão ANTES de mexer no ClipboardItem
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao baixar imagem');
  let blob = await res.blob();

  if (blob.type !== 'image/png') {
    blob = await converterParaPNG(blob);
  }

  // 2. Grava o dado bruto imediatamente (sem passar Promises lentas por dentro)
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob
    })
  ]);

  // 3. Força o sistema Android/Teclado a atualizar o status do Clipboard na hora
  const inputFalso = document.createElement('input');
  inputFalso.style.position = 'fixed';
  inputFalso.style.opacity = '0';
  inputFalso.style.pointerEvents = 'none';
  document.body.appendChild(inputFalso);
  inputFalso.focus();
  
  // Remove o elemento após o teclado registrar a mudança
  setTimeout(() => {
    inputFalso.blur();
    document.body.removeChild(inputFalso);
  }, 50);
}

// Mantém compatibilidade com ambos os nomes de importação que você usa
export { copiarFigurinha as copiarFigurinhaParaClipboard };