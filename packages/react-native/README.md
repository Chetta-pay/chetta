# @chettapay/react-native

React Native bindings for [ChettaPay](https://chettapay.vercel.app) — drop-in authentication UI and hooks for Stellar-based mobile applications.

## Installation

```bash
npm install @chettapay/react-native @chettapay/core
# or
pnpm add @chettapay/react-native @chettapay/core
# or
yarn add @chettapay/react-native @chettapay/core
```

**Peer dependencies:** `react >= 18`, `react-native >= 0.72`

## Quick Start

Wrap your application with `ChettaPayProvider` and use the `useChettaPay` hook anywhere in the tree.

```tsx
import { ChettaPayProvider } from '@chettapay/react-native';

export default function App() {
  return (
    <ChettaPayProvider config={{ apiKey: 'your-api-key' }}>
      <MyApp />
    </ChettaPayProvider>
  );
}
```

```tsx
import { useChettaPay } from '@chettapay/react-native';

export function Profile() {
  const { isAuthenticated, walletAddress, login, logout } = useChettaPay();

  if (!isAuthenticated) {
    return (
      <TouchableOpacity onPress={() => login({ provider: 'google' })}>
        <Text>Sign in with Google</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <Text>Wallet: {walletAddress}</Text>
      <TouchableOpacity onPress={logout}><Text>Sign out</Text></TouchableOpacity>
    </View>
  );
}
```

## API Reference

### `<ChettaPayProvider>`

Context provider that initialises the ChettaPay client and makes it available to child components.

```tsx
<ChettaPayProvider
  config={{
    apiKey: 'your-api-key',
    baseUrl: 'https://chettapay-api.vercel.app', // optional
    stellarNetwork: 'testnet',             // optional, default: 'testnet'
  }}
>
  {children}
</ChettaPayProvider>
```

| Prop     | Type                | Required | Description                              |
| -------- | ------------------- | -------- | ---------------------------------------- |
| `config` | `ChettaPayClientConfig`| Yes      | Configuration passed to `ChettaPayClient`   |
| `styles` | `ChettaPayStyles`      | No       | Style overrides (theme, accent, providers) |

---

### `useChettaPay()`

Returns the authentication and SDK context.

```ts
const {
  isAuthenticated,  // boolean — true when a valid session exists
  walletAddress,    // string — public key of the authenticated wallet
  login,            // (options: ChettaPayLoginOptions) => void
  logout,           // () => void
  buildTx,          // (operation, params, options?) => Promise<void>
  signAndSubmitTx,  // (unsignedXdr: string) => Promise<void>
  transaction,      // TransactionState — current transaction state
  txHistory,        // TxHistoryState — transaction history
  network,          // StellarNetwork — current network
  setNetwork,       // (network: StellarNetwork) => void
  getClient,        // () => ChettaPayClient
  config,           // ChettaPayConfig — remote app configuration
  styles,           // ChettaPayStyles — resolved styles
  openLoginModal,
  openTransactionModal,
  openKycModal,
  openRampWidget,
  openTxHistoryModal,
  openWalletBalanceModal,
} = useChettaPay();
```

#### Login options

```ts
// Social providers (opens browser via Linking)
login({ provider: 'google' });
login({ provider: 'github' });

// Email OTP
login({ provider: 'email', email: 'user@example.com' });

// Stellar wallet
import { WalletType } from '@chettapay/core';
login({ provider: 'wallet', type: WalletType.FREIGHTER });
login({ provider: 'wallet', type: WalletType.ALBEDO });
```

---

### `<WalletButton>`

Pre-built button component that opens the ChettaPay authentication modal.

```tsx
import { WalletButton } from '@chettapay/react-native';

export function Header() {
  return <WalletButton />;
}
```

The modal handles all login providers, loading states, and error feedback out of the box.

---

## Styles

No CSS import is needed. All components use React Native `StyleSheet` and are styled natively. Appearance is controlled via the `styles` prop on `<ChettaPayProvider>`.

---

## TypeScript

`@chettapay/react-native` ships full type support. Key exported types:

```ts
import type {
  AuthProviderProps,
  AuthContextValue,
  LoginButtonProps,
  AuthModalProps,
  ChettaPayConfig,
  ChettaPayStyles,
} from '@chettapay/react-native';
```

---

## License

MIT
