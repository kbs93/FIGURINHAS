/**
 * js/intro.js
 * Injeta e anima as figurinhas uma por uma dentro da caixa original do projeto
 */
const listaAnimacao = [
  "1.webp",
  "2.webp",
  "3.webp",
  "4.webp",
  "5.webp",
  "6.webp",
  "7.webp",
  "8.webp",
  "9.webp",
  "10.webp",
  "11.webp",
  "12.webp",
  "13.webp",
  "14.webp",
  "15.webp",
  "16.webp",
  "17.webp",
  "18.webp",
  "19.webp",
  "20.webp",
  "21.webp",
  "22.webp",
  "23.webp",
  "24.webp",
  "25.webp",
  "26.webp",
  "27.webp",
  "28.webp",
  "29.webp",
  "30.webp",
  "31.webp",
  "32.webp",
  "33.webp",
  "34.webp",
  "35.webp",
  
  
];

export function inicializarApresentacao() {
  const intro = document.getElementById('introScreen');
  const btnStart = document.getElementById('btnIntroStart');
  const btnReturnMobile = document.getElementById('btnReturnHomeMobile');

  if (!intro) return;

  function fecharPaineisMobile() {
    const panel = document.getElementById('splitLeftPanel');
    const overlay = document.getElementById('navOverlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.classList.remove('menu-open');
  }

  function mostrarApresentacao() {
    fecharPaineisMobile();
    intro.classList.remove('hidden');
  }

  function ocultarApresentacao() {
    fecharPaineisMobile();
    intro.classList.add('hidden');
  }

  function entrarNoPainel() {
    ocultarApresentacao();
    history.pushState({ tela: 'catalogo' }, '', '#catalogo');
  }

  if (btnStart) btnStart.addEventListener('click', entrarNoPainel);
  if (btnReturnMobile) {
    btnReturnMobile.addEventListener('click', () => {
      if (location.hash === '#catalogo') history.back();
      else mostrarApresentacao();
    });
  }

  window.addEventListener('popstate', () => {
    if (location.hash === '#catalogo') ocultarApresentacao();
    else mostrarApresentacao();
  });

  if (location.hash === '#catalogo') {
    ocultarApresentacao();
  } else {
    mostrarApresentacao();
    history.replaceState({ tela: 'apresentacao' }, '', window.location.pathname);
  }

  iniciarAnimacaoFigurinhasNaCaixa();
}

function iniciarAnimacaoFigurinhasNaCaixa() {
  const containerCaixa = document.querySelector('.box-stickers-stream');
  if (!containerCaixa) return;

  let spawnLayer = containerCaixa.querySelector('.stickers-3d-stream');
  if (!spawnLayer) {
    spawnLayer = document.createElement('div');
    spawnLayer.className = 'stickers-3d-stream';
    spawnLayer.style.position = 'absolute';
    spawnLayer.style.top = '0';
    spawnLayer.style.left = '0';
    spawnLayer.style.width = '100%';
    spawnLayer.style.height = '100%';
    spawnLayer.style.transformStyle = 'preserve-3d';
    spawnLayer.style.pointerEvents = 'none';
    containerCaixa.appendChild(spawnLayer);
  }

  let indexAtual = 0;
  const lados = ['side-left', 'side-center', 'side-right'];
  let ladoIndex = 0;

  function lancarProximaFigurinha() {
    const nomeFigura = listaAnimacao[indexAtual];
    const ladoClasse = lados[ladoIndex % 3];

    // Cria e injeta imediatamente no DOM
    const img = document.createElement('img');
    img.className = `box-sticker-item ${ladoClasse}`;
    img.src = `animacao/${nomeFigura}`;

    // Remove do DOM assim que a animação CSS terminar
    img.addEventListener('animationend', () => {
      img.remove();
    });

    spawnLayer.appendChild(img);

    // Avança para o próximo lado (esquerda -> centro -> direita)
    ladoIndex++;

    // Avança estritamente para a próxima figura de 1 a 30
    indexAtual++;
    if (indexAtual >= listaAnimacao.length) {
      indexAtual = 0; // Só recomeça na 1 depois de rodar as 30
    }
  }

  // Espera a caixa cair e abrir (1.2s) e solta 1 figurinha por vez a cada 320ms
  setTimeout(() => {
    lancarProximaFigurinha();
    setInterval(lancarProximaFigurinha, 320);
  }, 1200);
}