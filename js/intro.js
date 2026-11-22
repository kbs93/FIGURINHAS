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

  let indexAtual = 0;
  const lados = ['side-left', 'side-center', 'side-right'];
  let ladoIndex = 0;
  let timerId = null;

  function lancarProximaFigurinha() {
    const intro = document.getElementById('introScreen');
    if (document.hidden || (intro && intro.classList.contains('hidden'))) {
      return;
    }

    const nomeFigura = listaAnimacao[indexAtual];
    const ladoClasse = lados[ladoIndex % 3];

const img = document.createElement('img');
    img.className = `box-sticker-item ${ladoClasse}`;
    img.src = `animacao/${nomeFigura}`;
    img.alt = "";
    img.setAttribute('aria-hidden', 'true');
    img.setAttribute('role', 'presentation');
    
    // Força aceleração e contexto 3D limpo no WebKit do iPhone
 img.style.display = 'block';

    function limparElemento() {
      img.removeEventListener('animationend', limparElemento);
      img.removeEventListener('webkitAnimationEnd', limparElemento);
      if (img.parentNode) {
        img.remove();
      }
    }

    img.addEventListener('animationend', limparElemento);
    img.addEventListener('webkitAnimationEnd', limparElemento);

    containerCaixa.appendChild(img);

    ladoIndex++;
    indexAtual++;
    if (indexAtual >= listaAnimacao.length) {
      indexAtual = 0;
    }
  }

  // Espera a caixa assentar e abre um intervalo suave de 600ms (ritmo estável para o iOS)
  setTimeout(() => {
    lancarProximaFigurinha();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(lancarProximaFigurinha, 600);
  }, 1200);
}