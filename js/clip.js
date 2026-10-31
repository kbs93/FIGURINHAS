export async function copiarFigurinhaParaClipboard(url) {
  // Diagnóstico detalhado das variáveis no momento exacto da execução
  console.log("--- TESTE NO CLIQUE ---");
  console.log("navigator.clipboard:", navigator.clipboard);
  console.log("window.ClipboardItem:", window.ClipboardItem);
  console.log("Protocolo:", window.location.protocol);
  console.log("isSecureContext:", window.isSecureContext);

  if (!navigator.clipboard) {
    return { 
      sucesso: false, 
      erro: `Sem API Clipboard. Protocolo atual: ${window.location.protocol}. (Abra via localhost ou https)` 
    };
  }

  if (typeof window.ClipboardItem === 'undefined') {
    return { 
      sucesso: false, 
      erro: 'window.ClipboardItem não existe neste navegador.' 
    };
  }

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao transferir imagem`);
    }
    const blobOriginal = await resposta.blob();

    const bitmap = await createImageBitmap(blobOriginal);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(bitmap, 0, 0, 512, 512);

    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Falha ao gerar PNG no canvas'));
      }, 'image/png');
    });

    const item = new ClipboardItem({
      'image/png': pngBlob
    });

    await navigator.clipboard.write([item]);

    return { sucesso: true };
  } catch (err) {
    console.error('Falha Clipboard API:', err);
    return { sucesso: false, erro: err.message || 'Erro ao copiar a figurinha.' };
  }
}