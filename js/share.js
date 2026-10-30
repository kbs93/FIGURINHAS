/**
 * Cria o bloco de metadados EXIF necessário para o WhatsApp reconhecer o WebP como sticker
 */
function adicionarMetadadosExifSticker(webpBuffer, packName = 'BOX Figuras', packPublisher = 'kbsweb') {
  const jsonMetadata = {
    'sticker-pack-id': 'com.boxfiguras.stickers',
    'sticker-pack-name': packName,
    'sticker-pack-publisher': packPublisher,
    'emojis': ['❤️', '😄']
  };

  const jsonStr = JSON.stringify(jsonMetadata);
  const jsonBytes = new TextEncoder().encode(jsonStr);

  // Cabeçalho EXIF padrão TIFF Little-Endian (II)
  const exifHeader = new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, // TIFF Header (Little Endian)
    0x01, 0x00, // 1 entrada de tag
    0x41, 0x53, // Tag 0x5341 (WhatsApp Sticker Metadata)
    0x07, 0x00, // Tipo: UNDEFINED
    jsonBytes.length & 0xFF, (jsonBytes.length >> 8) & 0xFF, (jsonBytes.length >> 16) & 0xFF, (jsonBytes.length >> 24) & 0xFF, // Tamanho dos dados
    0x1A, 0x00, 0x00, 0x00, // Offset onde começam os dados
    0x00, 0x00, 0x00, 0x00 // Fim do IFD
  ]);

  const exifPayload = new Uint8Array(exifHeader.length + jsonBytes.length);
  exifPayload.set(exifHeader, 0);
  exifPayload.set(jsonBytes, exifHeader.length);

  // Chunk RIFF 'EXIF'
  let exifChunkSize = exifPayload.length;
  const padByte = (exifChunkSize % 2 !== 0) ? 1 : 0;
  
  const chunkHeader = new Uint8Array(8);
  chunkHeader.set([0x45, 0x58, 0x49, 0x46], 0); // FourCC: "EXIF"
  chunkHeader[4] = exifChunkSize & 0xFF;
  chunkHeader[5] = (exifChunkSize >> 8) & 0xFF;
  chunkHeader[6] = (exifChunkSize >> 16) & 0xFF;
  chunkHeader[7] = (exifChunkSize >> 24) & 0xFF;

  const originalBytes = new Uint8Array(webpBuffer);

  // Monta o novo ficheiro RIFF WebP contendo o chunk EXIF
  const novoTamanhoTotal = originalBytes.length + 8 + exifChunkSize + padByte - 8;
  const novoWebp = new Uint8Array(originalBytes.length + 8 + exifChunkSize + padByte);

  // Copia o cabeçalho original e injeta o tamanho atualizado
  novoWebp.set(originalBytes.subarray(0, 4), 0); // "RIFF"
  novoWebp[4] = novoTamanhoTotal & 0xFF;
  novoWebp[5] = (novoTamanhoTotal >> 8) & 0xFF;
  novoWebp[6] = (novoTamanhoTotal >> 16) & 0xFF;
  novoWebp[7] = (novoTamanhoTotal >> 24) & 0xFF;
  novoWebp.set(originalBytes.subarray(8), 8);

  // Anexa o chunk EXIF no final
  const fimOriginal = originalBytes.length;
  novoWebp.set(chunkHeader, fimOriginal);
  novoWebp.set(exifPayload, fimOriginal + 8);

  return novoWebp.buffer;
}

/**
 * Realiza o compartilhamento oficial WebP para o WhatsApp ou download local
 */
export async function compartilharSticker(url, fallback, filename) {
  try {
    let arrayBuffer;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      arrayBuffer = await resp.arrayBuffer();
    } catch {
      const respFallback = await fetch(fallback);
      arrayBuffer = await respFallback.arrayBuffer();
    }

    // Injeta os metadados para o WhatsApp reconhecer como Sticker nativo
    const webpComExif = adicionarMetadadosExifSticker(arrayBuffer);
    const blob = new Blob([webpComExif], { type: 'image/webp' });
    const arquivo = new File([blob], filename, { type: 'image/webp' });

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({
        files: [arquivo],
        title: 'Figurinha WhatsApp'
      });
      return { status: 'sucesso', modo: 'share' };
    } else {
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