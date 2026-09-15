---
title: "ChettaPay Server API"
---

REST API for backend operations. All endpoints require your **secret key** — never call these from client-side code.

**Base URL:** `https://chettapay-server-api.vercel.app` — all routes are versioned under `/v1`.

**Authentication:** pass your secret key in the `x-chettapay-api-key` header (not `Authorization`).

```bash
x-chettapay-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

Wallets are identified by their on-chain **public key** (`G…` address), not by an opaque id.

**Response envelope.** Every response is wrapped:

- Success: `{ "content": <data>, "code": "<SUCCESS_CODE>", "success": true }`
- Error: `{ "code": "<ERROR_CODE>", "success": false }` (plus any extra fields). The HTTP status carries the status; there is no `status` field in the body.

---

## Wallets

### `POST /v1/wallets/fund`

Funds a custodial wallet on-chain, the same way the SDK login does: a CAP-33 sponsored createAccount where the app's funding wallet sponsors the base reserve and the wallet is seeded with the app's configured starting balance. Used in Deferred mode when a business event occurs (KYC approved, first deposit, etc.). Custodial (ChettaPay-managed) wallets only — external wallets fund themselves.

```bash
POST https://chettapay-server-api.vercel.app/v1/wallets/fund
x-chettapay-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

`publicKey` must be a 56-character Stellar public key starting with `G`.

**Response codes:**

| Code                      | Meaning                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `200 OK`                  | Wallet funded. Its reserve is sponsored on-chain.                          |
| `400 Bad Request`         | Missing or malformed `publicKey` (`VALIDATION_ERROR`).                     |
| `403 Forbidden`           | `publicKey` belongs to a wallet owned by another app (`FORBIDDEN`).        |
| `404 Not Found`           | `publicKey` is not a known wallet (`WALLET_NOT_FOUND`).                    |
| `409 Conflict`            | Wallet is already funded (`WALLET_ALREADY_FUNDED`). Safe to ignore.        |
| `502 Bad Gateway`         | Funding the XLM reserve failed (`FUND_XLM_FAILED`) — e.g. the funding wallet has insufficient XLM, or a transient Stellar network issue. Retry. |

**Response body (`200`):**

```json
{
  "content": {
    "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "startingBalance": "1"
  },
  "code": "SERVER_WALLET_FUNDED",
  "success": true
}
```

`startingBalance` is the XLM the wallet was seeded with (the app's configured starting balance from **Dashboard → Treasury → Account Funding**; `"0"` when unset). The sponsored base reserve is locked in the funding wallet, not transferred.

---

## Trustlines

There is no server-side trustline endpoint. `change_trust` is a signed operation and server-api never signs an end-user wallet, so trustlines are set from the SDK, where the wallet signs client-side: `setTrustline()` on the client, or the app's default assets configured in **Dashboard → Treasury → Tokens & Trustlines**, which are applied at login.

---

## Users

Register an app user (and optionally provision a wallet for them).

### `POST /v1/users`

```bash
POST https://chettapay-server-api.vercel.app/v1/users
x-chettapay-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "externalId": "your-user-id",
  "email": "user@example.com"
}
```

`externalId` (1–255 chars) is required; `email`, `firstName`, `lastName`, and `avatar` are optional. Returns `201` with `code: "SERVER_USER_REGISTERED"`.

### `POST /v1/users/with-wallet`

Same body as above, but also creates a Stellar wallet for the user in one call. Returns `201` with `code: "SERVER_USER_WALLET_CREATED"`.

---

## Tokens

### `POST /v1/tokens/verify`

Validates an SDK end-user access token server-side (e.g. to authenticate a user on your backend from a token minted client-side by the SDK).

```bash
POST https://chettapay-server-api.vercel.app/v1/tokens/verify
x-chettapay-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "token": "<sdk access token>"
}
```

On success returns `code: "SERVER_TOKEN_VERIFIED"` with content
`{ userId, applicationId, expiresAt, network, wallet, profile, authProvider }`.

**Error codes:** `SDK_AUTH_TOKEN_EXPIRED` (`401`), `SDK_AUTH_INVALID_TOKEN` (`401`), `SDK_TOKEN_WRONG_APPLICATION` (`403`).

---

## Error format

Errors are returned in the standard envelope:

```json
{
  "code": "FUND_XLM_FAILED",
  "success": false
}
```

The HTTP status code carries the status. For the list of codes see [Error Codes](https://chettapay-docs.vercel.app/docs/sdk-reference/error-codes).
