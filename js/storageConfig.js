/**
 * Configuração e ponte de armazenamento de mídia via CDN
 */

export const CDN_REPO_URL = 'https://cdn.jsdelivr.net/gh/kbs93/BOXFIGURAS@main';

export function obterUrlFigurinha(caminhoCompleto) {
  if (!caminhoCompleto) return '';
  const partes = String(caminhoCompleto).trim().split('/');
  return `${CDN_REPO_URL}/${partes.map(p => encodeURIComponent(p)).join('/')}`;
}