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
}


// Objeto global de dados populado via JSON
let categoriasMap = {};

// Fallback visual SVG caso a figurinha não exista na pasta
function gerarFallback(nome) {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
  <rect width='512' height='512' fill='%23ffffff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='80'></text><text x='50%' y='70%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='32' fill='%23111111'>${nome}.webp</text></svg>`;
}
// Tenta recarregar a imagem até 2 vezes antes de aplicar o fallback branco
function configurarCargaComRetry(img, urlOriginal, fallbackUrl, tentativasMax = 2) {
  let tentativas = 0;

  img.onerror = function() {
    if (tentativas < tentativasMax) {
      tentativas++;
      const atraso = tentativas * 900;
      setTimeout(() => {
        const separador = urlOriginal.includes('?') ? '&' : '?';
        img.src = `${urlOriginal}${separador}retry=${tentativas}`;
      }, atraso);
    } else {
      this.onerror = null;
      this.src = fallbackUrl;
    }
  };
}

// Carrega o arquivo JSON e monta a lista 'todos' sem duplicados
// Carrega o arquivo JSON e monta a lista 'todos' sem duplicados
async function carregarDadosJSON() {
  try {
    const resposta = await fetch('js/figurinhas.json');
    if (!resposta.ok) throw new Error('Falha ao carregar figurinhas.json');
    categoriasMap = await resposta.json();
    // Gera a categoria "todos" automaticamente
// Gera a categoria "todas" automaticamente
    const todasSet = new Set();
    Object.values(categoriasMap).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(nome => todasSet.add(nome));
      }
    });
    categoriasMap['todas'] = Array.from(todasSet);
    // Inicializa a lista lateral com os dados já carregados
    renderizarCategoriasBottomSheet();
const rawHash = window.location.hash.replace(/^#/, '').trim();
    if (!rawHash || rawHash === 'catalogo' || rawHash === 'inicio' || rawHash === 'todas') {
      state.categoria = 'todas';
    } else {
      state.categoria = rawHash.replace(/^catalogo[\/-]/, '');
    }
    Paginador.resetar();
    // Se estiver na tela de apresentação inicial, não faz o download antecipado das centenas de imagens
    const introVisivel = !rawHash || rawHash === 'apresentacao';
    if (!introVisivel) {
      renderizarGrade();
    }
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
const state = {
  categoria: 'todas',
  busca: '',
  stickerSelecionado: null
};
document.addEventListener('DOMContentLoaded', () => {
  // Aplicação de tema agrupada sem forçar recálculos repetidos
  if (savedTheme !== '#0b141a') {
    applySiteTheme(savedTheme);
  }
  atualizarPreviewsTema(savedTheme);
  Paginador.iniciar(renderizarGrade);
  inicializarApresentacao();
  iniciarBotaoInicioDesktop();
  iniciarCliquesGrade();
  iniciarModalPreview();
  iniciarMenu();
  iniciarModais();
  iniciarGeradorRapido();
 

  // Conecta o clique do botão da tela de entrada para renderizar a grade no momento da transição
  const btnStart = document.getElementById('btnIntroStart');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (categoriasMap && Object.keys(categoriasMap).length > 0) {
        renderizarGrade();
      }
    }, { once: true });
  }

  // Se a página for aberta direto com rota (ex: #catalogo), carrega os dados de imediato
  const rotaDireta = window.location.hash.length > 1 && window.location.hash !== '#apresentacao';
  if (rotaDireta) {
    carregarDadosJSON().then(() => {
      requestAnimationFrame(() => {
        iniciarRoteamentoHash();
      });
    });
  } else {
    // Na tela inicial (apresentação), adia a leitura do JSON para dar prioridade total à renderização visual
    const iniciarCargaSegundoPlano = () => {
      carregarDadosJSON().then(() => {
        requestAnimationFrame(() => {
          iniciarRoteamentoHash();
        });
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(iniciarCargaSegundoPlano, { timeout: 2500 });
    } else {
      setTimeout(iniciarCargaSegundoPlano, 1200);
    }
  }
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

/**
 * Monitora e sincroniza a URL (#categoria)
 */
/**
 * Monitora e sincroniza a URL mantendo a tela de apresentação escondida
 */
function iniciarRoteamentoHash() {
  function aplicarRota() {
    const rawHash = window.location.hash.replace(/^#/, '').trim();
    const intro = document.getElementById('introScreen');

    // Se estiver navegando em qualquer categoria ou no catálogo, garante a tela inicial escondida
    if (rawHash && rawHash !== 'apresentacao') {
      if (intro) intro.classList.add('hidden');
    }

    if (!rawHash || rawHash === 'catalogo' || rawHash === 'todas' || rawHash === 'inicio') {
      state.categoria = 'todas';
    } else {
      // Suporta rotas como #catalogo/cachorro ou #cachorro
      state.categoria = rawHash.replace(/^catalogo[\/-]/, '');
    }

    sincronizarAtivosMenu();
    Paginador.resetar();
    renderizarGrade();
    if (typeof atualizarBotaoLimpar === 'function') atualizarBotaoLimpar();
  }

  window.addEventListener('hashchange', () => {
    aplicarRota();
    // Reforça que a tela de apresentação continue oculta após o hashchange
    setTimeout(() => {
      const intro = document.getElementById('introScreen');
      if (intro && window.location.hash && window.location.hash !== '#apresentacao') {
        intro.classList.add('hidden');
      }
    }, 10);
  });

const hashInicial = window.location.hash.replace(/^#/, '').trim();
  if (hashInicial && hashInicial !== 'apresentacao') {
    aplicarRota();
  } else {
    state.categoria = 'todas';
  }
}

function sincronizarAtivosMenu() {
  const container = document.getElementById('sheetCategoriesList');
  if (container) {
    container.querySelectorAll('.sheet-category-item').forEach(b => {
      b.classList.toggle('active', b.dataset.category === state.categoria);
    });
  }
}

/**
 * 1. Renderiza a grade de figurinhas ou os cards de pacotes conectado ao Paginador
 */
function renderizarGrade() {
  const grid = document.getElementById('stickersGrid');
  const empty = document.getElementById('emptyState');
  const statusCount = document.getElementById('catalogStatusCount');
  if (!grid) return;

  // Se o JSON ainda não foi carregado na memória, não renderiza nada ainda
  if (!categoriasMap || Object.keys(categoriasMap).length === 0) {
    return;
  }

  const termoBusca = normalizarTexto(state.busca);

  // MODO 1: VITRINE DE PACOTES (Quando a categoria for 'todos' e não houver busca ativa)
  if ((!state.categoria || state.categoria === 'todas') && !termoBusca) {

    grid.classList.add('grid-pacotes-modo');
    Paginador.configurarModo('pacotes');

   const pacotesLista = Object.keys(categoriasMap).filter(cat => cat !== 'todos' && cat !== 'todas' && Array.isArray(categoriasMap[cat]) && categoriasMap[cat].length > 0);
    Paginador.definirLista(pacotesLista);

    const fatia = Paginador.obterFatia();

    if (statusCount) {
      statusCount.innerHTML = `Mostrando pacotes <strong>${fatia.inicio} até ${fatia.fim}</strong> de <strong>${fatia.total}</strong> categorias`;
    }

    if (empty) empty.classList.add('hidden');
    grid.innerHTML = '';
    const fragmento = document.createDocumentFragment();

    fatia.itens.forEach(chaveCat => {
      const figurasDaCat = categoriasMap[chaveCat] || [];
      const tituloFormatado = chaveCat.replace(/[-_]/g, ' ').toUpperCase();

      const card = document.createElement('div');
      card.className = 'pack-card';
      card.setAttribute('data-target-cat', chaveCat);

    const header = document.createElement('div');
      header.className = 'pack-card-header';
      header.innerHTML = `<span class="pack-card-title">${tituloFormatado}</span>`;
      const previewsWrapper = document.createElement('div');
      previewsWrapper.className = 'pack-card-previews';

      // Pega até 4 figuras de prévia para compor o card
      
      // Pega até 4 figuras de prévia para compor o card
      const prevFiguras = figurasDaCat.slice(0, 4);
      prevFiguras.forEach(item => {
        const itemStr = String(item).trim();
        const ehGif = itemStr.toLowerCase().endsWith('.gif') || itemStr.toLowerCase() === 'd43';
        const filename = ehGif 
          ? (itemStr.toLowerCase().endsWith('.gif') ? itemStr : `${itemStr}.gif`)
          : (itemStr.includes('.') ? itemStr : `${itemStr}.webp`);

        const baseName = filename.split('/').pop().replace(/\.(webp|gif|png)$/i, '');
        const caminho = obterUrlFigurinha(filename);
        const fallback = gerarFallback(baseName);

        const miniBox = document.createElement('div');
        miniBox.className = 'pack-mini-preview';

        const img = document.createElement('img');
        img.setAttribute('width', '64');
        img.setAttribute('height', '64');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = `Prévia de ${baseName}`;
    configurarCargaComRetry(img, caminho, fallback);
        img.src = caminho;
        miniBox.appendChild(img);
        previewsWrapper.appendChild(miniBox);
      });



      card.appendChild(header);
      card.appendChild(previewsWrapper);
      fragmento.appendChild(card);
    });

    grid.appendChild(fragmento);
    Paginador.atualizarInterfaceControles();
    return;
  }

  // MODO 2: GRADE COMPLETA DA CATEGORIA OU BUSCA (Com rota limpa #categoria)
// MODO 2: GRADE DE TODAS AS FIGURINHAS OU DA CATEGORIA SELECIONADA
  grid.classList.remove('grid-pacotes-modo');
  Paginador.configurarModo('figuras');

  const catAlvo = state.categoria || 'todas';
  const baseLista = termoBusca ? (categoriasMap['todas'] || []) : (categoriasMap[catAlvo] || []);

  const filtrados = baseLista.filter(item => {
    if (!termoBusca) return true;

    const nomeLimpo = normalizarTexto(item);
    const categoriasDoItem = Object.keys(categoriasMap)
      .filter(cat => cat !== 'todas' && Array.isArray(categoriasMap[cat]) && categoriasMap[cat].includes(item))
      .map(cat => normalizarTexto(cat));

    const textoCompleto = `${nomeLimpo} ${categoriasDoItem.join(' ')}`;
    const palavrasBuscadas = termoBusca.split(/\s+/).filter(Boolean);
return palavrasBuscadas.every(palavra => {
      if (textoCompleto.includes(palavra)) return true;

      if (typeof mapaSinonimos !== 'undefined' && mapaSinonimos) {
        for (const [chave, sinonimos] of Object.entries(mapaSinonimos)) {
          if (chave.includes(palavra) || sinonimos.some(s => s.includes(palavra))) {
            if (sinonimos.some(s => textoCompleto.includes(s))) return true;
          }
        }
      }
      return false;
    });

  });

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

  const fatia = Paginador.obterFatia();

  if (statusCount) {
    const textoFaixa = fatia.inicio === fatia.fim 
      ? `<strong>${fatia.fim}</strong>` 
      : `<strong>${fatia.inicio} até ${fatia.fim}</strong>`;

    const infoCat = state.categoria !== 'todas' ? ` na categoria <strong>${state.categoria}</strong>` : '';
    statusCount.innerHTML = `Mostrando ${textoFaixa} de <strong>${fatia.total}</strong> figurinhas${infoCat}`;
  }

  grid.innerHTML = '';
  const fragmento = document.createDocumentFragment();

  fatia.itens.forEach(item => {
    const itemStr = String(item).trim();
    if (!itemStr) return;

    const ehGif = itemStr.toLowerCase().endsWith('.gif') || itemStr.toLowerCase() === 'd43';
    const filename = ehGif 
      ? (itemStr.toLowerCase().endsWith('.gif') ? itemStr : `${itemStr}.gif`)
      : (itemStr.includes('.') ? itemStr : `${itemStr}.webp`);

    const apenasArquivo = filename.split('/').pop();
    const baseName = apenasArquivo.replace(/\.(webp|gif|png)$/i, '');
    const caminho = obterUrlFigurinha(filename);
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
    img.decoding = 'async';
    img.alt = filename;
 configurarCargaComRetry(img, caminho, fallback);
        img.src = caminho;
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
    // Intercepta clique nos Cards de Pacotes da vitrine
 // Intercepta clique nos Cards de Pacotes da vitrine
    const packCard = e.target.closest('.pack-card');
    if (packCard) {
      const catAlvo = packCard.getAttribute('data-target-cat');
      if (catAlvo) {
        window.location.hash = '#catalogo/' + catAlvo;
      }
      return;
    }
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
  configurarCargaComRetry(previewImg, url, fallback);
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
      item.classList.toggle('active', item.dataset.category === 'todas');
    });

    const todosChip = document.querySelector('.chip[data-category="todas"]');
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
// Lista de rótulos formatados para exibição
  const nomesFormatados = {
    'todas': 'Todas as Figurinhas',
    'memes': 'Memes',
    'cachorro': 'Cachorro',
    'gato': 'Gato',
    'bom-dia': 'Bom Dia',
    'boa-tarde': 'Boa Tarde',
    'boa-noite': 'Boa Noite',
    'amor': 'Amor',
    'animais': 'Animais',
    'atencao': 'Atenção',
    'feliz': 'Feliz',
    'times': 'Times',
    'politica': 'Política',
    'religiao': 'Religião',
    'chaves':'Chaves',
    'flork':'Flork',
    'palavras':'Palavras',
    'pix':'Pix',
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

    // Atualiza a URL com o hash da categoria
    // Atualiza a URL preservando o prefixo do catálogo para não disparar a tela inicial
// Define a rota exata da categoria selecionada
    window.location.hash = '#catalogo/' + cat;
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
/* ==========================================================================
   GERADOR DE FIGURAS RÁPIDAS (UPLOAD + CORTE 512x512 + 3 TEXTOS + 10 CORES/FONTES)
   ========================================================================== */
const STORAGE_GERADAS_KEY = 'boxfiguras_geradas_v3';
const LIMITE_FIGURAS_GERADAS = 39;
const EXPIRACAO_FIGURAS_MS = 24 * 60 * 60 * 1000; // 24 horas
//const EXPIRACAO_FIGURAS_MS = 1 * 60 * 1000; // 1 minuto

const PALAVRAS_BLOQUEADAS = ['sexo', 'porno', 'xxx', 'nude', 'puta', 'caralho', 'buceta', 'http://', 'https://', 'www.','.com','porra','cu','cuzinho','bucetinha','priquito','prikito'];

function obterFigurasGeradas() {
  try {
    const salvo = localStorage.getItem(STORAGE_GERADAS_KEY);
    const lista = salvo ? JSON.parse(salvo) : [];
    if (!Array.isArray(lista)) return [];

    const agora = Date.now();
    const validas = lista.filter(item => item && item.img && (!item.criadoEm || (agora - item.criadoEm) < EXPIRACAO_FIGURAS_MS));

    // Se alguma figurinha passou de 24h, atualiza o localStorage limpando as expiradas
    if (validas.length !== lista.length) {
      localStorage.setItem(STORAGE_GERADAS_KEY, JSON.stringify(validas));
    }

    return validas;
  } catch {
    return [];
  }
}

function salvarNovaFiguraGerada(dataUrlComprimida) {
  const atuais = obterFigurasGeradas();
  atuais.unshift({
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    img: dataUrlComprimida,
    criadoEm: Date.now()
  });

  let limitadas = atuais.slice(0, LIMITE_FIGURAS_GERADAS);
  while (limitadas.length > 0) {
    try {
      localStorage.setItem(STORAGE_GERADAS_KEY, JSON.stringify(limitadas));
      break;
    } catch {
      limitadas.pop();
    }
  }
  renderizarQuadroGeradas();
}

function apagarFiguraGeradaPorIndice(indice) {
  try {
    const atuais = obterFigurasGeradas();
    atuais.splice(indice, 1);
    localStorage.setItem(STORAGE_GERADAS_KEY, JSON.stringify(atuais));
    renderizarQuadroGeradas();
    mostrarToast('Figurinha removida.');
  } catch (err) {
    console.error('Erro ao apagar figurinha local:', err);
  }
}

function limparTodasFigurasGeradas() {
  try {
    localStorage.removeItem(STORAGE_GERADAS_KEY);
    renderizarQuadroGeradas();
    mostrarToast('Todas as figurinhas geradas foram apagadas.');
  } catch (err) {
    console.error('Erro ao limpar figurinhas locais:', err);
  }
}

function renderizarQuadroGeradas() {
  const wrapper = document.getElementById('generatedBoardWrapper');
  const grid = document.getElementById('generatedStickersGrid');
  const btnClearAll = document.getElementById('btnClearGeneratedStickers');
  if (!wrapper || !grid) return;

  wrapper.classList.remove('hidden');
  const lista = obterFigurasGeradas();

  if (btnClearAll) {
    btnClearAll.classList.toggle('hidden', lista.length === 0);
  }

  if (lista.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 0.9rem; padding: 26px 10px; font-weight: 600;">
        Nenhuma figurinha gerada ainda. Clique em <strong>"Criar Nova"</strong> acima para montar a primeira! (Salvas por 24h)
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  const fragmento = document.createDocumentFragment();

  lista.forEach((item, idx) => {
    if (!item || !item.img) return;

    const card = document.createElement('div');
    card.className = 'generated-sticker-item';
    card.title = 'Clique para abrir e copiar para o WhatsApp';

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn-delete-single-sticker';
    btnDel.title = 'Apagar esta figurinha';
    btnDel.setAttribute('aria-label', 'Apagar figurinha');
    btnDel.innerHTML = '<i class="bi bi-trash3-fill"></i>';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      apagarFiguraGeradaPorIndice(idx);
    });

    const img = document.createElement('img');
    img.alt = `Figurinha gerada ${idx + 1}`;
    img.loading = 'lazy';
    img.src = item.img;

    card.addEventListener('click', () => {
      abrirModalPreview(item.img, item.img, `boxfiguras_${idx + 1}.webp`);
    });

    card.appendChild(btnDel);
    card.appendChild(img);
    fragmento.appendChild(card);
  });

  grid.appendChild(fragmento);
}

const CORES_CARROSSEL = [
  '#ffffff', // Branco
  '#000000', // Preto
  '#ffeb3b', // Amarelo
  '#ff1744', // Vermelho
  '#00e676', // Verde Neon
  '#00b0ff', // Azul Claro
  '#ff9100', // Laranja
  '#f50057', // Rosa Pink
  '#d500f9', // Roxo
  '#00e5ff', // Ciano
  '#76ff03', // Verde Lima
  '#ffea00', // Ouro
  '#ff3d00', // Vermelho Laranja
  '#651fff', // Violeta
  '#2979ff', // Azul Royal
  '#1de9b6', // Turquesa
  '#f48fb1', // Rosa Claro
  '#90caf9', // Azul Bebê
  '#a5d6a7', // Verde Pastel
  '#8d6e63'  // Marrom
];
const FONTES_CARROSSEL = [
  { nome: 'Anton', rotulo: 'Meme' },
  { nome: 'Bangers', rotulo: 'HQ' },
  { nome: 'Bebas Neue', rotulo: 'Impacto' },
  { nome: 'Montserrat', rotulo: 'Moderna' },
  { nome: 'Oswald', rotulo: 'Forte' },
  { nome: 'Fredoka', rotulo: 'Redonda' },
  { nome: 'Comic Neue', rotulo: 'Gibi' },
  { nome: 'Permanent Marker', rotulo: 'Pincel' },
  { nome: 'Lobster', rotulo: 'Cursiva' },
  { nome: 'Pacifico', rotulo: 'Manual' }
];
function textoPermitido(texto) {
  const limpo = normalizarTexto(texto);
  return !PALAVRAS_BLOQUEADAS.some(palavra => limpo.includes(palavra));
}

function carregarImagemArquivo(arquivoFile) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivoFile);
  });
}



function iniciarGeradorRapido() {
  const modal = document.getElementById('modalQuickGenerator');
  const btnOpenIntro = document.getElementById('btnOpenQuickCreator');
  const btnOpenCatalog = document.getElementById('btnCreatorFromCatalog');
  const btnClose = document.getElementById('quickGenCloseBtn');
  const inputUpload = document.getElementById('genPhotoUpload');
  const uploadLabel = document.getElementById('genUploadLabel');
  const canvas = document.getElementById('quickStickerCanvas');
  const zoomSlider = document.getElementById('genImgZoom');
  const btnResetPos = document.getElementById('btnResetImgPos');
  const colorsGrid = document.getElementById('genColorsGrid');
  const btnColorPrev = document.getElementById('btnColorPrev');
  const btnColorNext = document.getElementById('btnColorNext');
  const fontsCarousel = document.getElementById('genFontsCarousel');
  const btnFontPrev = document.getElementById('btnFontPrev');
  const btnFontNext = document.getElementById('btnFontNext');
  const fontSizeRange = document.getElementById('genFontSizeRange');
  const fontSizeVal = document.getElementById('genFontSizeVal');
  const inputSingleText = document.getElementById('genSingleTextInput');
  const btnAddText = document.getElementById('btnAddCanvasText');
  const btnGerar = document.getElementById('btnSaveAndCopyGenerated');

const btnClearGenerated = document.getElementById('btnClearGeneratedStickers');
  if (btnClearGenerated) {
    btnClearGenerated.addEventListener('click', () => {
      limparTodasFigurasGeradas();
    });
  }

  renderizarQuadroGeradas();

  // Verifica em tempo real a cada 5 segundos e remove da tela assim que vencer o prazo
  setInterval(() => {
    const grid = document.getElementById('generatedStickersGrid');
    if (!grid) return;
    const cardsVisiveis = grid.querySelectorAll('.generated-sticker-item').length;
    const validasAgora = obterFigurasGeradas().length;
    if (cardsVisiveis !== validasAgora) {
      renderizarQuadroGeradas();
    }
  }, 5000);

  if (!modal || !canvas) return;
  const ctx = canvas.getContext('2d');
  const SIZE = 512;

  const editorState = {
    img: null,
    imgX: SIZE / 2,
    imgY: SIZE / 2,
    imgZoom: 1,
    corAtual: CORES_CARROSSEL[0],
   fonteAtual: FONTES_CARROSSEL[0].nome,
    tamanhoAtual: fontSizeRange ? Number(fontSizeRange.value) : 54,
    textos: [], // Lista dinâmica: quantos textos o usuário quiser adicionar
    textoSelecionadoId: null
  };

  function desenharCanvasCompleto(modoEdicao = true) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 1. Desenha a foto ajustada
    if (editorState.img && editorState.img.complete && editorState.img.naturalWidth > 0) {
      const escalaBase = Math.min(SIZE / editorState.img.naturalWidth, SIZE / editorState.img.naturalHeight);
      const escalaFinal = escalaBase * editorState.imgZoom;
      const w = editorState.img.naturalWidth * escalaFinal;
      const h = editorState.img.naturalHeight * escalaFinal;
      const dx = editorState.imgX - w / 2;
      const dy = editorState.imgY - h / 2;
      ctx.drawImage(editorState.img, dx, dy, w, h);
    } else if (modoEdicao && editorState.textos.length === 0) {
      ctx.fillStyle = '#0660df';
      ctx.font = '600 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Envie uma foto ou adicione um texto', SIZE / 2, SIZE / 2);
    }

    // 2. Desenha todos os textos adicionados
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    editorState.textos.forEach((item) => {
      const corContorno = item.cor.toLowerCase() === '#000000' ? '#ffffff' : '#000000';
      ctx.font = `700 ${item.tamanho}px "${item.fonte}", sans-serif`;
      ctx.fillStyle = item.cor;
      ctx.strokeStyle = corContorno;
      ctx.lineWidth = Math.max(6, Math.round(item.tamanho * 0.18));

      const medidas = ctx.measureText(item.texto);
      item.largura = medidas.width;
      item.altura = item.tamanho;

      ctx.strokeText(item.texto, item.x, item.y);
      ctx.fillText(item.texto, item.x, item.y);

      // 3. Se estiver editando e este texto estiver selecionado, desenha a caixa pontilhada + botão (X)
      if (modoEdicao && editorState.textoSelecionadoId === item.id) {
        const padX = 18;
        const padY = 12;
        const boxW = Math.max(80, item.largura + padX * 2);
        const boxH = item.altura + padY * 2;
        const boxX = item.x - boxW / 2;
        const boxY = item.y - boxH / 2;

        ctx.save();
        ctx.strokeStyle = '#00d592';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.restore();

        // Botão circular vermelho (X) no canto superior direito da caixa do texto
        const btnRaio = 20;
        const btnX = boxX + boxW;
        const btnY = boxY;
        item.btnDelete = { x: btnX, y: btnY, r: btnRaio + 8 }; // Área generosa para toque no celular

        ctx.save();
        ctx.beginPath();
        ctx.arc(btnX, btnY, btnRaio, 0, Math.PI * 2);
        ctx.fillStyle = '#ff1744';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Ícone X branco centralizado
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const d = 8;
        ctx.beginPath();
        ctx.moveTo(btnX - d, btnY - d);
        ctx.lineTo(btnX + d, btnY + d);
        ctx.moveTo(btnX + d, btnY - d);
        ctx.lineTo(btnX - d, btnY + d);
        ctx.stroke();
        ctx.restore();
      } else {
        item.btnDelete = null;
      }
    });
  }

  function adicionarNovoTexto() {
    if (!inputSingleText) return;
    const frase = inputSingleText.value.trim();

    if (!frase) {
      mostrarToast('Digite um texto antes de adicionar.');
      inputSingleText.focus();
      return;
    }

    if (!textoPermitido(frase)) {
      mostrarToast('Texto não permitido. Tente outra frase.');
      return;
    }

    // Desloca levemente para baixo se já houver outros textos para não ficarem exatamente um em cima do outro
    const deslocamentoY = (editorState.textos.length % 5) * 48;
    const novoId = Date.now() + Math.random();

    editorState.textos.push({
      id: novoId,
      texto: frase,
      x: SIZE / 2,
      y: Math.min(SIZE - 60, 140 + deslocamentoY),
      cor: editorState.corAtual,
      fonte: editorState.fonteAtual,
      tamanho: editorState.tamanhoAtual,
      largura: 0,
      altura: editorState.tamanhoAtual,
      btnDelete: null
    });

    editorState.textoSelecionadoId = novoId;
    inputSingleText.value = '';
    desenharCanvasCompleto(true);
  }

  function obterCoordsCanvas(evento) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evento.touches ? evento.touches[0].clientX : evento.clientX;
    const clientY = evento.touches ? evento.touches[0].clientY : evento.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * SIZE,
      y: ((clientY - rect.top) / rect.height) * SIZE
    };
  }

  let alvoArrasto = null;

  function iniciarInteracaoCanvas(e) {
    const pos = obterCoordsCanvas(e);

    // 1. Primeiro verifica se clicou no botão (X) do texto selecionado para apagar
    for (let i = editorState.textos.length - 1; i >= 0; i--) {
      const t = editorState.textos[i];
      if (t.btnDelete) {
        const dist = Math.hypot(pos.x - t.btnDelete.x, pos.y - t.btnDelete.y);
        if (dist <= t.btnDelete.r) {
          editorState.textos.splice(i, 1);
          editorState.textoSelecionadoId = editorState.textos.length > 0
            ? editorState.textos[editorState.textos.length - 1].id
            : null;
          desenharCanvasCompleto(true);
          return;
        }
      }
    }

    // 2. Verifica se clicou em algum texto para selecionar e arrastar
    for (let i = editorState.textos.length - 1; i >= 0; i--) {
      const t = editorState.textos[i];
      const metadeW = Math.max(50, t.largura / 2 + 18);
      const metadeH = t.altura / 2 + 14;
      if (
        pos.x >= t.x - metadeW &&
        pos.x <= t.x + metadeW &&
        pos.y >= t.y - metadeH &&
        pos.y <= t.y + metadeH
      ) {
        editorState.textoSelecionadoId = t.id;
        alvoArrasto = {
          tipo: 'texto',
          item: t,
          offsetX: pos.x - t.x,
          offsetY: pos.y - t.y
        };
        desenharCanvasCompleto(true);
        return;
      }
    }

    // 3. Se clicou fora dos textos, desmarca seleção e arrasta a foto (se houver)
    editorState.textoSelecionadoId = null;
    if (editorState.img) {
      alvoArrasto = {
        tipo: 'imagem',
        offsetX: pos.x - editorState.imgX,
        offsetY: pos.y - editorState.imgY
      };
    }
    desenharCanvasCompleto(true);
  }

  function moverInteracaoCanvas(e) {
    if (!alvoArrasto) return;
    if (e.cancelable) e.preventDefault();
    const pos = obterCoordsCanvas(e);

    if (alvoArrasto.tipo === 'texto') {
      alvoArrasto.item.x = Math.max(20, Math.min(SIZE - 20, pos.x - alvoArrasto.offsetX));
      alvoArrasto.item.y = Math.max(20, Math.min(SIZE - 20, pos.y - alvoArrasto.offsetY));
    } else if (alvoArrasto.tipo === 'imagem') {
      editorState.imgX = pos.x - alvoArrasto.offsetX;
      editorState.imgY = pos.y - alvoArrasto.offsetY;
    }

    desenharCanvasCompleto(true);
  }

  function finalizarInteracaoCanvas() {
    alvoArrasto = null;
  }

  canvas.addEventListener('mousedown', iniciarInteracaoCanvas);
  window.addEventListener('mousemove', moverInteracaoCanvas);
  window.addEventListener('mouseup', finalizarInteracaoCanvas);

  canvas.addEventListener('touchstart', iniciarInteracaoCanvas, { passive: false });
  canvas.addEventListener('touchmove', moverInteracaoCanvas, { passive: false });
  canvas.addEventListener('touchend', finalizarInteracaoCanvas);

  // Adicionar texto pelo botão (+) ou tecla Enter
  if (btnAddText) {
    btnAddText.addEventListener('click', adicionarNovoTexto);
  }
  if (inputSingleText) {
    inputSingleText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionarNovoTexto();
      }
    });
  }

  // Zoom e Centralizar Foto
  if (zoomSlider) {
    zoomSlider.addEventListener('input', () => {
      editorState.imgZoom = Number(zoomSlider.value);
      desenharCanvasCompleto(true);
    });
  }

  if (btnResetPos) {
    btnResetPos.addEventListener('click', () => {
      editorState.imgX = SIZE / 2;
      editorState.imgY = SIZE / 2;
      editorState.imgZoom = 1;
      if (zoomSlider) zoomSlider.value = '1';
      desenharCanvasCompleto(true);
    });
  }

  // Carrossel Horizontal de Cores (atualiza também o texto selecionado no momento)
  if (colorsGrid) {
    colorsGrid.innerHTML = '';
    CORES_CARROSSEL.forEach((hex, index) => {
      const btnCor = document.createElement('button');
      btnCor.type = 'button';
      btnCor.className = 'gen-color-swatch' + (index === 0 ? ' selected' : '');
      btnCor.style.backgroundColor = hex;
      btnCor.title = hex;
      btnCor.addEventListener('click', () => {
        editorState.corAtual = hex;
        colorsGrid.querySelectorAll('.gen-color-swatch').forEach(b => b.classList.remove('selected'));
        btnCor.classList.add('selected');

        const sel = editorState.textos.find(t => t.id === editorState.textoSelecionadoId);
        if (sel) sel.cor = hex;
        desenharCanvasCompleto(true);
      });
      colorsGrid.appendChild(btnCor);
    });
  }

  if (btnColorPrev && colorsGrid) {
    btnColorPrev.addEventListener('click', () => {
      colorsGrid.scrollBy({ left: -140, behavior: 'smooth' });
    });
  }

  if (btnColorNext && colorsGrid) {
    btnColorNext.addEventListener('click', () => {
      colorsGrid.scrollBy({ left: 140, behavior: 'smooth' });
    });
  }

  // Seletor de Fonte (atualiza também o texto selecionado no momento)
// Carrossel Visual de Fontes
  if (fontsCarousel) {
    fontsCarousel.innerHTML = '';
    FONTES_CARROSSEL.forEach((f, index) => {
      const btnFonte = document.createElement('button');
      btnFonte.type = 'button';
      btnFonte.className = 'gen-font-pill' + (index === 0 ? ' selected' : '');
      btnFonte.style.fontFamily = `"${f.nome}", sans-serif`;
      btnFonte.textContent = f.rotulo;

      btnFonte.addEventListener('click', () => {
        editorState.fonteAtual = f.nome;
        fontsCarousel.querySelectorAll('.gen-font-pill').forEach(b => b.classList.remove('selected'));
        btnFonte.classList.add('selected');

        const sel = editorState.textos.find(t => t.id === editorState.textoSelecionadoId);
        if (sel) sel.fonte = editorState.fonteAtual;

        if (document.fonts && document.fonts.load) {
          document.fonts.load(`700 40px "${editorState.fonteAtual}"`).then(() => desenharCanvasCompleto(true));
        }
        desenharCanvasCompleto(true);
      });

      fontsCarousel.appendChild(btnFonte);
    });
  }

  if (btnFontPrev && fontsCarousel) {
    btnFontPrev.addEventListener('click', () => {
      fontsCarousel.scrollBy({ left: -150, behavior: 'smooth' });
    });
  }

  if (btnFontNext && fontsCarousel) {
    btnFontNext.addEventListener('click', () => {
      fontsCarousel.scrollBy({ left: 150, behavior: 'smooth' });
    });
  }

  // Barra de Tamanho da Fonte (atualiza também o texto selecionado no momento)
  if (fontSizeRange) {
    fontSizeRange.addEventListener('input', () => {
      editorState.tamanhoAtual = Number(fontSizeRange.value);
      if (fontSizeVal) fontSizeVal.textContent = String(editorState.tamanhoAtual);

      const sel = editorState.textos.find(t => t.id === editorState.textoSelecionadoId);
      if (sel) sel.tamanho = editorState.tamanhoAtual;
      desenharCanvasCompleto(true);
    });
  }

  // Upload da Foto
// Upload da Foto
  if (inputUpload) {
    inputUpload.addEventListener('change', async (e) => {
      const arquivo = e.target.files && e.target.files[0];
      if (!arquivo) return;

      try {
        if (uploadLabel) uploadLabel.textContent = 'Carregando foto...';
        editorState.img = await carregarImagemArquivo(arquivo);
        editorState.imgX = SIZE / 2;
        editorState.imgY = SIZE / 2;
        editorState.imgZoom = 1;
        if (zoomSlider) zoomSlider.value = '1';
        if (uploadLabel) uploadLabel.textContent = 'Trocar Foto / Imagem';
        desenharCanvasCompleto(true);
      } catch (err) {
        console.error('Erro ao carregar foto:', err);
        if (uploadLabel) uploadLabel.textContent = 'Escolher Foto / Imagem';
        mostrarToast('Não foi possível carregar essa imagem.');
      }
    });
  }
function abrirModalGerador() {
    const intro = document.getElementById('introScreen');
    if (intro && !intro.classList.contains('hidden')) {
      intro.classList.add('hidden');
      window.location.hash = '#catalogo';
    }
    modal.classList.add('active');
    document.body.classList.add('menu-open');
    desenharCanvasCompleto(true);
  }

  function fecharModalGerador() {
    modal.classList.remove('active');
    document.body.classList.remove('menu-open');
  }


  if (btnOpenIntro) btnOpenIntro.addEventListener('click', abrirModalGerador);
  if (btnOpenCatalog) btnOpenCatalog.addEventListener('click', abrirModalGerador);
  if (btnClose) btnClose.addEventListener('click', fecharModalGerador);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModalGerador();
  });
if (btnGerar) {
    btnGerar.addEventListener('click', () => {
      // Se o usuário digitou algo no input mas esqueceu de clicar em "+ Adicionar", inclui automaticamente
      if (inputSingleText && inputSingleText.value.trim()) {
        adicionarNovoTexto();
      }

      if (!editorState.img && editorState.textos.length === 0) {
        mostrarToast('Envie uma foto ou adicione um texto para gerar!');
        return;
      }

      // Renderiza sem a caixa pontilhada e sem o botão (X) antes de exportar a figurinha final
      desenharCanvasCompleto(false);
      const dataUrlWebp = canvas.toDataURL('image/webp', 0.75);
      salvarNovaFiguraGerada(dataUrlWebp);

      // Reseta estado para a próxima criação
      editorState.img = null;
      editorState.imgX = SIZE / 2;
      editorState.imgY = SIZE / 2;
      editorState.imgZoom = 1;
      editorState.textos = [];
      editorState.textoSelecionadoId = null;

      if (inputSingleText) inputSingleText.value = '';
      if (inputUpload) inputUpload.value = '';
      if (zoomSlider) zoomSlider.value = '1';
      if (uploadLabel) uploadLabel.textContent = 'Escolher uma Imagem';

      fecharModalGerador();
      mostrarToast('Figurinha gerada! Clique nela no quadro acima para copiar.');
    });
  }

}





























