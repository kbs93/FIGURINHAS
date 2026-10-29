import { compartilharSticker } from './share.js';
import { CustomColorPicker } from './cor.js';

export const studioState = {
  imagemAtual: null,
  modo: 'original',
  corFundo: 'transparent',
  legenda: '',
  fonte: 'Impact',
  tamanho: 44,
  corTexto: '#ffffff',
  corContorno: '#000000',
  semContorno: false,
  textX: 256,
  textY: 450,
  isDragging: false,
  filename: 'minha-figurinha.webp'
};

/**
 * Inicializa os ouvintes e lógica de interface do Estúdio
 */
export function inicializarStudio() {
  const canvas = document.getElementById('studioCanvas');
  const modal = document.getElementById('modalStudio');
  const btnAbrir = document.getElementById('btnCreateSticker');
  const btnFechar = document.getElementById('studioCloseBtn');

  if (!canvas || !modal) return;

  // Abertura e fechamento do modal
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

  // Elementos do estúdio
  const inputCaption = document.getElementById('stickerCaptionInput');
  const btnOriginal = document.getElementById('btnModeOriginal');
  const btnSquare = document.getElementById('btnModeSquare');
  const fileInput = document.getElementById('imageUploadInput');
  const dropArea = document.getElementById('dropArea');
  const btnDelete = document.getElementById('btnDeleteImage');
  const btnSend = document.getElementById('btnStudioSend');
  const btnDownload = document.getElementById('btnStudioDownload');

  // Gavetas inferiores (Bottom Sheets)
  const btnOpenText = document.getElementById('btnOpenTextSheet');
  const btnOpenBg = document.getElementById('btnOpenBgSheet');
  const sheetText = document.getElementById('sheetText');
  const sheetBg = document.getElementById('sheetBg');
  const btnCloseText = document.getElementById('btnCloseTextSheet');
  const btnCloseBg = document.getElementById('btnCloseBgSheet');
  const btnApplyBg = document.getElementById('btnApplyBgSheet');
  const verticalSliderWrap = document.getElementById('verticalSliderWrap');
  const verticalFontSizeSlider = document.getElementById('verticalFontSizeSlider');

  function fecharGavetas() {
    if (sheetText) sheetText.classList.add('hidden');
    if (sheetBg) sheetBg.classList.add('hidden');
    if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');
  }

  // Alternar gaveta de TEXTO
  if (btnOpenText) {
    btnOpenText.addEventListener('click', () => {
      if (sheetBg) sheetBg.classList.add('hidden');
      if (sheetText) sheetText.classList.remove('hidden');
      if (verticalSliderWrap) verticalSliderWrap.classList.remove('hidden');
      if (inputCaption) inputCaption.focus();
    });
  }

  if (btnCloseText) {
    btnCloseText.addEventListener('click', () => {
      if (sheetText) sheetText.classList.add('hidden');
      if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');
    });
  }

  // Alternar gaveta de FUNDO
  if (btnOpenBg) {
    btnOpenBg.addEventListener('click', () => {
      if (sheetText) sheetText.classList.add('hidden');
      if (verticalSliderWrap) verticalSliderWrap.classList.add('hidden');
      if (sheetBg) sheetBg.classList.remove('hidden');
    });
  }

  if (btnCloseBg) btnCloseBg.addEventListener('click', fecharGavetas);
  if (btnApplyBg) btnApplyBg.addEventListener('click', fecharGavetas);

  // Sub-abas da gaveta de texto (Teclado, Aa, Cores)
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

  // Slider vertical de tamanho
  if (verticalFontSizeSlider) {
    verticalFontSizeSlider.addEventListener('input', (e) => {
      studioState.tamanho = parseInt(e.target.value, 10) || 44;
      desenharNoCanvas();
    });
  }

  // Seletor de fontes (Aa)
  document.querySelectorAll('.font-card-item').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.font-card-item').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      studioState.fonte = card.getAttribute('data-font') || 'Impact';
      desenharNoCanvas();
    });
  });

