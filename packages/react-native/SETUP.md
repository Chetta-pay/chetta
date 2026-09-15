# @chettapay/react-native — Setup Guide

## Prerequisites

- Node.js >= 18
- React Native >= 0.72 (or Expo SDK >= 49)
- `@chettapay/core` as a peer dependency

---

## 1. Install dependencies

```bash
npm install @chettapay/react-native @chettapay/core
```

---

## 2. Get your API key

1. Go to the [ChettaPay Dashboard](https://chettapay.vercel.app)
2. Create a new application (or select an existing one)
3. Copy your **publishable API key** from the Settings page

| Key prefix        | Network | Environment |
|-------------------|---------|-------------|
| `pub_testnet_`    | Testnet | Development |
| `pub_mainnet_`    | Mainnet | Production  |

> **Note:** Publishable keys are safe to include in your frontend code. Never expose secret keys (`sec_*`) in client-side code.

---

## 3. Configure your app

Wrap your root component with `ChettaPayProvider` and pass your API key:

```tsx
import { ChettaPayProvider } from '@chettapay/react-native';

export default function App() {
  return (
    <ChettaPayProvider
      config={{
        apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',  // ← Your key here
        stellarNetwork: 'testnet',
      }}
    >
      <MyApp />
    </ChettaPayProvider>
  );
}
```

### Configuration options

| Option           | Type     | Default                        | Description                     |
|------------------|----------|--------------------------------|---------------------------------|
| `apiKey`         | `string` | —                              | **Required.** Your ChettaPay key.  |
| `stellarNetwork` | `string` | `'testnet'`                    | `'testnet'` or `'mainnet'`.     |
| `baseUrl`        | `string` | `'https://chettapay-api.vercel.app'` | Override the API base URL.      |

### Style overrides (optional)

You can override styles locally. These merge with the remote config from the Dashboard:

```tsx
<ChettaPayProvider
  config={{ apiKey: '...' }}
  styles={{
    theme: 'dark',                     // 'light' or 'dark'
    accentColor: '#4f46e5',            // Primary button color
    emailEnabled: true,                // Enable email OTP login
    embeddedWallets: true,             // Enable embedded wallet creation
    providers: {
      google: true,
      github: true,
      discord: false,
      x: false,
      apple: false,
    },
  }}
>
```

---

## 4. Add the WalletButton

The fastest way to get authentication working:

```tsx
import { WalletButton } from '@chettapay/react-native';

function HomeScreen() {
  return <WalletButton />;
}
```

This renders a button that:
- Opens the **login modal** when the user is not authenticated
- Shows the **wallet address** with a dropdown menu when authenticated

---

## 5. Use the `useChettaPay()` hook

Access all SDK features programmatically:

```tsx
import { useChettaPay } from '@chettapay/react-native';

function Dashboard() {
  const {
    isAuthenticated,
    walletAddress,
    login,
    logout,
    buildTx,
    openWalletBalanceModal,
    openTxHistoryModal,
    openKycModal,
    openRampWidget,
    network,
    setNetwork,
  } = useChettaPay();

  return (
    <View>
      {isAuthenticated ? (
        <Text>Connected: {walletAddress}</Text>
      ) : (
        <TouchableOpacity onPress={() => login({ provider: 'google' })}>
          <Text>Sign in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 6. Switch to production

When ready to deploy:

1. Create a **mainnet** API key in the ChettaPay Dashboard
2. Update your config:

```tsx
<ChettaPayProvider
  config={{
    apiKey: 'pub_mainnet_xxxxxxxxxxxxxxxxxxxx',
    stellarNetwork: 'mainnet',
  }}
>
```

---

## Building from source (monorepo)

If you are developing the SDK itself:

```bash
# 1. Install all monorepo dependencies
cd chettapay/
npm install

# 2. Build the core package first
cd packages/core
npm run build

# 3. Build the react-native package
cd ../react-native
npm run build

# 4. Push to local consumers via yalc
npx yalc push
```

Then in your consumer app:

```bash
npx yalc add @chettapay/core @chettapay/react-native
npm install
```

> **Important:** After making changes to core packages, always clear the Metro bundler cache:
> ```bash
> npm start -- -c
> ```
