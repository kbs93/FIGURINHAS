import { compartilharSticker } from './share.js';

export const studioState = {
  imagemAtual: null,
  corFundo: 'transparent',
  filename: 'minha-figurinha.webp',
  textos: [
    {
      id: 1,
      legenda: 'Digite algo',
      x: 256,
      y: 256,
      tamanho: 44,
      fonte: 'Impact',
      corTexto: '#ffffff',
      corContorno: '#000000',
      semContorno: false
    }
  ],
  adesivos: [],
  textoAtivoId: 1,
  adesivoAtivoId: null,
  arrastandoAlvo: null, // { tipo: 'texto' | 'adesivo', index: number }
  dragOffsetX: 0,
  dragOffsetY: 0
};

function getTextoAtivo() {
  return studioState.textos.find(t => t.id === studioState.textoAtivoId) || studioState.textos[0];
}

export function inicializarStudio() {
  const canvas = document.getElementById('studioCanvas');
  const modal = document.getElementById('modalStudio');
  const btnAbrir = document.getElementById('btnCreateSticker');

  if (!canvas || !modal) return;

  if (btnAbrir) {
    btnAbrir.addEventListener('click', () => {
      modal.classList.add('active');
      desenharNoCanvas();
    });
  }

  const btnFechar = document.getElementById('studioCloseBtn');
  const btnVoltar = document.getElementById('studioBackBtn');

  function fecharModalCompleto() {
    modal.classList.remove('active');
    fecharGavetas();
    studioState.textoAtivoId = null;
    studioState.adesivoAtivoId = null;
    desenharNoCanvas();
  }

  if (btnFechar) btnFechar.addEventListener('click', fecharModalCompleto);

  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      fecharGavetas();
      studioState.textoAtivoId = null;
      studioState.adesivoAtivoId = null;
      desenharNoCanvas();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModalCompleto();
  });

  const inputCaption = document.getElementById('stickerCaptionInput');
  const fileInput = document.getElementById('imageUploadInput');
  const dropArea = document.getElementById('dropArea');
  const btnDelete = document.getElementById('btnDeleteImage');
  const btnSend = document.getElementById('btnStudioSend');
  const btnDownload = document.getElementById('btnStudioDownload');

  const btnOpenText = document.getElementById('btnOpenTextSheet');
  const btnOpenBg = document.getElementById('btnOpenBgSheet');
  const btnOpenStickers = document.getElementById('btnOpenStickersSheet');

  const sheetText = document.getElementById('sheetText');
  const sheetBg = document.getElementById('sheetBg');
  const sheetStickers = document.getElementById('sheetStickers');

  const btnCloseText = document.getElementById('btnCloseTextSheet');
  const btnCloseBg = document.getElementById('btnCloseBgSheet');
  const btnApplyBg = document.getElementById('btnApplyBgSheet');
  const btnCloseStickers = document.getElementById('btnCloseStickersSheet');
  const btnApplyStickers = document.getElementById('btnApplyStickersSheet');

  const verticalSliderWrap = document.getElementById('verticalSliderWrap');
  const verticalFontSizeSlider = document.getElementById('verticalFontSizeSlider');

  const btnAddMoreText = document.getElementById('btnAddMoreText');
  const btnDeleteSelectedText = document.getElementById('btnDeleteSelectedText');

  // Fecha rigorosamente todas as gavetas e remove seleções ativas do dock
  function fecharGavetas() {
    if (sheetText) sheetText.classList.add('hidden');
    if (sheetBg) sheetBg.classList.add('hidden');
    if (sheetStickers) sheetStickers.classList.add('hidden');
    if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');

    if (btnOpenText) btnOpenText.classList.remove('active');
    if (btnOpenBg) btnOpenBg.classList.remove('active');
    if (btnOpenStickers) btnOpenStickers.classList.remove('active');

    studioState.textoAtivoId = null;
    studioState.adesivoAtivoId = null;
    desenharNoCanvas();
  }

  function sincronizarCamposComTextoAtivo() {
    const t = getTextoAtivo();
    if (!t) return;
    if (inputCaption) inputCaption.value = t.legenda;
    if (verticalFontSizeSlider) verticalFontSizeSlider.value = t.tamanho;
  }

  // Clicou no botão TEXTO
  if (btnOpenText) {
    btnOpenText.addEventListener('click', () => {
      const estaAberto = !sheetText.classList.contains('hidden');

      if (estaAberto) {
        fecharGavetas();
      } else {
        if (sheetBg) sheetBg.classList.add('hidden');
        if (btnOpenBg) btnOpenBg.classList.remove('active');
        if (sheetStickers) sheetStickers.classList.add('hidden');
        if (btnOpenStickers) btnOpenStickers.classList.remove('active');

        sheetText.classList.remove('hidden');
        btnOpenText.classList.add('active');
        if (verticalSliderWrap) verticalSliderWrap.classList.remove('hidden');

        sincronizarCamposComTextoAtivo();
        if (inputCaption) inputCaption.focus();
      }
    });
  }

  if (btnCloseText) btnCloseText.addEventListener('click', fecharGavetas);

  // Clicou no botão FUNDO / COR POR CIMA
  if (btnOpenBg) {
    btnOpenBg.addEventListener('click', () => {
      const estaAberto = !sheetBg.classList.contains('hidden');

      if (estaAberto) {
        fecharGavetas();
      } else {
        if (sheetText) sheetText.classList.add('hidden');
        if (btnOpenText) btnOpenText.classList.remove('active');
        if (sheetStickers) sheetStickers.classList.add('hidden');
        if (btnOpenStickers) btnOpenStickers.classList.remove('active');
        if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');

        sheetBg.classList.remove('hidden');
        btnOpenBg.classList.add('active');
      }
    });
  }

  if (btnCloseBg) btnCloseBg.addEventListener('click', fecharGavetas);
  if (btnApplyBg) btnApplyBg.addEventListener('click', fecharGavetas);

  // Clicou no botão ADESIVOS
  if (btnOpenStickers) {
    btnOpenStickers.addEventListener('click', () => {
      const estaAberto = !sheetStickers.classList.contains('hidden');

      if (estaAberto) {
        fecharGavetas();
      } else {
        if (sheetText) sheetText.classList.add('hidden');
        if (btnOpenText) btnOpenText.classList.remove('active');
        if (sheetBg) sheetBg.classList.add('hidden');
        if (btnOpenBg) btnOpenBg.classList.remove('active');
        if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');

        sheetStickers.classList.remove('hidden');
        btnOpenStickers.classList.add('active');
      }
    });
  }

  if (btnCloseStickers) btnCloseStickers.addEventListener('click', fecharGavetas);
  if (btnApplyStickers) btnApplyStickers.addEventListener('click', fecharGavetas);

  // Adicionar Adesivo ao clicar no emoji
  document.querySelectorAll('.sticker-emoji-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (studioState.adesivos.length >= 15) {
        mostrarToast('Limite de 15 adesivos atingido!');
        return;
      }

      const emoji = btn.getAttribute('data-emoji');
      const novoAdesivo = {
        id: Date.now(),
        emoji: emoji,
        x: 256,
        y: 256,
        tamanho: 64
      };

      studioState.adesivos.push(novoAdesivo);
      studioState.adesivoAtivoId = novoAdesivo.id;
      studioState.textoAtivoId = null;
      desenharNoCanvas();
      mostrarToast(`Adesivo ${emoji} adicionado!`);
    });
  });

  if (btnAddMoreText) {
    btnAddMoreText.addEventListener('click', () => {
      if (studioState.textos.length >= 10) {
        mostrarToast('Limite máximo de 10 textos atingido!');
        return;
      }

      const novoId = Date.now();
      const novoTexto = {
        id: novoId,
        legenda: `Texto ${studioState.textos.length + 1}`,
        x: 256,
        y: Math.min(450, 150 + studioState.textos.length * 30),
        tamanho: 44,
        fonte: 'Impact',
        corTexto: '#ffffff',
        corContorno: '#000000',
        semContorno: false
      };

      studioState.textos.push(novoTexto);
      studioState.textoAtivoId = novoId;
      studioState.adesivoAtivoId = null;

      sincronizarCamposComTextoAtivo();
      desenharNoCanvas();
      if (inputCaption) {
        inputCaption.focus();
        inputCaption.select();
      }
    });
  }

  if (btnDeleteSelectedText) {
    btnDeleteSelectedText.addEventListener('click', () => {
      if (studioState.textos.length <= 1) {
        const t = getTextoAtivo();
        if (t) t.legenda = '';
      } else {
        studioState.textos = studioState.textos.filter(t => t.id !== studioState.textoAtivoId);
        studioState.textoAtivoId = studioState.textos[studioState.textos.length - 1].id;
      }
      sincronizarCamposComTextoAtivo();
      desenharNoCanvas();
    });
  }

  document.querySelectorAll('.sheet-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sheet-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sheet-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(`pane-${tabId}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  if (verticalFontSizeSlider) {
    verticalFontSizeSlider.addEventListener('input', (e) => {
      const t = getTextoAtivo();
      if (t) {
        t.tamanho = parseInt(e.target.value, 10) || 44;
        desenharNoCanvas();
      }
    });
  }

  document.querySelectorAll('.font-card-item').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.font-card-item').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const t = getTextoAtivo();
      if (t) {
        t.fonte = card.getAttribute('data-font') || 'Impact';
        desenharNoCanvas();
      }
    });
  });

  let alvoCorAtual = 'texto';
  const btnTargetText = document.getElementById('btnTargetText');
  const btnTargetStroke = document.getElementById('btnTargetStroke');
  const btnToggleOutline = document.getElementById('btnToggleOutline');

  if (btnTargetText) {
    btnTargetText.addEventListener('click', () => {
      alvoCorAtual = 'texto';
      btnTargetText.classList.add('active');
      if (btnTargetStroke) btnTargetStroke.classList.remove('active');
    });
  }

  if (btnTargetStroke) {
    btnTargetStroke.addEventListener('click', () => {
      alvoCorAtual = 'contorno';
      btnTargetStroke.classList.add('active');
      if (btnTargetText) btnTargetText.classList.remove('active');
    });
  }

  if (btnToggleOutline) {
    btnToggleOutline.addEventListener('click', () => {
      const t = getTextoAtivo();
      if (t) {
        t.semContorno = !t.semContorno;
        btnToggleOutline.classList.toggle('active', t.semContorno);
        desenharNoCanvas();
      }
    });
  }

  document.querySelectorAll('.color-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-circle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const t = getTextoAtivo();
      if (!t) return;

      const cor = btn.getAttribute('data-color') || '#ffffff';
      if (alvoCorAtual === 'texto') {
        t.corTexto = cor;
      } else {
        t.corContorno = cor;
        t.semContorno = false;
        if (btnToggleOutline) btnToggleOutline.classList.remove('active');
      }
      desenharNoCanvas();
    });
  });

  document.querySelectorAll('.bg-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bg-circle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studioState.corFundo = btn.getAttribute('data-bg') || 'transparent';
      desenharNoCanvas();
    });
  });

  if (inputCaption) {
    inputCaption.addEventListener('input', (e) => {
      const t = getTextoAtivo();
      if (t) {
        t.legenda = e.target.value;
        desenharNoCanvas();
      }
    });
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 512,
      y: ((clientY - rect.top) / rect.height) * 512
    };
  }

  function startDrag(e) {
    const coords = getCanvasCoords(e);
    const ctx = canvas.getContext('2d');

    // 1. Verifica clique em Adesivos / Emojis (topo da pilha primeiro)
    for (let i = studioState.adesivos.length - 1; i >= 0; i--) {
      const a = studioState.adesivos[i];
      const r = a.tamanho / 2 + 10;
      if (
        coords.x >= a.x - r &&
        coords.x <= a.x + r &&
        coords.y >= a.y - r &&
        coords.y <= a.y + r
      ) {
        studioState.adesivoAtivoId = a.id;
        studioState.textoAtivoId = null;
        studioState.arrastandoAlvo = { tipo: 'adesivo', index: i };
        studioState.dragOffsetX = coords.x - a.x;
        studioState.dragOffsetY = coords.y - a.y;
        desenharNoCanvas();
        return;
      }
    }

    // 2. Verifica clique em Textos
    for (let i = studioState.textos.length - 1; i >= 0; i--) {
      const t = studioState.textos[i];
      if (!t.legenda) continue;

      ctx.font = `900 ${t.tamanho}px "${t.fonte}", sans-serif`;
      const largura = ctx.measureText(t.legenda).width;
      const altura = t.tamanho;

      if (
        coords.x >= t.x - largura / 2 - 20 &&
        coords.x <= t.x + largura / 2 + 20 &&
        coords.y >= t.y - altura / 2 - 20 &&
        coords.y <= t.y + altura / 2 + 20
      ) {
        studioState.textoAtivoId = t.id;
        studioState.adesivoAtivoId = null;
        studioState.arrastandoAlvo = { tipo: 'texto', index: i };
        studioState.dragOffsetX = coords.x - t.x;
        studioState.dragOffsetY = coords.y - t.y;

        sincronizarCamposComTextoAtivo();
        desenharNoCanvas();
        return;
      }
    }

    // Clique fora: desseleciona
    studioState.textoAtivoId = null;
    studioState.adesivoAtivoId = null;
    studioState.arrastandoAlvo = null;
    desenharNoCanvas();
  }

  function moveDrag(e) {
    if (!studioState.arrastandoAlvo) return;
    const coords = getCanvasCoords(e);
    const { tipo, index } = studioState.arrastandoAlvo;

    if (tipo === 'texto') {
      const t = studioState.textos[index];
      if (t) {
        t.x = coords.x - studioState.dragOffsetX;
        t.y = coords.y - studioState.dragOffsetY;
        desenharNoCanvas();
      }
    } else if (tipo === 'adesivo') {
      const a = studioState.adesivos[index];
      if (a) {
        a.x = coords.x - studioState.dragOffsetX;
        a.y = coords.y - studioState.dragOffsetY;
        desenharNoCanvas();
      }
    }
  }

  function stopDrag() {
    studioState.arrastandoAlvo = null;
  }

  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);

  canvas.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: true });
  window.addEventListener('touchend', stopDrag);

  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      studioState.imagemAtual = null;
      studioState.filename = 'minha-figurinha.webp';

      const placeholder = document.getElementById('canvasPlaceholder');
      const status = document.getElementById('studioStatus');

      canvas.classList.remove('ready');
      if (placeholder) placeholder.classList.remove('hidden');
      if (status) status.textContent = 'Nenhum arquivo ativo';
      btnDelete.classList.add('hidden');

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);
      if (fileInput) fileInput.value = '';
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processarArquivoLocal(file);
    });
  }

  if (dropArea) {
    ['dragenter', 'dragover'].forEach(name => {
      dropArea.addEventListener(name, (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropArea.addEventListener(name, (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
      });
    });

    dropArea.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processarArquivoLocal(file);
      }
    });
  }

  if (btnSend) {
    btnSend.addEventListener('click', () => exportarECompartilhar('whatsapp'));
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => exportarECompartilhar('download'));
  }

  habilitarRolagemArrastavel(document.querySelector('.colors-carousel-bar'));
  habilitarRolagemArrastavel(document.querySelector('.bg-colors-carousel-bar'));
}

