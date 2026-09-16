# BELENT CAD — Python data bank

Banco de dados de materiais, normas e blocos de mobiliário para o BELENT CAD.
**Apenas biblioteca padrão do Python** (sem dependências) — SQLite + JSON.

## Uso

```bash
cd python
python belent_bank/bank.py build          # cria belent_cad.db a partir do seed.json
python belent_bank/bank.py search parquet # busca em PT/ES/EN
python belent_bank/bank.py norms ES       # normas por domínio (ES/BR/INTL)
python belent_bank/bank.py export bank.json
```

## Conteúdo (`belent_bank/seed.json`)

- **materials** — pisos, paredes, vídrio (PT/ES/EN + transmitância U).
- **standards** — CTE (ES), NBR 6492/9050/15575 (BR), ISO 5457 (INTL).
- **blocks** — mobiliário com dimensões em metros.
- **render_styles** — presets de iluminação/kevin por estilo.

Ordem de idiomas: **PT → ES → EN**.

O mesmo banco é exposto por agentes via [MCP](../mcp/README.md).
