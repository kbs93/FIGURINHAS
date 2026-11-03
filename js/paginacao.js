// js/paginacao.js - Gerenciador de paginação até 200 figuras com rolagem interna
const LIMITE_PAGINA = 90; // Limite fixo de 200 figuras por página

export const Paginador = {
  paginaAtual: 1,
  limiteExibidoPagina1: LIMITE_PAGINA,
  listaCompleta: [],
  callbackRender: null,

  iniciar(callbackRender) {
    this.callbackRender = callbackRender;
    this.vincularBotoes();
  },

  resetar() {
    this.paginaAtual = 1;
    this.limiteExibidoPagina1 = LIMITE_PAGINA;
  },

  definirLista(lista) {
    this.listaCompleta = lista || [];
  },

  calcularTotalPaginas() {
    const total = this.listaCompleta.length;
    if (total === 0) return 1;
    return Math.ceil(total / LIMITE_PAGINA);
  },

obterFatia() {
    const total = this.listaCompleta.length;
    const totalPaginas = this.calcularTotalPaginas();
    const indiceInicio = (this.paginaAtual - 1) * LIMITE_PAGINA;
    const indiceFim = Math.min(indiceInicio + LIMITE_PAGINA, total);

    return {
      itens: this.listaCompleta.slice(indiceInicio, indiceFim),
      inicio: total === 0 ? 0 : indiceInicio + 1,
      fim: indiceFim,
      total: total,
      pagina: this.paginaAtual,
      totalPaginas: totalPaginas
    };
  },
  atualizarInterfaceControles() {
    const pageNav = document.getElementById('pageNavControls');
    const pageNavInfo = document.getElementById('pageNavInfo');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const btnLoadMore = document.getElementById('btnLoadMoreStickers');

    if (btnLoadMore) {
      btnLoadMore.style.display = 'none';
    }

    const totalPaginas = this.calcularTotalPaginas();

    // Garante que a barra com Anterior e Próxima fique SEMPRE visível
    if (pageNav) {
      pageNav.style.display = 'flex';
    }

    if (pageNavInfo) {
      pageNavInfo.textContent = `Página ${this.paginaAtual} de ${totalPaginas}`;
    }

    if (btnPrev) btnPrev.disabled = (this.paginaAtual === 1);
    if (btnNext) btnNext.disabled = (this.paginaAtual >= totalPaginas);
  },

  vincularBotoes() {
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (this.paginaAtual > 1) {
          this.paginaAtual--;
          if (this.callbackRender) this.callbackRender();
          this.rolarAoTopo();
        }
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        if (this.paginaAtual < this.calcularTotalPaginas()) {
          this.paginaAtual++;
          if (this.callbackRender) this.callbackRender();
          this.rolarAoTopo();
        }
      };
    }
  },

  rolarAoTopo() {
    const grid = document.getElementById('stickersGrid');
    if (grid) {
      grid.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};