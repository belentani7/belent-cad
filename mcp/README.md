# BELENT CAD — MCP server

Servidor [Model Context Protocol](https://modelcontextprotocol.io) que expõe o
banco de dados do BELENT CAD e o motor paramétrico de plantas a qualquer agente
(Claude, OpenCode, Cursor...).

## Instalar

```bash
pip install -r requirements.txt
```

## Executar

```bash
python belent_cad_mcp.py        # transporte stdio (padrão)
```

## Registar no cliente MCP

```json
{
  "mcpServers": {
    "belent-cad": {
      "command": "python",
      "args": ["C:/caminho/para/belent-cad/mcp/belent_cad_mcp.py"]
    }
  }
}
```

## Ferramentas

| Tool | Descrição |
|---|---|
| `bank_search(term, limit?)` | Busca materiais, normas, blocos e estilos (PT/ES/EN) |
| `list_norms(domain?)` | Lista normas por domínio: `ES`, `BR`, `INTL` |
| `generate_floorplan(width_m?, depth_m?, rooms?)` | Gera planta paramétrica determinística |

Sem chaves de API e sem rede: usa o banco local (`python/belent_bank`).
