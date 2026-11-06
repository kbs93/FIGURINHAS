//import { categoriasMap, gerarFallback } from './data.js';
import { CustomColorPicker } from './cor.js';
import { inicializarApresentacao } from './intro.js';
import { copiarFigurinha } from './clip.js';
import { Paginador } from './paginacao.js';
import { obterUrlFigurinha } from './storageConfig.js';

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 150) ? '#1a202c' : '#e9edef';
}''


// Objeto global de dados populado via JSON
let categoriasMap = {};

// Fallback visual SVG caso a figurinha não exista na pasta
function gerarFallback(nome) {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
  <rect width='512' height='512' fill='%23ffffff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='80'></text><text x='50%' y='70%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='32' fill='%23111111'>${nome}.webp</text></svg>`;
}

// Carrega o arquivo JSON e monta a lista 'todos' sem duplicados
async function carregarDadosJSON() {
  try {
    const resposta = await fetch('js/figurinhas.json');
    if (!resposta.ok) throw new Error('Falha ao carregar figurinhas.json');
    categoriasMap = await resposta.json();

    // Gera a categoria "todos" automaticamente
    const todosSet = new Set();
    Object.values(categoriasMap).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(nome => todosSet.add(nome));
      }
    });
    categoriasMap['todos'] = Array.from(todosSet);

    // Inicializa as telas e contadores com os dados já em memória
    renderizarCategoriasBottomSheet();
    renderizarGrade();
  } catch (erro) {
    console.error('Erro na carga dos dados:', erro);
  }
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

  // Atualiza a barra de navegação/topo do navegador no celular
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', hex);
  }

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
// Aplica a cor salva logo ao carregar a página
if (savedTheme !== '#0b141a') {
  applySiteTheme(savedTheme);
} else {
  // Garante que a barra superior inicie com a cor padrão
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) metaTheme.setAttribute('content', savedTheme);
}
const state = {
  categoria: 'todos',
  busca: '',
  stickerSelecionado: null
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarApresentacao();
  iniciarBotaoInicioDesktop();
  iniciarFiltros();
  iniciarBusca();
  iniciarCliquesGrade();
  iniciarModalPreview();
  iniciarMenu();
  iniciarModais();
  iniciarBuscaMobileFlutuante();
// Inicializa o módulo separado de paginação passando a função de renderizar
  Paginador.iniciar(renderizarGrade);
  // Dispara a leitura do JSON e renderiza as figurinhas
  carregarDadosJSON();
});



function iniciarBotaoInicioDesktop() {
  const btnReturnDesktop = document.getElementById('btnReturnHomeDesktop');
  const intro = document.getElementById('introScreen');
  if (!btnReturnDesktop || !intro) return;

  btnReturnDesktop.addEventListener('click', () => {
    intro.classList.remove('hidden');
    if (location.hash === '#catalogo') {
      history.pushState({ tela: 'apresentacao' }, '', window.location.pathname);
    }
  });
}



// Remove acentos, pontuação e padroniza o texto
function normalizarTexto(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .trim();
}

// Mapa de sinónimos e equivalências para palavras comuns
const mapaSinonimos = {
  'bebe': ['bebe', 'bebes', 'crianca', 'criancas', 'nenem'],
  'crianca': ['crianca', 'criancas', 'bebe', 'bebes', 'infantil'],
  'cachorro': ['cachorro', 'cao', 'dog', 'animais', 'pet'],
  'gato': ['gato', 'cat', 'animais', 'felino'],
  'meme': ['meme', 'memes', 'zoeira', 'humor', 'engracado'],
  'engracado': ['engracado', 'humor', 'memes', 'comedia'],
  'futebol': ['times', 'flamengo', 'corinthians', 'palmeiras', 'futebol', 'jogo'],
  'triste': ['triste', 'choro', 'tristeza', 'bad'],
  'feliz': ['feliz', 'alegria', 'comemoracao', 'festa']
};







/**
 * 1. Renderiza a grade de figurinhas conectada ao Paginador
 */
function renderizarGrade() {
  const grid = document.getElementById('stickersGrid');
  const empty = document.getElementById('emptyState');
  const statusCount = document.getElementById('catalogStatusCount');
  if (!grid) return;

const termoBusca = normalizarTexto(state.busca);

  // Se houver texto digitado no campo de busca, pesquisa em TODAS as figurinhas
  // Se o campo estiver vazio, respeita a categoria atualmente clicada
  const baseLista = termoBusca ? (categoriasMap['todos'] || []) : (categoriasMap[state.categoria] || []);

  const filtrados = baseLista.filter(item => {
    if (!termoBusca) return true;

    // Obtém o nome limpo do arquivo (sem extensão e sem traços)
    const nomeLimpo = normalizarTexto(item);

    // Identifica quais categorias do JSON contêm este item
    const categoriasDoItem = Object.keys(categoriasMap)
      .filter(cat => cat !== 'todos' && Array.isArray(categoriasMap[cat]) && categoriasMap[cat].includes(item))
      .map(cat => normalizarTexto(cat));

    // Texto completo onde a busca pode encontrar o termo
    const textoCompleto = `${nomeLimpo} ${categoriasDoItem.join(' ')}`;

    // Divide a busca caso o usuário digite mais de uma palavra (ex: "cachorro bom dia")
    const palavrasBuscadas = termoBusca.split(/\s+/).filter(Boolean);

    // Valida se cada palavra digitada é atendida pelo arquivo, pela categoria ou por sinónimos
    return palavrasBuscadas.every(palavra => {
      if (textoCompleto.includes(palavra)) return true;

      // Verifica sinónimos mapeados
      for (const [chave, sinonimos] of Object.entries(mapaSinonimos)) {
        if (chave.includes(palavra) || sinonimos.some(s => s.includes(palavra))) {
          const achouSinonimo = sinonimos.some(s => textoCompleto.includes(s));
          if (achouSinonimo) return true;
        }
      }

      return false;
    });
  });

  // Atualiza a lista filtrada no paginador
  Paginador.definirLista(filtrados);

  if (filtrados.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    if (statusCount) {
      statusCount.innerHTML = `Nenhuma figurinha encontrada para esta pesquisa`;
    }
    Paginador.atualizarInterfaceControles();
    return;
  }

  if (empty) empty.classList.add('hidden');

  // MOSTRA A FATIA ATUAL DE FIGURINHAS A CONTAGEM DAS MENSAGEM EM CADA PAGINA 
  const fatia = Paginador.obterFatia();

if (statusCount) {
    const textoFaixa = fatia.inicio === fatia.fim 
      ? `<strong>${fatia.fim}</strong>` 
      : `<strong>${fatia.inicio} ate ${fatia.fim}</strong>`;

    statusCount.innerHTML = `Mostrando ${textoFaixa} de <strong>${fatia.total}</strong> figurinhas`;
  }

  grid.innerHTML = '';
  const fragmento = document.createDocumentFragment();









  //=============================================================================================================
//=============================================================================================================
//=============================================================================================================
//=============================================================================================================
//=============================================================================================================
//=============================================================================================================
//=============================================================================================================
fatia.itens.forEach(item => {
    const itemStr = String(item).trim();
    if (!itemStr) return;

    const ehGif = itemStr.toLowerCase().endsWith('.gif') || itemStr.toLowerCase() === 'd43';

    const filename = ehGif 
      ? (itemStr.toLowerCase().endsWith('.gif') ? itemStr : `${itemStr}.gif`)
      : (itemStr.includes('.') ? itemStr : `${itemStr}.webp`);

    // Isola apenas o nome do arquivo para o texto do card (ex: "gato/b.webp" vira apenas "b")
    const apenasArquivo = filename.split('/').pop();
    const baseName = apenasArquivo.replace(/\.(webp|gif|png)$/i, '');

    // Envia o caminho completo (com a pasta) para montar a URL da CDN
    const caminho = obterUrlFigurinha(filename);

    //quando for enviar para o firebase storage, usar o link abaixo, mas antes precisa enviar as figurinhas para o firebase storage
    //const caminho = `https://firebasestorage.googleapis.com/v0/b/boxfiguras.firebasestorage.app/o/figurinhas%2F${encodeURIComponent(filename)}?alt=media`;
    const fallback = gerarFallback(baseName);

    const cell = document.createElement('div');
    cell.className = 'sticker-cell';
    cell.setAttribute('data-url', caminho);
    cell.setAttribute('data-fallback', fallback);
    cell.setAttribute('data-filename', filename);
    cell.title = `Clique para enviar ${filename}`;

    const preview = document.createElement('div');
    preview.className = 'sticker-preview';

    const img = document.createElement('img');
    img.width = 88;
    img.height = 88;
    img.loading = 'lazy';
    img.alt = filename;
    img.src = caminho;
    img.onerror = function() {
      this.onerror = null;
      this.src = fallback;
    };

    const span = document.createElement('span');
    span.className = 'sticker-filename';
    span.textContent = baseName;

    preview.appendChild(img);
    cell.appendChild(preview);
    cell.appendChild(span);
    fragmento.appendChild(cell);
  });

  grid.appendChild(fragmento);
  Paginador.atualizarInterfaceControles();
}


