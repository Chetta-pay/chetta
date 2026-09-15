---
title: "MCP Gateway"
---

The **ChettaPay MCP Gateway** lets AI agents and other programmatic clients read and manage your ChettaPay applications over the [Model Context Protocol](https://modelcontextprotocol.io) (MCP). It is a curated, scoped surface in front of the ChettaPay API — built for tools like Claude Code, Claude Desktop, Cursor, and any MCP-capable client.

**Endpoint:** `https://chettapay-mcp.vercel.app/mcp` (Streamable HTTP)

**Authentication:** a **Personal Access Token** (`pat_…`) sent as `Authorization: Bearer pat_…`. The token's scopes decide what the agent can do; a request without a token is rejected.

---

## Get a Personal Access Token

Personal Access Tokens (PATs) are **account-level** credentials — they belong to you, not to a single app, and can cover all of your apps or a chosen subset.

1. In the dashboard, open **Account → Personal Access Tokens**.
2. Click **Create token** and give it a **name**.
3. Pick its **scopes** (see below) — or toggle **Full access** for all scopes.
4. (Optional) Restrict it to **specific applications**. Left unrestricted, it covers every app you own.
5. (Optional) Set an **expiry date**.
6. Copy the token (`pat_…`) immediately — it is shown only once.

Revoke a token anytime from the same screen; any client using it loses access immediately.

### Scopes

A token grants `resource:action` permissions. A tool fails with `403` if the token lacks the scope it needs, so grant the **least** a client requires — a read-only research agent only needs the `:read` scopes; a provisioning agent needs the matching `:write` scopes.

| Scope | Grants |
|---|---|
| `applications:read` / `:write` | Read apps; create apps; edit allowed domains |
| `api_keys:read` / `:write` | List API keys; create publishable/secret keys |
| `wallets:read` / `:write` | Read wallets & balances; fund wallets |
| `assets:read` / `:write` | Read assets; enable trustlines |
| `transactions:read` | Read transaction history |
| `users:read` | Read SDK end-users |
| `distribution:read` / `:write` | Read and create token-distribution rules |

> Selecting **Full access** (`*`) grants every scope. The dashboard also exposes a few additional resource scopes for related dashboard features.

---

## Tools

Each tool maps to a ChettaPay API operation and requires the matching scope on your token.

### Read

| Tool | Arguments | Returns |
|---|---|---|
| `list_applications` | — | Applications the token can access |
| `get_application` | `id` | App detail (network, wallets, settings) |
| `get_application_wallets` | `id` | App + end-user wallets |
| `get_wallet_balances` | `id`, `publicKey` | On-chain balances for a wallet |
| `get_application_transactions` | `id`, `limit?`, `offset?` | Transaction history (paginated) |
| `get_application_users` | `id`, `limit?`, `offset?` | SDK end-users (paginated) |

Reads require the matching `:read` scope (e.g. `wallets:read`).

### Write

| Tool | Arguments | Scope |
|---|---|---|
| `create_application` | `name` | `applications:write` |
| `create_api_key` | `id`, `name`, `type?`, `allow_native_clients?`, `expires_at?` | `api_keys:write` |
| `enable_asset` | `id`, `code`, `issuer`, `name` | `assets:write` |
| `create_distribution_rule` | `id`, `assetId`, `name`, `amountPerUser`, `maxClaims`, `period`, … | `distribution:write` |
| `fund_testnet_wallet` | `id`, `publicKey` | `wallets:write` |

`fund_testnet_wallet` tops up a wallet via the Stellar **testnet** friendbot — typically the app's funding (global) wallet. Get the public key from `get_application_wallets` first.

### Edit

| Tool | Arguments | Scope |
|---|---|---|
| `update_application_domains` | `id`, `allowed_origins` | `applications:write` |

`update_application_domains` **replaces** the app's entire allowed-origins (CORS) list, so pass the full set you want to keep — not just additions.

### Helpers

These combine several reads (and, where noted, a conditional write) into one answer.

| Tool | Arguments | Does |
|---|---|---|
| `get_application_wallet_by_role` | `id`, `role?` | Resolve a wallet by role (GLOBAL / FUNDING / GAS / DISTRIBUTION) and report whether it is funded |
| `ensure_wallet_funded` | `id`, `role?` | Fund the role's wallet via the testnet friendbot **only if** it is not already funded (mainnet wallets are reported, not funded) |
| `check_application_readiness` | `id` | Evaluate the dashboard "Get started" config steps (API keys, domains, app-wallet funding, trustlines) and report whether the app is ready to use |

`role` defaults to `GLOBAL`; use `FUNDING` / `GAS` / `DISTRIBUTION` once an app has split wallets. "Funded" means the wallet's account exists on Stellar — for exact balances call `get_wallet_balances`.

---

## Confirmation behavior

Clients that support MCP tool annotations use them to decide when to prompt:

- **Reads and creates run automatically** (including `fund_testnet_wallet` and `ensure_wallet_funded`, which are harmless idempotent testnet top-ups).
- **Edits that overwrite existing state** — currently `update_application_domains` — **prompt for confirmation** before running.

---

## Connect a client

Replace `pat_…` with your token in every example.

**Claude Code**

```bash
claude mcp add --transport http chettapay https://chettapay-mcp.vercel.app/mcp --header "Authorization: Bearer pat_…"

claude mcp get chettapay   # verify it was installed
```

**Claude Desktop / Cursor / Windsurf / Cline** — add a `mcpServers` entry (config files: Claude Desktop `claude_desktop_config.json`, Cursor `~/.cursor/mcp.json`, Windsurf `~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "chettapay": {
      "type": "http",
      "url": "https://chettapay-mcp.vercel.app/mcp",
      "headers": { "Authorization": "Bearer pat_…" }
    }
  }
}
```

**VS Code (GitHub Copilot)** — add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "chettapay": {
      "type": "http",
      "url": "https://chettapay-mcp.vercel.app/mcp",
      "headers": { "Authorization": "Bearer pat_…" }
    }
  }
}
```

**Clients that only support stdio** — bridge to the HTTP endpoint with `mcp-remote`:

```json
{
  "mcpServers": {
    "chettapay": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://chettapay-mcp.vercel.app/mcp", "--header", "Authorization: Bearer pat_…"]
    }
  }
}
```

After editing the config, restart the client. Once connected it should list the ChettaPay tools (`list_applications`, `get_application`, …).

---

## Example prompts

With the gateway connected, you can ask an agent things like:

- *"List my ChettaPay apps and tell me which ones are ready to use."* → `list_applications` + `check_application_readiness`
- *"Fund the testnet global wallet for app `…` if it isn't funded yet."* → `ensure_wallet_funded`
- *"Add `http://localhost:3000` to app `…`'s allowed domains."* → `update_application_domains` (the client confirms first)
- *"Create a publishable API key for app `…`."* → `create_api_key`

---

## Security

- A PAT is as sensitive as a password — never commit it to version control; store it in your client's secret config.
- Grant the minimum scopes a client needs, and restrict the token to specific apps when possible.
- Set an expiry for short-lived or shared tokens, and revoke any token you suspect is exposed from **Account → Personal Access Tokens**.
