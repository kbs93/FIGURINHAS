/**
 * js/intro.js
 * Injeta e anima as figurinhas uma por uma dentro da caixa original do projeto
 */
// Figurinhas exclusivas para o efeito 3D da caixa
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

  // Inicia a animação das figurinhas entrando na caixa original
  iniciarAnimacaoFigurinhasNaCaixa();
}

function iniciarAnimacaoFigurinhasNaCaixa() {
  // Pega a caixa 3D original que já está no seu HTML
  const containerCaixa = document.querySelector('.box-stickers-stream');
  if (!containerCaixa) return;

const listaFigurinhas = listaAnimacao;
if (listaFigurinhas.length === 0) return;
// Cria um contêiner dentro da caixa para receber as figurinhas no mesmo espaço 3D
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

 let index = 0;
function criarFigurinhaItem(ladoClasse) {
    const nome = listaFigurinhas[index % listaFigurinhas.length];
    index++;

    const img = document.createElement('img');
    img.src = `animacao/${nome}`;
    img.className = `box-sticker-item ${ladoClasse}`;

    img.addEventListener('animationend', () => {
      img.remove();
    });

    spawnLayer.appendChild(img);
  }
// Dispara as 3 fileiras de forma alternada e espaçada
  function soltarTresFileirasAlternadas() {
    // 1. Solta a da Esquerda imediatamente
    criarFigurinhaItem('side-left');

    // 2. Solta a do Centro 250ms depois
    setTimeout(() => {
      criarFigurinhaItem('side-center');
    }, 750);

    // 3. Solta a da Direita 500ms depois
    setTimeout(() => {
      criarFigurinhaItem('side-right');
    }, 300);
  }

  // Espera a caixa cair e abrir as 4 abas (1.2s) para começar o ciclo contínuo
  setTimeout(() => {
    soltarTresFileirasAlternadas();

    // Repete o ciclo alternado continuamente
    setInterval(() => {
      soltarTresFileirasAlternadas();
    }, 750);
  }, 1200);

}