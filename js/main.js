import { categoriasMap, gerarFallback } from './data.js';
import { compartilharSticker } from './share.js';
import { inicializarStudio } from './studio.js';
import { CustomColorPicker } from './cor.js';
import { inicializarApresentacao } from './intro.js';

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
  document.documentElement.style.setProperty('--bg-header', isLight ? '#dfd8d8' : '#0f1c24');
  document.documentElement.style.setProperty('--bg-pill', isLight ? '#0a0a0a' : '#1a2a34');
  document.documentElement.style.setProperty('--bg-chip', isLight ? '#050505' : '#101d24');
  document.documentElement.style.setProperty('--border-subtle', isLight ? '#020202' : '#1e2c35');
  document.documentElement.style.setProperty('--text-main', textColor);
  document.documentElement.style.setProperty('--text-dim', isLight ? '#4a5568' : '#8696a0');

  localStorage.setItem('zapstickers_custom_theme', hex);
}

// Inicializa o seletor do projeto
const savedTheme = localStorage.getItem('zapstickers_custom_theme') || '#0b141a';

// Função para atualizar as bolinhas de prévia de ambos os botões
function atualizarPreviewsTema(hex) {
  const pDesktop = document.getElementById('themeColorPreview');
  const pMobile = document.getElementById('themeColorPreviewMobile');
  if (pDesktop) pDesktop.style.backgroundColor = hex;
  if (pMobile) pMobile.style.backgroundColor = hex;
}

// Seletor Desktop
new CustomColorPicker({
  triggerId: 'themeColorTrigger',
  previewId: 'themeColorPreview',
  labelId: 'themeColorLabel',
  initialColor: savedTheme,
  onChange: (hex) => {
    applySiteTheme(hex);
    atualizarPreviewsTema(hex);
  }
});

// Seletor Mobile (ao lado do menu hambúrguer)
if (document.getElementById('themeColorTriggerMobile')) {
  new CustomColorPicker({
    triggerId: 'themeColorTriggerMobile',
    previewId: 'themeColorPreviewMobile',
    initialColor: savedTheme,
    onChange: (hex) => {
      applySiteTheme(hex);
      atualizarPreviewsTema(hex);
    }
  });
}

// Inicializa a cor das bolinhas ao carregar
atualizarPreviewsTema(savedTheme);

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
  inicializarApresentacao();
  renderizarGrade();
  iniciarFiltros();
  renderizarCategoriasBottomSheet();
  iniciarBusca();
  iniciarCliquesGrade();
  iniciarModalPreview();
  iniciarMenu();
  iniciarModais();
  inicializarStudio();
  iniciarBuscaMobileFlutuante();
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

   const sheetItems = document.querySelectorAll('.sheet-category-item');
    sheetItems.forEach(item => {
      item.classList.toggle('active', item.dataset.category === 'todos');
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


/**
 * Controle do Botão Flutuante e Busca Rápida Mobile
 */
function iniciarBuscaMobileFlutuante() {
  const fabBtn = document.getElementById('fabSearchBtn');
  const overlay = document.getElementById('mobileSearchOverlay');
  const inputMobile = document.getElementById('mobileSearchInput');
  const inputDesktop = document.getElementById('searchInput');
  const btnClose = document.getElementById('btnCloseMobileSearch');
  const btnClearMobile = document.getElementById('mobileClearBtn');

  if (!fabBtn || !overlay || !inputMobile) return;

  function abrirBuscaMobile() {
    overlay.classList.add('active');
    inputMobile.value = state.busca || '';
    setTimeout(() => inputMobile.focus(), 150);
  }

  function fecharBuscaMobile() {
    overlay.classList.remove('active');
    inputMobile.blur();
  }

  function sincronizarBusca(termo) {
    state.busca = termo.trim().toLowerCase();
    if (inputDesktop) inputDesktop.value = termo;
    renderizarGrade();
    if (typeof atualizarBotaoLimpar === 'function') atualizarBotaoLimpar();
  }

  fabBtn.addEventListener('click', abrirBuscaMobile);
  btnClose.addEventListener('click', fecharBuscaMobile);

  inputMobile.addEventListener('input', (e) => {
    sincronizarBusca(e.target.value);
    if (btnClearMobile) {
      btnClearMobile.style.display = e.target.value ? 'block' : 'none';
    }
  });

  if (btnClearMobile) {
    btnClearMobile.addEventListener('click', () => {
      inputMobile.value = '';
      sincronizarBusca('');
      btnClearMobile.style.display = 'none';
      inputMobile.focus();
    });
  }
}

/**
 * Renderiza e sincroniza as categorias com contagem na Bottom Sheet móvel
 */
function renderizarCategoriasBottomSheet() {
  const container = document.getElementById('sheetCategoriesList');
  if (!container) return;

  // Lista de rótulos formatados para exibição
  const nomesFormatados = {
    'todos': 'Todos as Figurinhas',
    'memes': 'Memes',
    'cachorro': 'Cachorro',
    'gato': 'Gato',
    'bom-dia': 'Bom Dia',
    'boa-tarde': 'Boa Tarde',
    'boa-noite': 'Boa Noite',
    'reacoes': 'Reações',
    'humor': 'Humor',
    'animais': 'Animais',
    'triste': 'Triste',
    'feliz': 'Feliz',
    'times': 'Times',
    'politica': 'Política',
    'religiao': 'Religião',
    'chaves':'Chaves'
  };



// Garante que 'todos' seja obrigatoriamente a primeira chave da lista
// Usa exatamente a ordem das chaves definidas em nomesFormatados
  const chaves = Object.keys(nomesFormatados);

  container.innerHTML = chaves.map(chave => {
    const total = (categoriasMap[chave] || []).length;
    const label = nomesFormatados[chave];
    const ativo = state.categoria === chave ? 'active' : '';

    return `
      <button type="button" class="sheet-category-item ${ativo}" data-category="${chave}">
        <span>${label}</span>
        <span class="sheet-category-badge">${total}</span>
      </button>
    `;
  }).join('');

  container.addEventListener('click', (e) => {
    const item = e.target.closest('.sheet-category-item');
    if (!item) return;

    const cat = item.getAttribute('data-category');
    state.categoria = cat;

    // Atualiza o estado visual na Bottom Sheet
    container.querySelectorAll('.sheet-category-item').forEach(b => b.classList.toggle('active', b.dataset.category === cat));

    // Sincroniza os chips horizontais da grade
renderizarGrade();
    if (typeof atualizarBotaoLimpar === 'function') atualizarBotaoLimpar();

    // Fecha apenas se estiver em tela mobile
    if (window.innerWidth <= 950) {
      const panel = document.getElementById('splitLeftPanel');
      const overlay = document.getElementById('navOverlay');
      if (panel) panel.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
      document.body.classList.remove('menu-open');
    }
  });
}





//just for reloading animation ;)

var elem = document.getElementById("root")

window.onclick = function(){
  document.body.removeChild(elem)
  setTimeout(function(){
      document.body.prepend(elem)
  }, 100)
}