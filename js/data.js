// ARRAYS INDIVIDUAIS POR CATEGORIA
export const memes = ["d10", "d17", "d25", "d33", "d3", "d5", "d7",];
export const bomDia = ["d11", "d21", "d28", "d35"];
export const boaTarde = ["boa",];
export const boaNoite= ["boanoite"];
export const reacoes = ["d4", "d13", "d14", "d15", "d20", "d23"];
export const humor = ["d8", "d9", "d19", "d22", "d30", "d38"];
export const animais = ["d24", "d40"];
export const triste = ["d1", "d6", "d12", "d27", "d39"];
export const feliz = ["d2", "d3", "d5", ];
export const times = ["d32"];
export const cachorro = ["d24"];
export const gato = ["d40"];
export const politica = ["d41"];
export const religiao = ["d16", "d18", "d29", "d42"];

// MAPEAMENTO DIRETO COM O data-category DO HTML
export const categoriasMap = {
  "memes": memes,
  "bom-dia": bomDia,
  "boa-tarde":boaTarde,
   "boa-noite":boaNoite,
  "reacoes": reacoes,
  "humor": humor,
  "animais": animais,
  "triste": triste,
  "feliz": feliz,
  "times": times,
  "cachorro": cachorro,
  "gato": gato,
  "politica": politica,
  "religiao": religiao
};

// GERA ARRAY DE TODOS AUTOMATICAMENTE SEM DUPLICADOS
const todosSet = new Set();
Object.values(categoriasMap).forEach(arr => arr.forEach(nome => todosSet.add(nome)));
export const todos = Array.from(todosSet);
categoriasMap["todos"] = todos;

// Fallback visual SVG caso o arquivo webp real ainda não esteja na pasta local
export function gerarFallback(nome) {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'><rect width='512' height='512' fill='%23ffffff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='80'>🖼️</text><text x='50%' y='70%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='32' fill='%23111111'>${nome}.webp</text></svg>`;
}