/**
 * Realiza o compartilhamento oficial WebP para o WhatsApp ou download local
 */
export async function compartilharSticker(url, fallback, filename) {
  try {
    let blob;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      blob = await resp.blob();
    } catch {
      // Se não achar o arquivo local, usa o fallback SVG
      const respFallback = await fetch(fallback);
      blob = await respFallback.blob();
    }

    const arquivo = new File([blob], filename, { type: 'image/webp' });

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({
        files: [arquivo],
        title: 'Figurinha WhatsApp'
      });
      return { status: 'sucesso', modo: 'share' };
    } else {
      // Download direto no PC ou navegadores sem Web Share
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return { status: 'sucesso', modo: 'download' };
    }
  } catch (err) {
    if (err.name === 'AbortError') return { status: 'cancelado' };
    console.error('Erro ao compartilhar:', err);
    return { status: 'erro' };
  }
}