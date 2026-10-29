import { categoriasMap, gerarFallback } from './data.js';
import { compartilharSticker } from './share.js';
import { inicializarStudio } from './studio.js';

const state = {
  categoria: 'todos',
  busca: '',
  stickerSelecionado: null
};

document.addEventListener('DOMContentLoaded', () => {
  renderizarGrade();
  iniciarFiltros();
  iniciarBusca();
  iniciarCliquesGrade();
  iniciarModalPreview();
  iniciarMenu();
  iniciarModais();
  inicializarStudio();
});

/**
 * 1. Renderiza a grade de figurinhas
 */
function renderizarGrade() {
  const grid = document.getElementById('stickersGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  const lista = categoriasMap[state.categoria] || [];

  const filtrados = lista.filter(nome => {
    if (!state.busca) return true;
    return nome.toLowerCase().includes(state.busca);
  });

  if (filtrados.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = filtrados.map(nome => {
    const filename = `${nome}.webp`;
    const fallback = gerarFallback(nome);
    return `
      <div class="sticker-cell" 
           data-url="figurinhas/${filename}" 
           data-fallback="${fallback}" 
           data-filename="${filename}" 
           title="Clique para enviar ${filename}">
        <div class="sticker-preview">
          <img 
            src="figurinhas/${filename}" 
            alt="${filename}" 
            width="88" 
            height="88" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='${fallback}';">
        </div>
        <span class="sticker-filename">${filename}</span>
      </div>
    `;
  }).join('');
}

/**
 * 2. Filtro por Chips de Categoria
 */
function iniciarFiltros() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    chip.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });

    state.categoria = chip.getAttribute('data-category');
    renderizarGrade();
  });
}

/**
 * 3. Clique na grade: abre o modal de envio no WhatsApp
 */
function iniciarCliquesGrade() {
  const grid = document.getElementById('stickersGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const celula = e.target.closest('.sticker-cell');
    if (!celula) return;

    document.querySelectorAll('.sticker-cell').forEach(c => c.classList.remove('selected'));
    celula.classList.add('selected');

    const url = celula.getAttribute('data-url');
    const fallback = celula.getAttribute('data-fallback');
    const filename = celula.getAttribute('data-filename');

    abrirModalPreview(url, fallback, filename);
  });
}

/**
 * 4. Modal de Prévia e Envio Original (Grade)
 */
function abrirModalPreview(url, fallback, filename) {
  state.stickerSelecionado = { url, fallback, filename };

  const modal = document.getElementById('modalPreview');
  const previewImg = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const previewTitle = document.getElementById('previewTitle');

  if (!modal || !previewImg) return;

  previewImg.onerror = null;
  previewImg.src = '';

  previewTitle.textContent = 'Prévia da Figurinha';
  previewFilename.textContent = filename;

  previewImg.onerror = () => {
    previewImg.onerror = null;
    previewImg.src = fallback;
  };

  previewImg.src = url;
  modal.classList.add('active');
}

function iniciarModalPreview() {
  const modal = document.getElementById('modalPreview');
  const btnClose = document.getElementById('previewCloseBtn');
  const btnSend = document.getElementById('btnZapSend');

  if (!modal) return;

  function fechar() {
    modal.classList.remove('active');
    state.stickerSelecionado = null;
    
    const previewImg = document.getElementById('previewImage');
    if (previewImg) {
      previewImg.onerror = null;
      previewImg.src = '';
    }
  }

  if (btnClose) btnClose.addEventListener('click', fechar);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) fechar();
  });

  if (btnSend) {
    btnSend.addEventListener('click', async () => {
      if (!state.stickerSelecionado) return;

      const { url, fallback, filename } = state.stickerSelecionado;
      mostrarToast('Abrindo envio no WhatsApp...');
      
      const res = await compartilharSticker(url, fallback, filename);
      if (res && res.modo === 'download') {
        mostrarToast(`Arquivo ${filename} baixado!`);
      }

      fechar();
    });
  }
}

/**
 * 5. Busca em tempo real
 */
function iniciarBusca() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('clearSearch');
  const btnReset = document.getElementById('btnResetSearch');

  if (!input) return;

  function filtrar(val) {
    state.busca = val.trim().toLowerCase();
    if (clear) clear.style.display = val ? 'block' : 'none';
    renderizarGrade();
  }

  input.addEventListener('input', (e) => filtrar(e.target.value));

  if (clear) {
    clear.addEventListener('click', () => {
      input.value = '';
      filtrar('');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      input.value = '';
      state.categoria = 'todos';
      document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.category === 'todos'));
      filtrar('');
    });
  }
}

/**
 * 6. Menu Gaveta Mobile
 */
function iniciarMenu() {
  const btn = document.getElementById('menuToggle');
  const drawer = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  const close = document.getElementById('navCloseBtn');

  if (!btn || !drawer) return;

  function fechar() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
  }

  function abrir() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
  }

  btn.addEventListener('click', abrir);
  if (close) close.addEventListener('click', fechar);
  if (overlay) overlay.addEventListener('click', fechar);
}

/**
 * 7. Modais Institucionais
 */
function iniciarModais() {
  document.querySelectorAll('.modal-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById(btn.getAttribute('data-modal'));
      if (modal) modal.classList.add('active');
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    if (modal.id === 'modalPreview' || modal.id === 'modalStudio') return;
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') || e.target.closest('.modal-close')) {
        modal.classList.remove('active');
      }
    });
  });
}

function mostrarToast(texto) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}