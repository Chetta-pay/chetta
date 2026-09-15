---
title: "Security Model"
---

ChettaPay manages private keys on behalf of your users and your app. This page explains exactly how keys are stored, who can access them, and how the system prevents unauthorized access.

---

## Key management models

| Model | Who holds the key | Status |
|---|---|---|
| **AWS KMS** | KMS — no ChettaPay employee can access keys silently | Available |
| **Passkeys (WebAuthn)** | The user's device Secure Enclave — ChettaPay never sees it | `coming soon` |
| **BYOK (Bring Your Own KMS)** | Your own KMS instance — full operator control | `coming soon` |
| **MPC** | No single actor holds the full key | `coming soon` |

---

## AWS KMS

All private keys — user wallets and your app's sponsorship wallets (funding, gas, distribution) — are managed through AWS KMS using envelope encryption. No key is ever stored in plaintext anywhere in ChettaPay's infrastructure.

```
Private key (plaintext)
  └── Encrypted with a data key (AES-256-GCM)
        └── Data key encrypted by AWS KMS master key
              └── Master key never leaves AWS KMS hardware
```

**The flow for every signing operation:**

1. ChettaPay Server calls `KMS.generateDataKey()` at wallet creation
2. KMS returns a plaintext data key and an encrypted copy
3. ChettaPay Server encrypts the private key, then immediately discards the plaintext data key
4. Only ciphertext is stored in the database — useless without KMS access
5. To sign a transaction, ChettaPay Server calls `KMS.decrypt()`, decrypts the key in memory, signs, and discards

Every `KMS.decrypt()` call is logged to AWS CloudTrail with an immutable audit trail. No ChettaPay employee can access a key without leaving a permanent record.

---

## Passkeys / WebAuthn `coming soon`

When Passkeys are enabled, the private key is generated on the user's device and stored in the **Secure Enclave** — the hardware security module built into iOS and Android devices.

```
Private key generated on device
  └── Stored in Secure Enclave (Face ID / Touch ID protected)
        └── ChettaPay never receives or stores the private key
              └── Transactions signed on-device — only the signature is sent to the server
```

Users authenticate with biometrics to sign transactions. ChettaPay has zero custody of the key.

**Account recovery (3 layers):**

| Layer | Mechanism | Covers |
|---|---|---|
| 1 | Native cloud sync (iCloud Keychain / Google Password Manager) | ~80% of cases |
| 2 | Secondary Passkey registered on a backup device | Multi-device users |
| 3 | Social re-keying via OAuth re-auth + Stellar `setOptions` | Total device loss |

---

## BYOK — Bring Your Own KMS `coming soon`

By default, ChettaPay manages the AWS KMS master keys. With BYOK, you configure your own KMS instance from the Dashboard — ChettaPay's server calls your KMS instead of its own.

For compliance requirements that mandate operator control over root encryption keys.

---

## MPC — Multi-Party Computation `coming soon`

With MPC, the private key is split using Shamir Secret Sharing. No single actor — not ChettaPay, not the user, not your app — holds the complete key. Signing requires a threshold of parties to cooperate, enabling social recovery without any dependency on ChettaPay.

---

## ChettaPay Server boundaries

The ChettaPay Server is designed with minimum privileges:

| Operation | Allowed |
|---|---|
| Sign fee-bump transactions | Yes — to cover fees on behalf of users |
| Execute account sponsorship sequences | Yes — to fund new wallets |
| Move a user's own funds independently | **No** |
| Access user private keys without KMS | **No** — all keys are encrypted at rest |

### Why the ChettaPay Server cannot move a user's own funds — technically

A fee-bump transaction has two layers: an inner transaction (signed by the user's key) and an outer wrapper (signed by the ChettaPay sponsor). The outer signature only authorizes paying the fee — it has no authority over the inner transaction's operations. Moving a user's funds requires a `payment` or `pathPayment` operation inside the inner transaction, which must be signed by the user's own private key. The sponsor keypair ChettaPay holds can never produce that signature.

In other words: ChettaPay's sponsor key is structurally limited to "I'll pay the fee for this transaction" — the contents of the transaction are entirely controlled by the user's key, which ChettaPay only accesses via KMS to sign operations the user initiates.

### Operator wallets (funding, gas, distribution)

These wallets are also managed via AWS KMS — ChettaPay holds the encrypted keys and signs on their behalf. The distinction from user wallets is that these are *your* wallets, funded by you, and exist specifically so ChettaPay can operate them for a defined set of tasks: funding XLM reserves, paying transaction fees, and distributing assets via distribution rules. Every signing operation is logged to AWS CloudTrail. ChettaPay cannot use these wallets outside of those operations, and no action goes unrecorded.

### Fee-bump policy enforcement

Before signing any fee-bump, the ChettaPay Server validates:

- Fee does not exceed `max_fee_per_tx` configured in Dashboard
- User has not exceeded their `daily_ops_cap`
- Asset is in the app's `approved_assets` list
- Gas wallet balance is above the minimum reserve threshold

These rules are enforced server-side and cannot be bypassed from the client SDK.

---

## Attack surface

| Vector | Risk | Mitigation |
|---|---|---|
| Database compromised | Key exposure | Only ciphertext stored — useless without KMS |
| Insider threat | ChettaPay employee accesses keys | Every KMS decrypt logged to immutable CloudTrail |
| ChettaPay Server compromised | Unauthorized fee-bumps | Sponsor keypair has fee-bump privileges only — cannot move user funds |
| Webhook spoofing | Unauthorized wallet activations | Secret key required — server-side validation |
| Client-side bypass | SDK manipulated to skip policies | All policy enforcement is server-side |
| Device loss (Passkeys) | Passkey inaccessible | Three-layer recovery |