// js/paginacao.js - Gerenciador de paginação dinâmica com botão Ver Mais
const LIMITE_MOBILE = 50;
const LIMITE_DESKTOP = 78;
const LIMITE_PACOTES = 30;

export const Paginador = {
  paginaAtual: 1,
  itensCarregados: 0,
  listaCompleta: [],
  callbackRender: null,
  modoAtual: 'figuras',


modoAtual: 'pacotes',

  obterLimiteFiguras() {
    return window.innerWidth <= 950 ? LIMITE_MOBILE : LIMITE_DESKTOP;
  },

  iniciar(callbackRender) {
    this.callbackRender = callbackRender;
    this.vincularBotoes();
  },

  configurarModo(modo) {
    if (this.modoAtual !== modo) {
      this.modoAtual = modo;
      this.resetar();
    }
  },

  resetar() {
    this.paginaAtual = 1;
    this.itensCarregados = (this.modoAtual === 'pacotes') 
      ? LIMITE_PACOTES 
      : this.obterLimiteFiguras();
  },

  definirLista(lista) {
    this.listaCompleta = lista || [];
    const limite = (this.modoAtual === 'pacotes') 
      ? LIMITE_PACOTES 
      : this.obterLimiteFiguras();
      
    if (!this.itensCarregados || this.itensCarregados === 0) {
      this.itensCarregados = limite;
    }
  },
  obterFatia() {
    const total = this.listaCompleta.length;

    // Modo Pacotes da Vitrine (Páginas normais)
    if (this.modoAtual === 'pacotes') {
      const limite = LIMITE_PACOTES;
      const totalPaginas = Math.max(1, Math.ceil(total / limite));
      const indiceInicio = (this.paginaAtual - 1) * limite;
      const indiceFim = Math.min(indiceInicio + limite, total);

      return {
        itens: this.listaCompleta.slice(indiceInicio, indiceFim),
        inicio: total === 0 ? 0 : indiceInicio + 1,
        fim: indiceFim,
        total: total,
        pagina: this.paginaAtual,
        totalPaginas: totalPaginas
      };
    }

    // Modo Figuras (Carregamento acumulativo: 50 móvel / 78 desktop)
    const fim = Math.min(this.itensCarregados, total);
    return {
      itens: this.listaCompleta.slice(0, fim),
      inicio: total === 0 ? 0 : 1,
      fim: fim,
      total: total,
      pagina: 1,
      totalPaginas: 1
    };
  },

  carregarMais() {
    const total = this.listaCompleta.length;
    const passo = this.obterLimiteFiguras();
    if (this.itensCarregados < total) {
      this.itensCarregados = Math.min(this.itensCarregados + passo, total);
      if (this.callbackRender) this.callbackRender();
    }
  },


atualizarInterfaceControles() {
    const pageNav = document.getElementById('pageNavControls');
    const pageNavInfo = document.getElementById('pageNavInfo');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const btnLoadMore = document.getElementById('btnLoadMoreStickers');
    const paginationBar = document.getElementById('paginationControls');

    const total = this.listaCompleta.length;

    // Se a lista estiver vazia (0 figuras encontradas), esconde tudo
    if (total === 0) {
      if (pageNav) pageNav.style.setProperty('display', 'none');
      if (btnLoadMore) btnLoadMore.style.setProperty('display', 'none');
      if (paginationBar) paginationBar.style.setProperty('display', 'none');
      return;
    }

    // MODO VITRINE DE PACOTES
    if (this.modoAtual === 'pacotes') {
      if (btnLoadMore) btnLoadMore.style.setProperty('display', 'none');

      const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_PACOTES));
      if (totalPaginas <= 1) {
        if (paginationBar) paginationBar.style.setProperty('display', 'none');
        if (pageNav) pageNav.style.setProperty('display', 'none');
        return;
      }

      if (paginationBar) paginationBar.style.setProperty('display', 'flex');
      if (pageNav) pageNav.style.setProperty('display', 'flex');
      if (pageNavInfo) pageNavInfo.textContent = `Página ${this.paginaAtual} de ${totalPaginas}`;
      if (btnPrev) btnPrev.disabled = (this.paginaAtual === 1);
      if (btnNext) btnNext.disabled = (this.paginaAtual >= totalPaginas);
      return;
    }

    // MODO GRADE DE FIGURINHAS: Some com Anterior/Próxima e controla só o Carregar Mais
    if (pageNav) {
      pageNav.style.setProperty('display', 'none');
    }

    const temMaisFiguras = this.itensCarregados < total;
    if (btnLoadMore) {
      btnLoadMore.style.setProperty('display', temMaisFiguras ? 'inline-flex' : 'none');
      const restantes = total - this.itensCarregados;
      btnLoadMore.innerHTML = `<i class="bi bi-plus-circle-fill"></i> Carregar Mais (${restantes})`;
    }

    if (paginationBar) {
      paginationBar.style.setProperty('display', temMaisFiguras ? 'flex' : 'none');
    }
  },






  vincularBotoes() {
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const btnLoadMore = document.getElementById('btnLoadMoreStickers');

    if (btnLoadMore) {
      btnLoadMore.onclick = () => {
        this.carregarMais();
      };
    }

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (this.paginaAtual > 1) {
          this.paginaAtual--;
          if (this.callbackRender) this.callbackRender();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        const totalPaginas = Math.ceil(this.listaCompleta.length / LIMITE_PACOTES);
        if (this.paginaAtual < totalPaginas) {
          this.paginaAtual++;
          if (this.callbackRender) this.callbackRender();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }
  }
};