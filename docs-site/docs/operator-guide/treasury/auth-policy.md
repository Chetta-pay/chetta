---
title: "Auth Policy"
---

**Dashboard → Treasury → Auth Policy**

Controls which Soroban contracts and functions a custodial wallet may **authorize**. This is the signing allowlist for `SorobanAuthorizationEntry` — the authorization a user signs when your own contract is the transaction source and only needs the user's consent, not a full signed envelope.

A custodial key lives on ChettaPay's side, so the allowlist is the only thing standing between your users and a signing oracle: without it, anyone holding a session could have the platform authorize any contract to move that user's tokens. ChettaPay signs an entry **only** when every contract and function in it is allowlisted here, and refuses everything else.

This page governs `POST /tx/sign-auth-entry` (`chettapay.signAuthEntry()` in the SDK), and only for **custodial** wallets — the ones your users get from social or email login. It does not affect ordinary payments. External wallets like Freighter sign the entry themselves, in the wallet, so the user approves each one and no allowlist applies. Passkey smart accounts (C-addresses) cannot use this method at all in the current SDK build.

---

## Contract allowlist

Each row allowlists **one contract** and the **exact functions** a custodial wallet may authorize on it.

| Field | What it is |
| --- | --- |
| **Contract** | The Soroban contract id (`C…`). One row per contract. |
| **Functions** | The function names allowed on that contract. Pick them from the contract, or type them. |
| **Label** | Optional, for humans. E.g. `RouterV1 settlement`. |
| **Enabled** | A disabled row authorizes nothing. Only enabled rows are read at signing time. |

Add **every contract in the call tree**, not just the entry point. ChettaPay walks the whole invocation tree — the root and every sub-invocation — and each contract it finds needs its own row. A settlement contract that swaps through an AMM and then moves a token needs three rows.

### Function names are matched exactly

`Transfer` is not `transfer`. Names are compared character for character, because that is how the Stellar network compares them: a contract exposing `transfer` has no function called `Transfer`, and authorizing one would authorize nothing.

The dashboard checks each name against the deployed contract when you save the row, so a misspelling is refused there rather than surfacing later as a denied request in your app. Two things follow from that check:

- Saving a row for a contract that is **not deployed on this app's network** is refused. Testnet and mainnet apps have separate allowlists; a mainnet contract id cannot be saved on a testnet app.
- If ChettaPay cannot reach the network when you save, the row is stored anyway. The allowlist stays editable while the ledger is unreachable, and the names are still enforced when a signature is requested.

---

## Allow any contract and function

A single switch that authorizes **every** contract and function, ignoring the rows below it entirely. While it is on, no row can deny a signature — including a row for the very same contract.

Use it only while you still control transaction construction end to end, typically during an integration spike. An explicit allowlist is what makes the custodial signer safe to expose; the switch removes that protection for every wallet in the app at once. Turn it off before you take the app to mainnet.

The switch reads **on** only when it is actually bypassing. If it shows off after you turned it on, the underlying row was disabled or edited through the API — turn it on again to restore it.

---

## Signature validity window

Every signature ChettaPay produces expires at a ledger you choose, and the app's window caps how far ahead that can be.

- **Default:** 120 ledgers, roughly 10 minutes.
- **Maximum:** 300 ledgers, roughly 25 minutes. This ceiling is enforced by the signing service itself and cannot be raised from the dashboard.

The caller computes `validUntilLedger` from the network's latest ledger; ChettaPay re-checks it against this window before signing. Keep it short. A signed entry is a bearer authorization for as long as it is valid, so the window is how long a leaked one remains useful.

---

## What a denial means

Every rejection answers `403` (or `400` for a malformed request) with a code, plus `applicationId` and `applicationName` — the app the decision was made against.

| Code | What happened | What to do |
| --- | --- | --- |
| `SOROBAN_AUTH_NO_POLICY` | This app has no enabled rows at all | Add a row, or check that the API key belongs to the app you configured |
| `SOROBAN_AUTH_CONTRACT_NOT_ALLOWED` | A contract in the tree has no row | Add it — remember the sub-invocations |
| `SOROBAN_AUTH_FUNCTION_NOT_ALLOWED` | The contract is allowed, the function is not | Check the exact spelling and case against the contract |
| `SOROBAN_AUTH_ADDRESS_MISMATCH` | The entry authorizes a different address than the caller's wallet | Build the entry for the session's own address |
| `SOROBAN_AUTH_ENTRY_INVALID` | Not a valid `SorobanAuthorizationEntry`, or not address-credentials | See below |
| `SOROBAN_AUTH_EXPIRATION_TOO_LONG` | `validUntilLedger` is in the past or beyond the window | Recompute it from the latest ledger |

Full list, with the save-time codes: [Error Codes](https://chettapay-docs.vercel.app/docs/sdk-reference/error-codes).

---

## Troubleshooting

**"Allow any" is on and I am still denied.** Confirm the switch reads on after a page reload — if it does not, the row behind it is disabled or was edited through the API, and turning it on again restores it. Then confirm the request reached the app you are looking at: read `applicationId` in the error body.

**`SOROBAN_AUTH_NO_POLICY`, but I can see my rows.** The allowlist belongs to one application, and so does each API key. Configuring one app while signing with another app's key produces exactly this error, with the rows visibly present in the dashboard. The `applicationName` in the response body is the app your key actually resolves to — if it is not the one on screen, that is the answer. Apps also come in testnet and mainnet pairs with separate allowlists.

**`SOROBAN_AUTH_FUNCTION_NOT_ALLOWED` on a function I allowlisted.** Compare the two strings character for character. `Transfer` against `transfer` is the usual answer; so is a trailing space, or `transfer()` written with parentheses. Re-saving the row will now refuse a name the contract does not have.

**`SOROBAN_AUTH_ENTRY_INVALID` on an entry that looks right.** Send the `SorobanAuthorizationEntry` itself, base64-encoded. A `HashIDPreimage` — the structure that gets hashed and signed, which some tooling exposes under a similar name — is a different type and is refused. Source-account entries are also refused here: they are covered by the transaction envelope's signature, not by this endpoint.

---

## Related

- [Sponsorship](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/sponsorship) — who pays the fee for these transactions
- [Transaction Policy](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/transaction-policy) — limits on ordinary transactions
- [Security Model](https://chettapay-docs.vercel.app/docs/core-concepts/security-model) — how custodial keys are held
- [`chettapay.signAuthEntry()`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core) — the client method this page governs
