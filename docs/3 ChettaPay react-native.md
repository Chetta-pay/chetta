# @chettapay/react-native

React Native hooks and pre-built UI components for ChettaPay. Built on top of `@chettapay/core`.

```bash
npm install @chettapay/react-native @chettapay/core
```

---

## `<ChettaPayProvider>`

Wraps your application root. Required for all hooks and components to work. Internally renders the login, transaction, KYC, ramp, tx history, and wallet balance modals — you do not need to mount them manually.

```tsx
import { ChettaPayProvider } from '@chettapay/react-native';

<ChettaPayProvider
  config={{ apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx' }}
>
  <App />
</ChettaPayProvider>
```

**Props:**

| Prop     | Type                 | Required | Description                                                         |
|----------|----------------------|----------|---------------------------------------------------------------------|
| `config` | `ChettaPayClientConfig` | Yes      | Client configuration. See `@chettapay/core` for all available options. |
| `styles` | `ChettaPayStyles`       | No       | Style overrides applied on top of the remote configuration.         |

**`ChettaPayClientConfig`:**

| Option           | Type             | Default                        | Description                                 |
|------------------|------------------|--------------------------------|---------------------------------------------|
| `apiKey`         | `string`         | —                              | **Required.** Your ChettaPay API key.          |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                    | Target network: `'testnet'` or `'mainnet'`. |
| `baseUrl`        | `string`         | `'https://chettapay-api.vercel.app'` | Override the ChettaPay API base URL.           |

---

## `useChettaPay()`

The primary hook. Provides access to all ChettaPay functionality from a single import. Must be used inside `<ChettaPayProvider>`.

```tsx
import { useChettaPay } from '@chettapay/react-native';

function MyComponent() {
  const {
    isAuthenticated,
    walletAddress,
    login,
    logout,
    buildTx,
    signAndSubmitTx,
    transaction,
    txHistory,
    network,
    setNetwork,
    refreshBalance,
    getClient,
    openLoginModal,
    openTransactionModal,
    openKycModal,
    openRampWidget,
    openTxHistoryModal,
    openWalletBalanceModal,
    config,
    styles,
  } = useChettaPay();
}
```

---

### Authentication

| Property          | Type                                    | Description                                                               |
|-------------------|-----------------------------------------|---------------------------------------------------------------------------|
| `isAuthenticated` | `boolean`                               | Whether the user has an active session.                                   |
| `walletAddress`   | `string`                                | Public key of the authenticated wallet. Empty string if not authenticated. |
| `login`           | `(options: ChettaPayLoginOptions) => void` | Initiates an authentication flow.                                         |
| `logout`          | `() => void`                            | Signs out the current user and clears the session.                        |

**`ChettaPayLoginOptions`:**

| Value                                      | Description                                       |
|--------------------------------------------|---------------------------------------------------|
| `{ provider: 'google' }`                   | Opens Google OAuth flow.                          |
| `{ provider: 'github' }`                   | Opens GitHub OAuth flow.                          |
| `{ provider: 'email', email: string }`     | Sends an OTP code to the provided email address.  |
| `{ provider: 'wallet', type: WalletType }` | Connects a Stellar wallet (Freighter or Albedo).  |

---

### Transactions

| Property               | Type                                             | Description                                   |
|------------------------|--------------------------------------------------|-----------------------------------------------|
| `transaction`          | `TransactionState`                               | Current transaction state (reactive).         |
| `buildTx`              | `(operation, params, options?) => Promise<void>` | Builds an unsigned Stellar transaction.       |
| `signAndSubmitTx`      | `(unsignedXdr: string) => Promise<void>`         | Signs and submits the built transaction.      |
| `openTransactionModal` | `() => void`                                     | Opens the transaction modal programmatically. |

The transaction modal opens automatically when `buildTx` is called. See `@chettapay/core` for `TransactionState` step details.

---

### Network

| Property     | Type                               | Description                           |
|--------------|------------------------------------|---------------------------------------|
| `network`    | `StellarNetwork`                   | Currently active network.             |
| `setNetwork` | `(network: StellarNetwork) => void` | Switches the active Stellar network. |

---

### Wallet Balance

| Property                 | Type                                                       | Description                                                                         |
|--------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `refreshBalance`         | `(publicKey?: string) => Promise<void>`                    | Fetches balances for the given public key. Uses the authenticated wallet if omitted. |
| `openWalletBalanceModal` | `() => void`                                               | Opens the wallet balance modal.                                                     |

---

### Transaction History

| Property            | Type             | Description                          |
|---------------------|------------------|--------------------------------------|
| `txHistory`         | `TxHistoryState` | Current tx history state (reactive). |
| `openTxHistoryModal` | `() => void`    | Opens the transaction history modal. |

---

### KYC

| Property       | Type                                                                                  | Description                       |
|----------------|---------------------------------------------------------------------------------------|-----------------------------------|
| `openKycModal` | `(options?: { country?: string; level?: KycLevel; onApproved?: () => void }) => void` | Opens the KYC verification modal. |

| Option       | Type         | Default   | Description                                                           |
|--------------|--------------|-----------|-----------------------------------------------------------------------|
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.                  |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level: `'basic'`, `'intermediate'`, or `'enhanced'`.    |
| `onApproved` | `() => void` | —         | Callback invoked when the KYC verification is successfully approved.  |

---

### Ramps

| Property         | Type         | Description                        |
|------------------|--------------|------------------------------------|
| `openRampWidget` | `() => void` | Opens the fiat on/off-ramp widget. |

---

### Utilities

