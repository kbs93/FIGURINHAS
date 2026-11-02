package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

type PayloadSalvar struct {
	Categorias map[string][]string `json:"categorias"`
}

func main() {
	porta := ":8080"
	pastaImagens := "figurinhas"

	// Servir as imagens da pasta figurinhas
	http.Handle("/figurinhas/", http.StripPrefix("/figurinhas/", http.FileServer(http.Dir(pastaImagens))))

	// Servir a interface visual
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "painel.html")
	})

	// Listar arquivos soltos da pasta figurinhas
	http.HandleFunc("/api/arquivos", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		entradas, err := os.ReadDir(pastaImagens)
		if err != nil {
			http.Error(w, "Erro ao ler pasta", http.StatusInternalServerError)
			return
		}

		var arquivos []string
		for _, e := range entradas {
			if !e.IsDir() {
				ext := strings.ToLower(filepath.Ext(e.Name()))
				if ext == ".webp" || ext == ".gif" || ext == ".png" {
					arquivos = append(arquivos, e.Name())
				}
			}
		}
		json.NewEncoder(w).Encode(arquivos)
	})

	// Ler dados existentes do js/data.js
	http.HandleFunc("/api/carregar", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		conteudo, err := os.ReadFile(filepath.Join("js", "data.js"))
		if err != nil {
			json.NewEncoder(w).Encode(map[string][]string{})
			return
		}

		mapa := lerCategoriasAtuais(string(conteudo))
		json.NewEncoder(w).Encode(mapa)
	})

	// Salvar de volta no js/data.js
	http.HandleFunc("/api/salvar", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Metodo invalido", http.StatusMethodNotAllowed)
			return
		}

		var dados PayloadSalvar
		if err := json.NewDecoder(r.Body).Decode(&dados); err != nil {
			http.Error(w, "JSON invalido", http.StatusBadRequest)
			return
		}

		if err := atualizarDataJS(dados.Categorias); err != nil {
			http.Error(w, "Erro ao gravar data.js", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"sucesso":true}`))
	})

	fmt.Printf("Painel de Organizacao: http://localhost%s\n", porta)
	abrirNavegador(fmt.Sprintf("http://localhost%s", porta))

	if err := http.ListenAndServe(porta, nil); err != nil {
		fmt.Printf("Erro: %v\n", err)
	}
}

func lerCategoriasAtuais(conteudo string) map[string][]string {
	resultado := make(map[string][]string)
	linhas := strings.Split(conteudo, "\n")
	for _, linha := range linhas {
		linha = strings.TrimSpace(linha)
		if strings.HasPrefix(linha, "export const ") && strings.Contains(linha, "=") && strings.Contains(linha, "[") {
			partes := strings.SplitN(linha, "=", 2)
			nomeVar := strings.TrimSpace(strings.TrimPrefix(partes[0], "export const "))
			if nomeVar == "categoriasMap" || nomeVar == "todos" {
				continue
			}

			val := strings.TrimSpace(partes[1])
			val = strings.TrimPrefix(val, "[")
			val = strings.TrimSuffix(val, "];")
			val = strings.TrimSuffix(val, "]")

			elementos := strings.Split(val, ",")
			var itens []string
			for _, item := range elementos {
				item = strings.TrimSpace(item)
				item = strings.Trim(item, `"'`)
				if item != "" {
					itens = append(itens, item)
				}
			}
			resultado[nomeVar] = itens
		}
	}
	return resultado
}

func atualizarDataJS(catMap map[string][]string) error {
	var sb strings.Builder

	ordem := []struct {
		ChaveHTML string
		VarJS     string
	}{
		{"memes", "memes"},
		{"bom-dia", "bomDia"},
		{"boa-tarde", "boaTarde"},
		{"boa-noite", "boaNoite"},
		{"reacoes", "reacoes"},
		{"humor", "humor"},
		{"animais", "animais"},
		{"triste", "triste"},
		{"feliz", "feliz"},
		{"times", "times"},
		{"cachorro", "cachorro"},
		{"gato", "gato"},
		{"politica", "politica"},
		{"religiao", "religiao"},
	}

	sb.WriteString("// ARRAYS INDIVIDUAIS POR CATEGORIA\n")
	for _, item := range ordem {
		lista := catMap[item.ChaveHTML]
		sb.WriteString(fmt.Sprintf("export const %s = [", item.VarJS))
		for i, n := range lista {
			sb.WriteString(fmt.Sprintf("%q", n))
			if i < len(lista)-1 {
				sb.WriteString(", ")
			}
		}
		sb.WriteString("];\n")
	}

	sb.WriteString("\n// MAPEAMENTO DIRETO COM O data-category DO HTML\n")
	sb.WriteString("export const categoriasMap = {\n")
	for _, item := range ordem {
		sb.WriteString(fmt.Sprintf("  %q: %s,\n", item.ChaveHTML, item.VarJS))
	}
	sb.WriteString("};\n\n")

	sb.WriteString("// GERA ARRAY DE TODOS AUTOMATICAMENTE SEM DUPLICADOS\n")
	sb.WriteString("const todosSet = new Set();\n")
	sb.WriteString("Object.values(categoriasMap).forEach(arr => arr.forEach(nome => todosSet.add(nome)));\n")
	sb.WriteString("export const todos = Array.from(todosSet);\n")
	sb.WriteString("categoriasMap[\"todos\"] = todos;\n\n")

	sb.WriteString("// Fallback visual SVG caso o arquivo webp real ainda nao esteja na pasta local\n")
	sb.WriteString("export function gerarFallback(nome) {\n")
	sb.WriteString("  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'><rect width='512' height='512' fill='%23ffffff'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='80'>🖼️</text><text x='50%' y='70%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='32' fill='%23111111'>${nome}.webp</text></svg>`;\n")
	sb.WriteString("}\n")

	return os.WriteFile(filepath.Join("js", "data.js"), []byte(sb.String()), 0644)
}

func abrirNavegador(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}