/**
 * 2. Clique na grade: bloqueia completamente abertura de modal para GIFs
 */
function iniciarCliquesGrade() {
  const grid = document.getElementById('stickersGrid');
  if (!grid) return;

  function processarClique(e) {
    const celula = e.target.closest('.sticker-cell');
    if (!celula) return;

    const url = (celula.getAttribute('data-url') || '').toLowerCase();
    const filename = (celula.getAttribute('data-filename') || '').toLowerCase();
    const imgSrc = (celula.querySelector('img')?.getAttribute('src') || '').toLowerCase();

    // Se qualquer referência apontar para GIF, trava tudo e não abre modal de jeito nenhum
    const ehGif = url.includes('.gif') || filename.includes('.gif') || imgSrc.includes('.gif');

    if (ehGif) {
      // Impede qualquer comportamento padrão ou propagação que abriria o modal
      e.stopPropagation();
mostrarToastAnimadoComConfete('Pressione e segure, Escolhe copiar imagem, depois e so colar no WhatsApp');
      return;
    }

    // Se for WEBP normal, segue o fluxo
    document.querySelectorAll('.sticker-cell').forEach(c => c.classList.remove('selected'));
    celula.classList.add('selected');

    const fallback = celula.getAttribute('data-fallback');
    abrirModalPreview(celula.getAttribute('data-url'), fallback, celula.getAttribute('data-filename'));
  }

  // Captura tanto o clique comum quanto o toque imediato do mobile
  grid.addEventListener('click', processarClique);
}


