/**
 * Configuração e ponte de armazenamento de mídia via CDN
 * 
 * ATUALIZAÇÃO 13-11-2026
 * IMPORTANTE TODA VEZ QUE SUBIR FIGURAS MUDAR ESSE NUMERO  v1.0.0
 * 
 * GitHub (Arquivos): Suba as novas imagens (.webp/.gif) nas pastas das categorias em kbs93/BOXFIGURAS.

GitHub (Versão): Em Lançamentos, crie e publique uma nova etiqueta (ex: v1.0.1).

figurinhas.json: Adicione os caminhos das novas imagens nas respectivas categorias.

storageConfig.js: Altere o final da URL para a nova etiqueta (ex: /v1.0.1).
 * 
 * 
 */

export const CDN_REPO_URL = 'https://raw.githubusercontent.com/kbs93/BOXFIGURAS/v1.0.0';

export function obterUrlFigurinha(caminhoCompleto) {
  if (!caminhoCompleto) return '';
  const partes = String(caminhoCompleto).trim().split('/');
  return `${CDN_REPO_URL}/${partes.map(p => encodeURIComponent(p)).join('/')}`;
}