// --- CONTROLE DE ALVO: TEXTO OU CONTORNO ---
  let alvoCorAtual = 'texto'; // 'texto' ou 'contorno'

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
      studioState.semContorno = !studioState.semContorno;
      btnToggleOutline.classList.toggle('active', studioState.semContorno);
      desenharNoCanvas();
    });
  }

  // --- CARROSSEL DE CORES (ALTERA TEXTO OU CONTORNO CONFORME A ABA ATIVA) ---
  document.querySelectorAll('.color-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-circle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const corSelecionada = btn.getAttribute('data-color') || '#ffffff';

      if (alvoCorAtual === 'texto') {
        studioState.corTexto = corSelecionada;
      } else {
        studioState.corContorno = corSelecionada;
        studioState.semContorno = false;
        if (btnToggleOutline) btnToggleOutline.classList.remove('active');
      }

      desenharNoCanvas();
    });
  });

  // Carrossel de cores de fundo
  document.querySelectorAll('.bg-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bg-circle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studioState.corFundo = btn.getAttribute('data-bg') || 'transparent';
      desenharNoCanvas();
    });
  });

  // Input de legenda
  if (inputCaption) {
    inputCaption.addEventListener('input', (e) => {
      studioState.legenda = e.target.value;
      desenharNoCanvas();
    });
  }

  // Posição rápida (Topo, Centro, Base)
  document.querySelectorAll('.text-pos-group .btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.text-pos-group .btn-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pos = btn.getAttribute('data-pos');
      studioState.textX = 256;
      if (pos === 'top') studioState.textY = studioState.tamanho + 30;
      if (pos === 'center') studioState.textY = 256;
      if (pos === 'bottom') studioState.textY = 512 - studioState.tamanho - 20;

      desenharNoCanvas();
    });
  });

  // Arrastar texto no canvas
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
    if (!studioState.legenda.trim()) return;
    studioState.isDragging = true;
    const coords = getCanvasCoords(e);
    studioState.textX = coords.x;
    studioState.textY = coords.y;
    desenharNoCanvas();
  }

  function moveDrag(e) {
    if (!studioState.isDragging) return;
    const coords = getCanvasCoords(e);
    studioState.textX = coords.x;
    studioState.textY = coords.y;
    desenharNoCanvas();
  }

  function stopDrag() {
    studioState.isDragging = false;
  }

  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);

  canvas.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: true });
  window.addEventListener('touchend', stopDrag);

  // Remover foto ativa
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

  // Modos de enquadramento
  if (btnOriginal && btnSquare) {
    btnOriginal.addEventListener('click', () => {
      btnOriginal.classList.add('active');
      btnSquare.classList.remove('active');
      studioState.modo = 'original';
      desenharNoCanvas();
    });

    btnSquare.addEventListener('click', () => {
      btnSquare.classList.add('active');
      btnOriginal.classList.remove('active');
      studioState.modo = 'square';
      desenharNoCanvas();
    });
  }

  // Upload de arquivo
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) processarArquivoLocal(file);
    });
  }

  // Drag & Drop
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

  // Botões de exportação
  if (btnSend) {
    btnSend.addEventListener('click', () => exportarECompartilhar('whatsapp'));
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => exportarECompartilhar('download'));
  }


// Habilita rolagem arrastável nas duas barras de cores
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

  // 1. Fundo colorido
  if (studioState.corFundo && studioState.corFundo !== 'transparent') {
    ctx.fillStyle = studioState.corFundo;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Imagem base
  if (img) {
    if (studioState.modo === 'square') {
      const minDim = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
      const sx = ((img.naturalWidth || img.width) - minDim) / 2;
      const sy = ((img.naturalHeight || img.height) - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, W, H);
    } else {
      const scale = Math.min(W / img.width, H / img.height);
      const nw = img.width * scale;
      const nh = img.height * scale;
      const nx = (W - nw) / 2;
      const ny = (H - nh) / 2;
      ctx.drawImage(img, nx, ny, nw, nh);
    }
  }

  // 3. Legenda com contorno
  if (studioState.legenda.trim()) {
    const texto = studioState.legenda;
    const tamanho = studioState.tamanho;
    const fonte = studioState.fonte;

    ctx.font = `900 ${tamanho}px "${fonte}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const posX = studioState.textX;
    const posY = studioState.textY;

    if (!studioState.semContorno) {
      ctx.strokeStyle = studioState.corContorno;
      ctx.lineWidth = Math.max(4, Math.round(tamanho / 6));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(texto, posX, posY);
    }

    ctx.fillStyle = studioState.corTexto;
    ctx.fillText(texto, posX, posY);
  }
}

function exportarECompartilhar(tipoAcao) {
  const canvas = document.getElementById('studioCanvas');
  if (!canvas || !studioState.imagemAtual) {
    mostrarToast('Envie ou carregue uma imagem primeiro!');
    return;
  }

  canvas.toBlob(async (blob) => {
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

function mostrarToast(texto) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

/**
 * Habilita arraste com mouse para simular a rolagem de toque no desktop
 */
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
    const walk = (x - startX) * 1.5; // Multiplicador de velocidade
    elemento.scrollLeft = scrollLeft - walk;
  });
}