/**======================================PREVIA DAS FIGURINHAS=================================================================
 * 
 * 3. Modal de Prévia e Envio (instância única com fallback para .gif)
 */
function abrirModalPreview(url, fallback, filename) {
  // Se for GIF, aborta imediatamente
  if (String(url).toLowerCase().includes('.gif') || String(filename).toLowerCase().includes('.gif')) {
    return;
  }

  state.stickerSelecionado = { url, fallback, filename };
  // ... resto da função continua exatamente igual

  const modal = document.getElementById('modalPreview');
  const previewImg = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const previewTitle = document.getElementById('previewTitle');

  if (!modal || !previewImg) return;

  previewImg.onerror = null;
  previewImg.src = '';
  const urlGif = url.includes('.webp') ? url.replace('.webp', '.gif') : url;

  previewImg.onerror = () => {
    if (previewImg.src !== urlGif && !url.endsWith('.gif')) {
      previewImg.src = urlGif;
      state.stickerSelecionado.url = urlGif;
    } else {
      previewImg.onerror = null;
      previewImg.src = fallback;
    }
  };

  previewImg.src = url;
  modal.classList.add('active');
}





/**
 * 4. Modal de Prévia e Envio
 */
function iniciarModalPreview() {
  const modal = document.getElementById('modalPreview');
  const btnClose = document.getElementById('previewCloseBtn');
  const btnSend = document.getElementById('btnZapSend');
  const btnCopiar = document.getElementById('btnCopiarFigurinha');

  if (!modal) return;

  function fechar() {
    modal.classList.remove('active');
    state.stickerSelecionado = null;
    
    const previewImg = document.getElementById('previewImage');
    if (previewImg) {
      previewImg.onerror = null;
      previewImg.src = '';
    }

    // Garante que o botão volte ao texto original se o modal for fechado
    if (btnCopiar) {
      btnCopiar.disabled = false;
      btnCopiar.innerHTML = '<i class="bi bi-clipboard-check"></i> <span>Copiar Figurinha</span>';
    }
  }

  if (btnClose) btnClose.addEventListener('click', fechar);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) fechar();
  });

  // Ação de copiar direto para a área de transferência com feedback no botão
