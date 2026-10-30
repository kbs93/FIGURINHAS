/**
 * js/intro.js
 * Injeta e anima as figurinhas uma por uma dentro da caixa original do projeto
 */
import { categoriasMap } from './data.js';

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

  const listaFigurinhas = categoriasMap['todos'] || [];
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
    img.src = `figurinhas/${nome}.webp`;
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
    }, 250);

    // 3. Solta a da Direita 500ms depois
    setTimeout(() => {
      criarFigurinhaItem('side-right');
    }, 500);
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