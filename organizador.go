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

const (
	portaArquivo = ":8080"
	pastaImagens = "figurinhas"
)

func obterCaminhoJSON() string {
	if _, err := os.Stat(filepath.Join("js", "figurinhas.json")); err == nil {
		return filepath.Join("js", "figurinhas.json")
	}
	return "figurinhas.json"
}

func main() {
	http.Handle("/figurinhas/", http.StripPrefix("/figurinhas/", http.FileServer(http.Dir(pastaImagens))))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "painel.html")
	})

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

	http.HandleFunc("/api/carregar", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		caminho := obterCaminhoJSON()
		conteudo, err := os.ReadFile(caminho)
		if err != nil {
			json.NewEncoder(w).Encode(map[string][]string{})
			return
		}

		var mapa map[string][]string
		if err := json.Unmarshal(conteudo, &mapa); err != nil {
			json.NewEncoder(w).Encode(map[string][]string{})
			return
		}

		json.NewEncoder(w).Encode(mapa)
	})

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

		// Monta o arquivo com arrays em linha única
		conteudoFormatado := formatarJSONEmLinha(dados.Categorias)

		caminho := obterCaminhoJSON()
		if err := os.WriteFile(caminho, []byte(conteudoFormatado), 0644); err != nil {
			http.Error(w, "Erro ao gravar JSON", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"sucesso":true}`))
	})

	fmt.Printf("Painel de Organizacao: http://localhost%s\n", portaArquivo)
	abrirNavegador(fmt.Sprintf("http://localhost%s", portaArquivo))

	if err := http.ListenAndServe(portaArquivo, nil); err != nil {
		fmt.Printf("Erro: %v\n", err)
	}
}

func formatarJSONEmLinha(catMap map[string][]string) string {
	ordem := []string{
		"memes",
		"bom-dia",
		"boa-tarde",
		"boa-noite",
		"reacoes",
		"humor",
		"animais",
		"triste",
		"feliz",
		"times",
		"cachorro",
		"gato",
		"politica",
		"religiao",
	}

	const limitePorLinha = 50

	var sb strings.Builder
	sb.WriteString("{\n")

	for i, chave := range ordem {
		lista := catMap[chave]
		if lista == nil {
			lista = []string{}
		}

		if len(lista) == 0 {
			sb.WriteString(fmt.Sprintf("  %q: []", chave))
		} else if len(lista) <= limitePorLinha {
			// Até 50 itens: fica tudo numa única linha
			var itens []string
			for _, item := range lista {
				itens = append(itens, fmt.Sprintf("%q", item))
			}
			sb.WriteString(fmt.Sprintf("  %q: [%s]", chave, strings.Join(itens, ", ")))
		} else {
			// Mais de 50 itens: quebra em lotes de 50 por linha
			sb.WriteString(fmt.Sprintf("  %q: [\n", chave))
			for idx := 0; idx < len(lista); idx += limitePorLinha {
				fim := idx + limitePorLinha
				if fim > len(lista) {
					fim = len(lista)
				}

				var lote []string
				for _, item := range lista[idx:fim] {
					lote = append(lote, fmt.Sprintf("%q", item))
				}

				sb.WriteString("    ")
				sb.WriteString(strings.Join(lote, ", "))

				if fim < len(lista) {
					sb.WriteString(",\n")
				} else {
					sb.WriteString("\n")
				}
			}
			sb.WriteString("  ]")
		}

		if i < len(ordem)-1 {
			sb.WriteString(",")
		}
		sb.WriteString("\n")
	}

	sb.WriteString("}\n")
	return sb.String()
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
