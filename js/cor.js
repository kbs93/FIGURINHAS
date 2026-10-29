/**
 * Seletor de cores customizado e independente
 */
export class CustomColorPicker {
  constructor({ triggerId, previewId, labelId, initialColor = '#ffffff', onChange }) {
    this.trigger = document.getElementById(triggerId);
    this.preview = document.getElementById(previewId);
    this.label = document.getElementById(labelId);
    this.color = initialColor;
    this.onChange = onChange;

    this.palette = [
      '#ffffff', '#000000', '#ffeb3b', '#ff5722', 
      '#00d592', '#00e5ff', '#e91e63', '#9c27b0'
    ];

    this.popup = null;
    this.init();
  }

  init() {
    this.atualizarVisual(this.color);
    this.criarPopup();

    if (this.trigger) {
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target) && e.target !== this.trigger) {
        this.fechar();
      }
    });
  }


  criarPopup() {
    this.popup = document.createElement('div');
    this.popup.className = 'custom-color-popup hidden';

    const grid = document.createElement('div');
    grid.className = 'color-palette-grid';

    this.palette.forEach(hex => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'palette-swatch';
      swatch.style.backgroundColor = hex;
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setColor(hex);
        this.fechar();
      });
      grid.appendChild(swatch);
    });

    this.popup.appendChild(grid);
    document.body.appendChild(this.popup);
  }

  setColor(hex) {
    this.color = hex;
    this.atualizarVisual(hex);
    if (this.onChange) this.onChange(hex);
  }

  atualizarVisual(hex) {
    if (this.preview) this.preview.style.backgroundColor = hex;
    if (this.label) this.label.textContent = hex.toUpperCase();
  }

  toggle() {
    if (!this.popup) return;
    if (this.popup.classList.contains('hidden')) {
      this.abrir();
    } else {
      this.fechar();
    }
  }

  abrir() {
    document.querySelectorAll('.custom-color-popup').forEach(p => p.classList.add('hidden'));
    const rect = this.trigger.getBoundingClientRect();
    this.popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
    this.popup.style.left = `${rect.left + window.scrollX}px`;
    this.popup.classList.remove('hidden');
  }

  fechar() {
    if (this.popup) this.popup.classList.add('hidden');
  }
}