function processarArquivoLocal(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    carregarImagemNoStudio(event.target.result, file.name || 'minha-foto.webp');
  };
  reader.readAsDataURL(file);
}

export function carregarImagemNoStudio(src, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    studioState.imagemAtual = img;
    studioState.filename = filename || 'figurinha.webp';

    const canvas = document.getElementById('studioCanvas');
    const placeholder = document.getElementById('canvasPlaceholder');
    const status = document.getElementById('studioStatus');
    const btnDelete = document.getElementById('btnDeleteImage');

    if (canvas) canvas.classList.add('ready');
    if (placeholder) placeholder.classList.add('hidden');
    if (status) status.textContent = filename;
    if (btnDelete) btnDelete.classList.remove('hidden');

    desenharNoCanvas();
  };

  img.onerror = () => {
    mostrarToast('Não foi possível carregar a imagem.');
  };

  img.src = src;
}

export function desenharNoCanvas() {
  const canvas = document.getElementById('studioCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const img = studioState.imagemAtual;
  const W = 512;
  const H = 512;

  ctx.clearRect(0, 0, W, H);

  // 1. Fundo Base Colorido
  if (studioState.corFundo && studioState.corFundo !== 'transparent') {
    ctx.fillStyle = studioState.corFundo;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Imagem Centralizada
  if (img) {
    const larguraImg = img.naturalWidth || img.width;
    const alturaImg = img.naturalHeight || img.height;
    const minDim = Math.min(larguraImg, alturaImg);

    const sx = (larguraImg - minDim) / 2;
    const sy = (alturaImg - minDim) / 2;

    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, W, H);

    // Cor por cima / tonalidade
    if (studioState.corFundo && studioState.corFundo !== 'transparent') {
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = studioState.corFundo;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // 3. Adesivos / Emojis
  studioState.adesivos.forEach(a => {
    ctx.font = `${a.tamanho}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.emoji, a.x, a.y);

    if (a.id === studioState.adesivoAtivoId) {
      ctx.save();
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(a.x - a.tamanho / 2 - 4, a.y - a.tamanho / 2 - 4, a.tamanho + 8, a.tamanho + 8);
      ctx.restore();
    }
  });

  // 4. Textos
  studioState.textos.forEach(t => {
    if (!t.legenda) return;

    ctx.font = `900 ${t.tamanho}px "${t.fonte}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Borda sólida com alças no texto ativo
    if (t.id === studioState.textoAtivoId) {
      const largura = ctx.measureText(t.legenda).width;
      const padX = 14;
      const padY = 8;
      const bx = t.x - largura / 2 - padX;
      const by = t.y - t.tamanho / 2 - padY;
      const bw = largura + padX * 2;
      const bh = t.tamanho + padY * 2;

      ctx.save();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      function desenharAlcaCirculo(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      function desenharAlcaPilar(x, y) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y - 6, 4, 12);
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 6, 4, 12);
      }

      desenharAlcaCirculo(bx, by);
      desenharAlcaCirculo(bx + bw, by);
      desenharAlcaCirculo(bx, by + bh);
      desenharAlcaCirculo(bx + bw, by + bh);
      desenharAlcaPilar(bx, by + bh / 2);
      desenharAlcaPilar(bx + bw, by + bh / 2);
      ctx.restore();
    }

    if (!t.semContorno) {
      ctx.strokeStyle = t.corContorno;
      ctx.lineWidth = Math.max(4, Math.round(t.tamanho / 6));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(t.legenda, t.x, t.y);
    }

    ctx.fillStyle = t.corTexto;
    ctx.fillText(t.legenda, t.x, t.y);
  });
}

function exportarECompartilhar(tipoAcao) {
  const canvas = document.getElementById('studioCanvas');
  if (!canvas || !studioState.imagemAtual) {
    mostrarToast('Envie ou carregue uma imagem primeiro!');
    return;
  }

  const idOriginalTexto = studioState.textoAtivoId;
  const idOriginalAdesivo = studioState.adesivoAtivoId;
  studioState.textoAtivoId = null;
  studioState.adesivoAtivoId = null;
  desenharNoCanvas();

  canvas.toBlob(async (blob) => {
    studioState.textoAtivoId = idOriginalTexto;
    studioState.adesivoAtivoId = idOriginalAdesivo;
    desenharNoCanvas();

    if (!blob) {
      mostrarToast('Erro ao exportar a imagem.');
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    const filename = studioState.filename.replace(/\.[^/.]+$/, "") + ".webp";

    if (tipoAcao === 'download') {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      mostrarToast(`Figurinha ${filename} baixada!`);
      return;
    }

    mostrarToast('Abrindo WhatsApp...');
    const res = await compartilharSticker(blobUrl, blobUrl, filename);
    if (res && res.modo === 'download') {
      mostrarToast('Figurinha baixada!');
    }
  }, 'image/webp', 0.9);
}

function habilitarRolagemArrastavel(elemento) {
  if (!elemento) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  elemento.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - elemento.offsetLeft;
    scrollLeft = elemento.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
  });

  elemento.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - elemento.offsetLeft;
    const walk = (x - startX) * 1.5;
    elemento.scrollLeft = scrollLeft - walk;
  });
}

function mostrarToast(texto) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}