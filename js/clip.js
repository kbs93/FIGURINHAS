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
 * Mantém compatibilidade com ambos os nomes de importação
 */
export async function copiarFigurinha(url) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard não suportado');
  }

  const blobPromise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('Erro ao baixar imagem');
      return res.blob();
    })
    .then((blob) => {
      if (blob.type === 'image/png') return blob;
      return converterParaPNG(blob);
    });

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blobPromise
    })
  ]);
}

export { copiarFigurinha as copiarFigurinhaParaClipboard };