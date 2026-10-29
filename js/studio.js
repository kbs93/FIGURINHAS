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
  textoAtivoId: 1,
  arrastandoIndex: null,
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
  const btnFechar = document.getElementById('studioCloseBtn');

  if (!canvas || !modal) return;

  if (btnAbrir) {
    btnAbrir.addEventListener('click', () => {
      modal.classList.add('active');
      desenharNoCanvas();
    });
  }

  function fecharModal() {
    modal.classList.remove('active');
    fecharGavetas();
  }

  if (btnFechar) btnFechar.addEventListener('click', fecharModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal();
  });

  const inputCaption = document.getElementById('stickerCaptionInput');
  const fileInput = document.getElementById('imageUploadInput');
  const dropArea = document.getElementById('dropArea');
  const btnDelete = document.getElementById('btnDeleteImage');
  const btnSend = document.getElementById('btnStudioSend');
  const btnDownload = document.getElementById('btnStudioDownload');
  const mainDock = document.getElementById('studioMainDock');

  const btnOpenText = document.getElementById('btnOpenTextSheet');
  const btnOpenBg = document.getElementById('btnOpenBgSheet');
  const sheetText = document.getElementById('sheetText');
  const sheetBg = document.getElementById('sheetBg');
  const btnCloseText = document.getElementById('btnCloseTextSheet');
  const btnCloseBg = document.getElementById('btnCloseBgSheet');
  const btnApplyBg = document.getElementById('btnApplyBgSheet');
  const verticalSliderWrap = document.getElementById('verticalSliderWrap');
  const verticalFontSizeSlider = document.getElementById('verticalFontSizeSlider');

  const btnAddMoreText = document.getElementById('btnAddMoreText');
  const btnDeleteSelectedText = document.getElementById('btnDeleteSelectedText');

function fecharGavetas() {
    if (sheetText) sheetText.classList.add('hidden');
    if (sheetBg) sheetBg.classList.add('hidden');
    if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');
    if (mainDock) mainDock.style.display = 'flex';
    studioState.textoAtivoId = null; // Tira a borda ao fechar a gaveta
    desenharNoCanvas();
  }

  function sincronizarCamposComTextoAtivo() {
    const t = getTextoAtivo();
    if (!t) return;
    if (inputCaption) inputCaption.value = t.legenda;
    if (verticalFontSizeSlider) verticalFontSizeSlider.value = t.tamanho;
  }

  if (btnOpenText) {
    btnOpenText.addEventListener('click', () => {
      if (sheetBg) sheetBg.classList.add('hidden');
      if (sheetText) sheetText.classList.remove('hidden');
      if (verticalSliderWrap) verticalSliderWrap.classList.remove('hidden');
      if (mainDock) mainDock.style.display = 'none';
      sincronizarCamposComTextoAtivo();
      if (inputCaption) inputCaption.focus();
    });
  }

  if (btnCloseText) btnCloseText.addEventListener('click', fecharGavetas);

  if (btnOpenBg) {
    btnOpenBg.addEventListener('click', () => {
      if (sheetText) sheetText.classList.add('hidden');
      if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');
      if (sheetBg) sheetBg.classList.remove('hidden');
      if (mainDock) mainDock.style.display = 'none';
    });
  }

  if (btnCloseBg) btnCloseBg.addEventListener('click', fecharGavetas);
  if (btnApplyBg) btnApplyBg.addEventListener('click', fecharGavetas);

if (btnAddMoreText) {
    btnAddMoreText.addEventListener('click', () => {
      // Trava de segurança: máximo 10 camadas de texto
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
    let clicouEmTexto = false;

    // Percorre os textos para verificar se o clique foi em algum deles
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
        studioState.arrastandoIndex = i;
        studioState.dragOffsetX = coords.x - t.x;
        studioState.dragOffsetY = coords.y - t.y;
        clicouEmTexto = true;

        sincronizarCamposComTextoAtivo();
        desenharNoCanvas();
        return;
      }
    }

    // Se clicou fora de todos os textos, remove a seleção e a borda roxa
    if (!clicouEmTexto) {
      studioState.textoAtivoId = null;
      studioState.arrastandoIndex = null;
      desenharNoCanvas();
    }
  }

  function moveDrag(e) {
    if (studioState.arrastandoIndex === null) return;
    const coords = getCanvasCoords(e);
    const t = studioState.textos[studioState.arrastandoIndex];
    if (t) {
      t.x = coords.x - studioState.dragOffsetX;
      t.y = coords.y - studioState.dragOffsetY;
      desenharNoCanvas();
    }
  }

  function stopDrag() {
    studioState.arrastandoIndex = null;
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

  if (studioState.corFundo && studioState.corFundo !== 'transparent') {
    ctx.fillStyle = studioState.corFundo;
    ctx.fillRect(0, 0, W, H);
  }

  if (img) {
    const scale = Math.min(W / img.width, H / img.height);
    const nw = img.width * scale;
    const nh = img.height * scale;
    const nx = (W - nw) / 2;
    const ny = (H - nh) / 2;
    ctx.drawImage(img, nx, ny, nw, nh);
  }

  studioState.textos.forEach(t => {
    if (!t.legenda) return;

    ctx.font = `900 ${t.tamanho}px "${t.fonte}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
// Borda sólida com alças nos cantos e laterais (Estilo Imagem 2)
    if (t.id === studioState.textoAtivoId) {
      const largura = ctx.measureText(t.legenda).width;
      const padX = 14;
      const padY = 8;
      const bx = t.x - largura / 2 - padX;
      const by = t.y - t.tamanho / 2 - padY;
      const bw = largura + padX * 2;
      const bh = t.tamanho + padY * 2;

      ctx.save();
      
      // 1. Linha contínua roxa
      ctx.setLineDash([]);
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Função auxiliar para desenhar os círculos brancos dos cantos
      function desenharAlcaCirculo(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Função auxiliar para as alças retangulares do meio das laterais
      function desenharAlcaPilar(x, y) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y - 6, 4, 12);
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 6, 4, 12);
      }

    
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

  const idOriginal = studioState.textoAtivoId;
  studioState.textoAtivoId = null;
  desenharNoCanvas();

  canvas.toBlob(async (blob) => {
    studioState.textoAtivoId = idOriginal;
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