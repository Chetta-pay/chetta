---
title: "Passkeys Guide `coming soon`"
---

Passkeys let your users sign transactions with Face ID or Touch ID instead of a password or seed phrase. The private key is generated and stored in the device's Secure Enclave — ChettaPay never sees it.

---

## How it works

With the default AWS KMS model, ChettaPay encrypts and manages the user's private key server-side. When a user enables a Passkey, the key migrates from KMS to their device's Secure Enclave:

```
Before Passkeys (KMS model)
  Private key → encrypted with AWS KMS → stored server-side
  Signing → ChettaPay Server decrypts key → signs → discards

After Passkeys (WebAuthn model)
  Private key → generated on device → stored in Secure Enclave
  Signing → user authenticates with Face ID / Touch ID → device signs locally
  ChettaPay receives only the signature — never the key
```

This means ChettaPay has zero custody of the key after Passkey setup. No KMS call, no audit trail needed — the key never touches ChettaPay infrastructure.

---

## User flow

1. User logs in with Google, GitHub, or email OTP as usual
2. After login, your app prompts: **"Enable Face ID for faster sign-in"**
3. User taps the button — device generates a keypair in the Secure Enclave
4. ChettaPay updates the wallet to use the new Passkey-backed key
5. All future transaction signatures happen on-device via biometrics

---

## Implementation `coming soon`

> Partial support has already landed: `@chettapay/core` exposes `ChettaPayClient.loginSmartWallet()` and a `passkey` config slot (on web the provider injects a browser passkey ceremony automatically), and `@chettapay/react` now depends on `@simplewebauthn/browser`. The high-level `useChettaPayPasskey()` hook shown below is still the planned ergonomic wrapper and is **not exported yet**.

```tsx
'use client';
import { useChettaPayPasskey } from '@chettapay/react';

export function PasskeySetup() {
  const { setupPasskey, passkeyStatus, loading } = useChettaPayPasskey();

  if (passkeyStatus === 'active') {
    return <p>✓ Face ID / Touch ID active</p>;
  }

  return (
    <button onClick={() => setupPasskey()} disabled={loading}>
      Enable Face ID
    </button>
  );
}
```

`setupPasskey()` triggers the WebAuthn registration flow:

1. ChettaPay Server generates a challenge
2. Device's Secure Enclave signs the challenge with a new keypair
3. Public key is sent to ChettaPay Server and associated with the wallet
4. Private key never leaves the device

---

## Account recovery

If the user loses their device, ChettaPay provides three recovery layers:

| Layer | Mechanism | Covers |
|---|---|---|
| 1 | Native cloud sync (iCloud Keychain / Google Password Manager) | ~80% of cases |
| 2 | Secondary Passkey registered on a backup device | Multi-device users |
| 3 | Social re-keying via OAuth re-auth + Stellar `setOptions` | Total device loss |

---

## Security properties

| Property | KMS model | Passkeys model |
|---|---|---|
| Key stored server-side | Yes (encrypted) | No |
| ChettaPay can access key | With CloudTrail audit | Never |
| Requires biometrics to sign | No | Yes |
| Works offline | No | Yes (signing only) |
| Recovery if device lost | N/A | 3-layer recovery |

---

## Browser and device support

WebAuthn (the underlying standard) is supported on:

- iOS 16+ (Face ID, Touch ID)
- Android 9+ (fingerprint, face unlock)
- macOS with Touch ID
- Windows Hello
- Any device with a FIDO2 hardware key

---

## Enabling Passkeys for your app

When available, Passkeys can be enabled per-app from **Dashboard → Build → Settings → Key Management**. The feature is opt-in — existing users are not affected until they set up a Passkey themselves.