// Ação de envio/cópia nativa com suporte a Web Share e Clipboard
if (btnCopiar) {
    btnCopiar.addEventListener('click', async () => {
      if (!state.stickerSelecionado) return;

      const textoOriginal = '<i class="bi bi-clipboard-check"></i> <span>Copiar Figurinha</span>';

      try {
        btnCopiar.disabled = true;
        btnCopiar.innerHTML = '<i class="bi bi-arrow-repeat"></i> <span>Copiando...</span>';

        await copiarFigurinha(state.stickerSelecionado.url);

        btnCopiar.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Copiado!</span>';
        mostrarToast('Figurinha copiada! Agora é só colar na conversa do WhatsApp.');

        setTimeout(() => fechar(), 1200);
      } catch (err) {
        console.error('Erro ao copiar:', err);
        btnCopiar.disabled = false;
        btnCopiar.innerHTML = textoOriginal;
        mostrarToast('Não foi possível copiar a figurinha.');
      }
    });
  }
  if (btnSend) {
    btnSend.addEventListener('click', async () => {
      if (!state.stickerSelecionado) return;

      const { url, fallback, filename } = state.stickerSelecionado;

      btnSend.disabled = true;
      mostrarToast('Processando figurinha...');

      const res = await compartilharSticker(url, fallback, filename);

      btnSend.disabled = false;

      if (res && res.status === 'sucesso') {
        mostrarToast('Enviado! No WhatsApp, toque na foto e escolha "Criar Figurinha" ou "Favoritar".');
        fechar();
      } else if (res && res.modo === 'download') {
        mostrarToast(`Figurinha ${filename} baixada! Arraste para o WhatsApp.`);
        fechar();
      } else if (res && res.status === 'erro') {
        mostrarToast('Erro ao enviar figurinha.');
      }
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
Paginador.resetar();
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
    Paginador.resetar();
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
//=========================================  MOSTRAR TOAST  ===================================
 function mostrarToast(texto) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
 toast.innerHTML = texto;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}


/**
 * Dispara confetes coloridos saindo do centro da tela
 */



function dispararConfetes() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const cores = ['#00d592', '#00e676', '#f6c343', '#007aff', '#ff4081', '#ffffff', '#ff1b1b', '#01fcfc', '#fbff07'];
  const total = 92;
  const centroX = window.innerWidth / 2;
  const centroY = window.innerHeight / 2;

  for (let i = 0; i < total; i++) {
    const particula = document.createElement('div');
    particula.className = 'confetti-particle';

    const cor = cores[Math.floor(Math.random() * cores.length)];
    const largura = Math.floor(Math.random() * 40 + 40) + 'px';
    const altura = Math.floor(Math.random() * 20 + 20) + 'px';

    // Ângulo e distância aleatória para explosão 360 graus
    const angulo = Math.random() * 2 * Math.PI;
    const distancia = Math.random() * 180 + 70;
    const tx = Math.cos(angulo) * distancia + 'px';
    const ty = Math.sin(angulo) * distancia + 'px';
    const rot = (Math.random() * 720 - 360) + 'deg';

    particula.style.backgroundColor = cor;
    particula.style.width = largura;
    particula.style.height = altura;
    particula.style.left = centroX + 'px';
    particula.style.top = centroY + 'px';
    particula.style.setProperty('--tx', tx);
    particula.style.setProperty('--ty', ty);
    particula.style.setProperty('--rot', rot);

    container.appendChild(particula);
  }

  // Remove os confetes do DOM após a animação acabar
  setTimeout(() => {
    container.remove();
  }, 950);
}

// PRESSIONE Toast flutuante com animação até o meio da tela e confete
 
function mostrarToastAnimadoComConfete(texto) {
  let toast = document.getElementById('toastGifDestaque');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastGifDestaque';
    toast.className = 'toast-destaque-gif';
    toast.innerHTML = `<span class="toast-icon"></span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }

  toast.querySelector('.toast-msg').textContent = texto;

  // Ativa a subida para o meio da tela
  toast.classList.add('ativo');
  dispararConfetes();

  // Fecha e esconde após 2.2 segundos
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('ativo');
  }, 6200);
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
 * LISTA DAS CATEGORIAS
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
    'chaves':'Chaves',
    'flork':'Flork',
    'criancas':'Crianças',
    'bebes':'Bebês',
    'animacao':'Animação',
    'filmes':'Filmes',
    'series':'Séries',
    'games':'Games',
    'musica':'Música',
    'outros':'Outros'
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