| Property    | Type                 | Description                                                            |
|-------------|----------------------|------------------------------------------------------------------------|
| `getClient` | `() => ChettaPayClient` | Returns the underlying `ChettaPayClient` instance for direct API access.  |
| `config`    | `ChettaPayConfig`       | Application configuration fetched from the ChettaPay Dashboard.          |
| `styles`    | `ChettaPayStyles`       | Resolved styles, merging remote config with any local overrides.       |

---

### Modal entry points

All ChettaPay modals are mounted inside `<ChettaPayProvider>` and controlled programmatically:

| Function                  | Description                             |
|---------------------------|-----------------------------------------|
| `openLoginModal()`        | Opens the login modal.                  |
| `openTransactionModal()`  | Opens the transaction modal.            |
| `openKycModal(options?)`  | Opens the KYC modal.                    |
| `openRampWidget()`        | Opens the ramp widget.                  |
| `openTxHistoryModal()`    | Opens the transaction history modal.    |
| `openWalletBalanceModal()` | Opens the wallet balance modal.        |

---

## Components

### `<WalletButton>`

Pre-built button that handles the complete authentication flow. When logged out, opens the login modal. When logged in, shows the wallet address with a dropdown for balance, transaction history, and logout.

```tsx
import { WalletButton } from '@chettapay/react-native';

<WalletButton />
```

No props required. Appearance is controlled by the `styles` configuration passed to `<ChettaPayProvider>`.

---

### `<KycModal>`

Pre-built KYC verification modal. Can be rendered directly when you need more control than `openKycModal()` provides.

```tsx
import { KycModal } from '@chettapay/react-native';

<KycModal
  onClose={() => setOpen(false)}
  country="US"
  level="basic"
  onApproved={() => console.log('KYC approved')}
/>
```

| Prop         | Type         | Default   | Description                                             |
|--------------|--------------|-----------|---------------------------------------------------------|
| `onClose`    | `() => void` | —         | **Required.** Called when the user dismisses the modal. |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.    |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level.                                     |
| `onApproved` | `() => void` | —         | Called when KYC is successfully approved.               |

---

### `<KycStatus>`

Displays the current KYC status for the authenticated user.

```tsx
import { KycStatus } from '@chettapay/react-native';

<KycStatus status="approved" />
```

---

### `<RampWidget>`

Pre-built fiat on/off-ramp widget with support for on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows.

```tsx
import { RampWidget } from '@chettapay/react-native';

<RampWidget onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                              |
|-----------|--------------|----------------------------------------------------------|
| `onClose` | `() => void` | **Required.** Called when the user dismisses the widget. |

---

### `<WalletBalanceModal>`

Displays the token balances of the authenticated wallet with a manual refresh option.

```tsx
import { WalletBalanceModal } from '@chettapay/react-native';

<WalletBalanceModal onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                             |
|-----------|--------------|---------------------------------------------------------|
| `onClose` | `() => void` | **Required.** Called when the user dismisses the modal. |

---

## Template components

Template components handle rendering only — they receive all data and callbacks as props and contain no internal logic. Use them to build fully custom UI while reusing ChettaPay's layout and visual structure.

| Component                      | Description                                                  |
|--------------------------------|--------------------------------------------------------------|
| `<LoginModalTemplate>`         | Login provider selection and email OTP screens.              |
| `<KycModalTemplate>`           | KYC provider selection and verification screens.             |
| `<RampWidgetTemplate>`         | Ramp input, quote selection, and payment instruction screens.|
| `<TransactionModalTemplate>`   | Transaction details, signing, and result screens.            |
| `<TxHistoryModalTemplate>`     | Transaction history list screen.                             |
| `<WalletBalanceModalTemplate>` | Wallet balance screen.                                       |

Import the corresponding `*Props` type for full type safety:

```tsx
import {
  TransactionModalTemplate,
  type TransactionModalTemplateProps,
  WalletBalanceModalTemplate,
  type WalletBalanceModalTemplateProps,
} from '@chettapay/react-native';
```

---

## Production Setup

### 1. Get your API key

Create an account at the [ChettaPay Dashboard](https://chettapay.vercel.app) and generate a publishable API key for your application.

| Prefix            | Network | Usage                                    |
|-------------------|---------|------------------------------------------|
| `pub_testnet_`    | Testnet | Development and testing (safe to expose) |
| `pub_mainnet_`    | Mainnet | Production (safe to expose)              |

### 2. Configure your app

```tsx
<ChettaPayProvider
  config={{
    apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',  // Replace with your key
    stellarNetwork: 'testnet',                    // 'testnet' for dev, 'mainnet' for prod
  }}
>
  <App />
</ChettaPayProvider>
```

### 3. Switch to production

When ready for production, replace your key and network:

```tsx
<ChettaPayProvider
  config={{
    apiKey: 'pub_mainnet_xxxxxxxxxxxxxxxxxxxx',
    stellarNetwork: 'mainnet',
  }}
>
  <App />
</ChettaPayProvider>
```

The SDK automatically connects to the ChettaPay backend at `https://chettapay-api.vercel.app` and fetches your application's remote configuration (enabled providers, styles, branding) from the Dashboard.

---

## Types

```typescript
import type {
  ChettaPayConfig,
  ChettaPayStyles,
  AuthProviderProps,
  AuthContextValue,
  LoginButtonProps,
  AuthModalProps,
  KycStep,
  RampStep,
  TransactionModalTemplateProps,
  WalletBalanceModalTemplateProps,
} from '@chettapay/react-native';
```

Core types such as `TransactionState`, `TxHistoryState`, `WalletBalanceContent`, `ChettaPayLoginOptions`, `StellarNetwork`, and `WalletType` are imported directly from `@chettapay/core`.
