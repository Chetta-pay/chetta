---
title: "How the C-Address Lifecycle Works"
---

ChettaPay gives you a single passkey login call — `createSmartWallet()` / `loginSmartWallet()` — and handles the contract account underneath. This page explains what happens for **C-addresses**: useful when debugging, surfacing progress in your UI, or reasoning about costs.

## G-address vs C-address at a glance

A **G-address** is a classic Stellar account controlled by an ed25519 keypair (in ChettaPay's custodial flow, that key is managed server-side via KMS). A **C-address** is a smart contract deployed on Soroban that *acts as an account* — its authorization logic lives in code, and in ChettaPay it is controlled by the user's **passkey** credential.

| Aspect           | G-address (custodial)     | C-address (passkey smart wallet)       |
|------------------|---------------------------|----------------------------------------|
| Identifier       | Starts with `G`           | Starts with `C`                        |
| Controlled by    | KMS key (server-side)     | User passkey (WebAuthn)                |
| Authorization    | Native ed25519 signature  | `__check_auth` in the contract         |
| Creation         | `createAccount` operation | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline   | SAC balance (no classic trustline)     |
| Keeping it alive | XLM reserve               | Storage rent + TTL                     |
| Fees             | Sponsored (fee-bump)      | Sponsored (fee-bump)                   |
| Flexibility      | Fixed (ed25519 only)      | Programmable auth                      |

## The onboarding flow

`createSmartWallet()` walks a new user through the ceremony and deploy automatically. Observe each transition via `onAuthStateChange` (there is no separate `walletProgress` event):

```
idle ──▶ creating_passkey ──▶ deploying_smart_account ──▶ authenticating ──▶ authenticated
```

| Auth step                 | What it means                                                   |
|---------------------------|-----------------------------------------------------------------|
| `creating_passkey`        | The device WebAuthn ceremony runs (`create()` for a new user, `get()` for a returning one) |
| `deploying_smart_account` | ChettaPay deploys the sponsored C-address on-chain (new users)     |
| `authenticating`          | Finalizing authentication with the ChettaPay server               |
| `authenticated`           | Session ready; `wallet.custody === 'smart'`, `wallet.address` is the `C…` contract id |

For a returning user, `loginSmartWallet()` runs `get()` and skips the deploy.

### Deploy

Creating a classic account is a single `createAccount` operation. Creating a C-address means deploying a contract: ChettaPay submits an `InvokeHostFunction` transaction that instantiates the smart-wallet contract with the user's passkey as the authorized owner. The contract's constructor runs atomically during deploy, so there's no separate "initialize" step. The resulting contract ID *is* the C-address.

### Sponsorship: rent instead of reserve

This is the biggest conceptual difference, and ChettaPay hides most of it.

- **G-address:** Stellar requires a base XLM reserve (plus more per trustline). It's paid once and recovered if the account closes.
- **C-address:** There is no XLM reserve in the classic sense. Instead, every entry in the contract's storage has a **TTL (time-to-live)**. If the TTL lapses, the entry is archived and must be restored before use. ChettaPay's sponsor account extends the TTL on the user's behalf so the wallet stays live.

The practical implication: instead of a one-time reserve, there's a small *recurring* cost to keep a smart wallet alive, covered by ChettaPay's sponsor account.

### Holding assets: the SAC

C-addresses don't use classic trustlines. They interact with assets through the **Stellar Asset Contract (SAC)** — a built-in contract that wraps each classic Stellar asset. A C-address can receive a SAC-wrapped asset without an explicit trustline step (provided the issuer isn't gating with authorization flags). ChettaPay routes payments through the SAC for you, so the transaction API looks identical to the classic flow from your side. (Manual `setTrustline` does not apply to smart wallets.)

### Signing: full transaction vs auth entries

For a custodial G-address, the KMS key signs the full transaction, which ChettaPay wraps in a fee-bump. For a C-address the signing model changes:

1. ChettaPay builds the contract invocation.
2. It simulates the transaction to discover which **auth entries** need signatures.
3. The user's **passkey** signs only those auth entries — the contract's `__check_auth` verifies them.
4. ChettaPay reassembles the transaction with the signed auth entries.
5. ChettaPay's sponsor account signs the envelope as the fee source and submits it.

You don't implement any of this — it's what `runTx` / `signAndSubmitTx` do internally for a smart wallet — but it's why smart-wallet transactions are contract invocations rather than classic payment ops.

## How ChettaPay abstracts all of this

| You call                    | ChettaPay handles                                              |
|-----------------------------|-------------------------------------------------------------|
| `createSmartWallet()`       | Passkey ceremony + sponsored deploy + TTL extension         |
| `loginSmartWallet()`        | Passkey `get()` + session                                   |
| `runTx()` / `signAndSubmitTx()` | Building the SAC invocation, passkey auth-entry signing, fee-bump |
| `onAuthStateChange()`       | Surfacing each onboarding transition                        |

The goal is that a passkey smart wallet is a login choice, not a rewrite. The differences above matter for debugging and cost modeling, but not for day-to-day integration.

## Cost considerations

On testnet, rent and fees are effectively free. On mainnet, each smart wallet carries a small recurring cost to keep its storage TTL extended — this replaces the one-time XLM reserve of the classic model. ChettaPay's sponsor account covers it automatically; account for it when estimating per-user costs at scale.

## References

- [Contract accounts overview](https://developers.stellar.org/docs/build/guides/contract-accounts)
- [Smart wallets guide](https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets)
- [Signing Soroban invocations](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations)
- [Stellar Asset Contract (SAC)](https://developers.stellar.org/docs/tokens/stellar-asset-contract)
- [State archival (TTL / rent)](https://developers.stellar.org/docs/build/guides/archival)

## Next steps

- [C-Address Quickstart](https://chettapay-docs.vercel.app/docs/smart-wallets/quickstart-c-address)
- [G-Addresses vs C-Addresses](https://chettapay-docs.vercel.app/docs/smart-wallets/migration-g-to-c)
