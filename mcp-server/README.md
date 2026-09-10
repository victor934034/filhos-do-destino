# filhos-do-destino-mcp-server

Servidor MCP que embrulha a [API pública do Filhos do Destino](../README.md#api-pública-para-integrações-mcp)
(`/api/mcp/*`) em tools — permite pedir em linguagem natural, num cliente MCP (Claude
Desktop, por exemplo), pra criar campanhas, monstros, itens e poderes na plataforma.

## O que isso NÃO é

Isso não é a API em si — a API já existe e funciona sozinha, chamada direto por HTTP
(`Authorization: Bearer <chave>`). Este servidor é só uma "ponte" que fala o protocolo
MCP na frente dela, pra um agente como o Claude poder usar essas rotas como tools.

## 1. Gerar uma chave de API

Em `/app/configuracoes` no site, seção "Chaves de API" → **Gerar nova chave**. Copie na
hora — ela só aparece uma vez.

Chaves de conta **admin** têm acesso completo (inclusive criar monstro/item/poder no
Bestiário/Compêndio público). Chaves de conta comum só conseguem: listar conteúdo
público, criar campanhas próprias e adicionar missões nelas.

## 2. Instalar e buildar

```bash
cd mcp-server
npm install
npm run build
```

## 3. Configurar no Claude Desktop

Edite o arquivo de configuração do Claude Desktop:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Adicione (ou junte, se já tiver outros servidores MCP configurados):

```json
{
  "mcpServers": {
    "filhos-do-destino": {
      "command": "node",
      "args": ["CAMINHO_COMPLETO/mcp-server/dist/index.js"],
      "env": {
        "FDD_API_KEY": "fdd_sua_chave_aqui",
        "FDD_BASE_URL": "https://filhos-do-destino.vercel.app"
      }
    }
  }
}
```

Troque `CAMINHO_COMPLETO` pelo caminho absoluto até a pasta `mcp-server` neste
repositório (ex.: `C:\\Users\\escola\\Documents\\filhos do destino\\mcp-server\\dist\\index.js`
no Windows, com barras duplas). `FDD_BASE_URL` é opcional — sem ela, aponta pra produção.

Reinicie o Claude Desktop. As tools `fdd_*` devem aparecer na lista de ferramentas
disponíveis (ícone de martelo/ferramentas na conversa).

## Tools disponíveis

| Tool | O que faz | Precisa de admin? |
|---|---|---|
| `fdd_get_me` | Identifica a chave (dono, se é admin) | Não |
| `fdd_list_campanhas` | Lista campanhas públicas | Não |
| `fdd_create_campanha` | Cria campanha (com missões iniciais, se quiser) | Não |
| `fdd_add_missao` | Adiciona missão a uma campanha sua | Não |
| `fdd_list_monstros` | Lista o Bestiário público | Não |
| `fdd_create_monstro` | Cria monstro no Bestiário público | **Sim** |
| `fdd_list_itens` | Lista o Compêndio de itens público | Não |
| `fdd_create_item` | Cria item no Compêndio público | **Sim** |
| `fdd_list_poderes` | Lista o Compêndio de poderes público | Não |
| `fdd_create_poder` | Cria poder no Compêndio público | **Sim** |

As tools marcadas "Sim" retornam erro 403 com chave de conta comum — isso é
intencional (ver commit "Restrict MCP monster/item/power creation to admin API keys"),
pra ninguém além de admins poluir o catálogo compartilhado que todo mundo vê.

## Desenvolvimento

```bash
npm run dev    # roda direto com tsx, sem precisar buildar antes
npm run build  # compila TypeScript -> dist/
```

Testar sem um cliente MCP completo: [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```
