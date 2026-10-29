import { categoriasMap, gerarFallback } from './data.js';
import { compartilharSticker } from './share.js';
import { inicializarStudio } from './studio.js';
import { CustomColorPicker } from './cor.js';

// Função para calcular luminosidade e ajustar o texto claro/escuro automaticamente
function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 150) ? '#1a202c' : '#e9edef';
}

function applySiteTheme(hex) {
  const textColor = getContrastColor(hex);
  const isLight = textColor === '#1a202c';

  document.documentElement.style.setProperty('--bg-dark', hex);
  document.documentElement.style.setProperty('--bg-sidebar', hex);
  document.documentElement.style.setProperty('--bg-header', isLight ? '#eae6df' : '#0f1c24');
  document.documentElement.style.setProperty('--bg-pill', isLight ? '#dfdad0' : '#1a2a34');
  document.documentElement.style.setProperty('--bg-chip', isLight ? '#d8d2c6' : '#101d24');
  document.documentElement.style.setProperty('--border-subtle', isLight ? '#cac3b5' : '#1e2c35');
  document.documentElement.style.setProperty('--text-main', textColor);
  document.documentElement.style.setProperty('--text-dim', isLight ? '#4a5568' : '#8696a0');

  localStorage.setItem('zapstickers_custom_theme', hex);
}

// Inicializa o seletor do projeto
const savedTheme = localStorage.getItem('zapstickers_custom_theme') || '#0b141a';

new CustomColorPicker({
  triggerId: 'themeColorTrigger',
  previewId: 'themeColorPreview',
  labelId: 'themeColorLabel',
  initialColor: savedTheme,
  onChange: (hex) => {
    applySiteTheme(hex);
  }
});

// Aplica a cor salva logo ao carregar a página
if (savedTheme !== '#0b141a') {
  applySiteTheme(savedTheme);
}

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
  const statusCount = document.getElementById('catalogStatusCount');
  if (!grid) return;

  const totalGeral = (categoriasMap['todos'] || []).length;
  const lista = categoriasMap[state.categoria] || [];

  const filtrados = lista.filter(nome => {
    if (!state.busca) return true;
    return nome.toLowerCase().includes(state.busca);
  });

if (filtrados.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    if (statusCount) {
      statusCount.innerHTML = `Nenhuma figurinha encontrada para esta pesquisa`;
    }
    return;
  }

  empty.classList.add('hidden');

  if (statusCount) {
    statusCount.innerHTML = `Mostrando <strong>${filtrados.length}</strong> de <strong>${totalGeral}</strong> figurinhas`;
  }

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
/**
 * Controla o estado (aceso/apagado) do botão Limpar
 */
function atualizarBotaoLimpar() {
  const btnClear = document.getElementById('btnClearAllFilters');
  if (!btnClear) return;

  const temFiltroAtivo = state.categoria !== 'todos' || Boolean(state.busca);

  if (temFiltroAtivo) {
    btnClear.removeAttribute('disabled');
    btnClear.classList.add('active');
  } else {
    btnClear.setAttribute('disabled', 'true');
    btnClear.classList.remove('active');
  }
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
    atualizarBotaoLimpar();
  });
}

/**
 * 5. Busca em tempo real com Botões Buscar e Limpar
 */
function iniciarBusca() {
  const input = document.getElementById('searchInput');
  const btnSubmit = document.getElementById('btnSubmitSearch');
  const btnClear = document.getElementById('btnClearAllFilters');
  const btnReset = document.getElementById('btnResetSearch');

  if (!input) return;

  function filtrar(val) {
    state.busca = val.trim().toLowerCase();
    renderizarGrade();
    atualizarBotaoLimpar();
  }

  input.addEventListener('input', (e) => filtrar(e.target.value));

  // Tecla Enter dispara busca
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      filtrar(input.value);
    }
  });

  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => filtrar(input.value));
  }

  function resetarTudo() {
    input.value = '';
    state.busca = '';
    state.categoria = 'todos';

    document.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.category === 'todos');
    });

    const todosChip = document.querySelector('.chip[data-category="todos"]');
    if (todosChip) {
      todosChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    renderizarGrade();
    atualizarBotaoLimpar();
  }

  if (btnClear) {
    btnClear.addEventListener('click', resetarTudo);
  }

  if (btnReset) {
    btnReset.addEventListener('click', resetarTudo);
  }
}

/**
 * 6. Menu Gaveta Mobile (Utiliza o painel lateral único)
 */
/**
 * 6. Menu Gaveta Mobile (Utiliza o painel lateral único e trava fundo)
 */
function iniciarMenu() {
  const btn = document.getElementById('menuToggle');
  const panel = document.getElementById('splitLeftPanel');
  const overlay = document.getElementById('navOverlay');
  const close = document.getElementById('sidebarCloseBtn');

  if (!btn || !panel) return;

  function fechar() {
    panel.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.classList.remove('menu-open');
  }

  function abrir() {
    panel.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    document.body.classList.add('menu-open');
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