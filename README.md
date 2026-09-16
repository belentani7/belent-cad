# BELENT CAD

**Ferramenta CAD de código aberto para arquitetos — digitalização de esboços em papel para modelos 3D, renders fotorrealistas e banco de normas.**

> PT → ES → EN. Herramienta CAD de código abierto para arquitectos — digitalización de bocetos en papel a modelos 3D, renders fotorrealistas y banco de estándares.

[![CI](https://github.com/belentani7/belent-cad/actions/workflows/ci.yml/badge.svg)](https://github.com/belentani7/belent-cad/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/belentani7/belent-cad/actions/workflows/pages.yml/badge.svg)](https://github.com/belentani7/belent-cad/actions/workflows/pages.yml)

## Live

| Surface | URL |
|---|---|
| GitHub Pages (web app) | https://belentani7.github.io/belent-cad/ |
| Repository | https://github.com/belentani7/belent-cad |

## O que é

BELENT CAD reúne um estúdio arquitetônico completo no navegador:

- **Editor CAD 2D** com camadas, orto, snap, cotas e bloco de símbolos.
- **Maqueta 3D** interativa (Three.js) com corte, óptica de câmera e iluminação fotométrica.
- **Boceto → 3D**: digitaliza desenhos em papel (canvas/branco ou upload) e os converte em planta vetorial.
- **Estúdio fotorrealista** com presets de luz, materiais e comparação antes/depois.
- **Lâminas ISO 5457 / NBR 6492** com carimbo, quadro de áreas e exportação SVG/PDF.
- **Auditoria CTE / NBR**: verificação de ventilação, acessibilidade e clash detection (BIM health score).
- **Exportadores**: DXF (AC1015), IFC (Open BIM 2x3), OBJ, SVG.
- **Banco de normas e ferramentas open source** curado.

## Arquitetura

SPA em **React 19 + Vite 6 + TypeScript + Tailwind 4 + Three.js**, com um servidor
**Express** opcional (`server.ts`) que faz proxy do Google Gemini para as funções de
IA. **O servidor é opcional**: o build estático inclui um motor paramétrico
determinista offline, de modo que a app funciona 100% sem backend.

```
src/
  components/   UI (editor 2D, viewer 3D, inspetores, TUI)
  services/     motores: IA, comandos, exportadores, análise
  types/        modelo de dados CAD
server.ts       API opcional (Gemini) — não requerida para o build estático
python/         banco de dados de normas/materiais (Python, stdlib)
mcp/            servidor MCP (Model Context Protocol) para agentes
```

## Desenvolvimento local

```bash
npm install
npm run dev          # dev com servidor Express + Vite
npm run build:web    # build estático (dist/)
npm run lint         # typecheck (tsc --noEmit)
npm run build        # build web + bundle do servidor
```

### Variáveis de ambiente (opcional)

Copie `.env.example` para `.env.local`:

```
GEMINI_API_KEY="sua_chave"
GEMINI_MODEL="gemini-2.5-flash"
```

Sem chave, a app usa o motor paramétrico local.

## Auditoria de segurança

Este repositório passou por revisão e correção (pipeline recon → audit → fix →
secrets → GitHub → deploy):

- **Corrigido (CRITICO)**: injeção/XSS no gerador de lâminas
  (`document.write` com valores não escapados) — agora todo valor é XML-escapado
  e os identificadores de arquivo são sanitizados.
- **Corrigido (CRITICO)**: comandos de navegação (`/RENDER`, `/PLUGINS`,
  `CONVERT`) deixavam o viewport em branco — agora abrem o painel correto, com
  fallback para o editor 2D.
- **Corrigido (ALTO)**: `exportToDXF` chamado com argumentos trocados; prop
  obrigatória ausente em `DocumentationEngine` — o typecheck voltou a passar.
- **Corrigido (ALTO)**: payloads das rotas API limitados (10 MB), `imageBase64`
  com verificação de tamanho, `req.body` protegido, handler de erro global sem
  vazar detalhes internos, `unhandledRejection` tratado.
- **Corrigido (ALTO)**: nome de modelo inválido (`gemini-3.8-flash`) →
  `gemini-2.5-flash` (configurável).
- **Corrigido (ALTO)**: chamadas `fetch('/api/*')` sem verificação de `res.ok`
  falhavam em silêncio num host estático — agora degradam para o motor local.
- **Deploy**: `base: './'`, `404.html` (SPA fallback) e `.nojekyll` para Pages.
- **Segredos**: varredura com `gitleaks` — `no leaks found`. Nenhuma chave no
  cliente.

## Licença

MIT. Ver [SECURITY.md](./SECURITY.md) para reporte de vulnerabilidades.

---

Autor: **Pedro Belentani**
