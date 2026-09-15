/**
 * Every string on the page, in one place, so copy edits and a Spanish
 * translation never mean touching layout code.
 *
 * Grounding rule for anything added here: a claim must be true of this
 * repository. The reference site this page is modelled on leads with traction
 * numbers (apps launched, wallets created, npm downloads) and a "battle-tested
 * in production" badge. Those are that company's figures, not ours, so `facts`
 * below carries verifiable properties of the SDK instead, and `PLACEHOLDER_STATS`
 * is where real numbers go once they exist.
 */

export const GITHUB = 'https://github.com/Chetta-pay/chetta';
export const DOCS = 'https://chettapay-docs.vercel.app';
export const DASHBOARD = 'https://chettapay-dashboard.vercel.app';
export const CONTACT = 'hello@chettapay.com';

export const nav = [
  { label: 'How it works', href: '#how' },
  { label: 'Chains', href: '#chains' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: DOCS },
];

export const hero = {
  eyebrow: 'Stellar · Solana',
  title: 'From npm install to taking payments on mainnet.',
  lede: 'ChettaPay orchestrates embedded wallets, local ramps and multichain payments behind one SDK. Your users pay without ever learning crypto.',
  primary: { label: 'Read the quickstart', href: `${DOCS}/docs/getting-started/quickstart` },
  secondary: { label: 'View on GitHub', href: GITHUB },
  note: 'Apache-2.0. Test on testnet with nothing but an API key.',
};

/** Verifiable from the source tree - not traction claims. */
export const facts = [
  { value: '2', label: 'chains live', sub: 'Stellar and Solana' },
  { value: '7', label: 'packages', sub: 'core, react, react-native, 4 adapters' },
  { value: '6', label: 'ways to sign in', sub: 'social, email, passkey, wallets' },
  { value: 'RFC 9449', label: 'DPoP-bound sessions', sub: 'stolen tokens are inert' },
];

/**
 * Replace `facts` with these once the numbers are real - the layout takes
 * either shape. Left empty on purpose: shipping invented traction is worse
 * than shipping none.
 */
export const PLACEHOLDER_STATS: typeof facts = [];

export const problem = {
  title: 'Payment infrastructure was not built for you.',
  lede: 'Three walls sit between a working prototype and taking real money.',
  cards: [
    {
      title: 'Access',
      body: 'Global providers want corporate KYB, order forms and a sales call. Build without an incorporated company and you are out before you start.',
    },
    {
      title: 'Onboarding',
      body: 'Asking someone to fund a gas token before their first payment loses them. Seed phrases, reserves and trustlines are your problem, not theirs.',
    },
    {
      title: 'Settlement',
      body: 'The ramps that do exist settle on a chain your app does not live on, and bridging it yourself means custody you did not sign up for.',
    },
  ],
};

export const solution = {
  eyebrow: 'The orchestrator',
  title: 'One integration, three layers solved.',
  cards: [
    {
      title: 'Sign-in without friction',
      body: 'Google, GitHub, email OTP, passkeys, or an external wallet the user already owns. Sessions are DPoP-bound to a keypair that never leaves the device, so a leaked token is useless on its own.',
      meta: 'Google · GitHub · Email · Passkey · Freighter · Albedo · Phantom · Solflare · Backpack',
    },
    {
      title: 'Wallet lifecycle, handled',
      body: 'Creation, activation, per-chain setup and fee sponsorship run behind the SDK. Immediate, Deferred and Manual funding modes decide when the activation cost is actually spent.',
      meta: 'Stellar reserves and trustlines · Solana token accounts and rent',
    },
    {
      title: 'Payments, ramps and swaps',
      body: 'Send, receive, transaction history, KYC, fiat on/off ramps, multi-venue swaps and earn, as pre-built React and React Native components or as plain client calls.',
      meta: 'Drop-in modals, or bring your own UI',
    },
  ],
};

export const how = {
  title: 'Zero to production in minutes.',
  lede: 'SDK, relay and dashboard in a single flow.',
  steps: [
    { n: '01', title: 'Integrate once', body: 'Install @chettapay/react and pass your API key.', time: '~5 min' },
    {
      n: '02',
      title: 'The user signs in',
      body: 'Social, email, passkey or an external wallet, per your config.',
      time: '~3 sec',
    },
    {
      n: '03',
      title: 'Lifecycle orchestration',
      body: 'ChettaPay applies your funding mode and policy, creates the wallet on the chosen chain and readies it to pay.',
      time: '~2 sec',
    },
    {
      n: '04',
      title: 'The user pays',
      body: 'Value moves without keys, reserves or fee sponsorship ever surfacing.',
      time: 'immediately',
    },
  ],
};

export const code = {
  title: 'Integration example',
  lede: 'One provider at the root. Everything else is a hook.',
  snippet: `import { ChettaPayProvider, WalletButton } from '@chettapay/react';

export default function Layout({ children }) {
  return (
    <ChettaPayProvider
      client={{
        apiKey: process.env.NEXT_PUBLIC_CHETTAPAY_API_KEY!,
        stellarNetwork: 'testnet',
      }}
    >
      <WalletButton />
      {children}
    </ChettaPayProvider>
  );
}`,
  footnote: 'Follow the quickstart, or read the full API reference for funding modes and adapters.',
  mcp: 'Building with AI agents? There is an MCP gateway documented in the SDK reference.',
};

export const chains = {
  title: 'Chains',
  lede: 'One integration; pick the chain per app from the dashboard. The SDK resolves each chain’s lifecycle internally.',
  rows: [
    {
      name: 'Stellar',
      status: 'Available',
      detail: 'Trustlines and reserves, managed for you. SEP-10 and SEP-53 ownership proofs.',
    },
    {
      name: 'Solana',
      status: 'Available',
      detail: 'Token accounts and rent, managed for you. SIWS login via the Wallet Standard.',
    },
    { name: 'Polygon', status: 'Planned', detail: 'Gas and allowances, once available.' },
  ],
};

export const useCases = {
  title: 'What teams build with it',
  cards: [
    {
      title: 'Consumer payment apps',
      body: 'Onboard with a social login and enable a first stablecoin payment without asking anyone to buy a gas token first.',
      example: 'Remittance app',
    },
    {
      title: 'KYC-gated products',
      body: 'Use Deferred funding so wallets activate only on real conversion — KYC approved, or first deposit — instead of burning budget on inactive signups.',
      example: 'Fintech funnel',
    },
    {
      title: 'Multichain products',
      body: 'Give one identity a wallet on Stellar and another on Solana, while staying compatible with users who bring an external wallet.',
      example: 'Cross-chain marketplace',
    },
  ],
};

export const pricing = {
  title: 'Pricing',
  lede: 'The SDK is free and open source. Fill in your commercial terms before launch.',
  cards: [
    { title: 'SDK', price: 'Free', body: 'Apache-2.0 licensed. Integrate and test without paying anything.' },
    {
      title: 'Per transaction',
      price: 'TBD',
      body: 'Set your rate here. The reference model is a percentage of processed volume, with no minimums or setup fees.',
    },
    { title: 'Network fees', price: 'At cost', body: 'You cover the chain’s own fees. Nothing is marked up.' },
  ],
  note: 'The "TBD" above is deliberate — put your real pricing in before this page goes live.',
};

export const faq = [
  {
    q: 'Do I need an incorporated company to use ChettaPay?',
    a: 'No. You can start on testnet immediately with just an API key. Mainnet access and its verification requirements are set by the operator of the backend your key belongs to.',
  },
  {
    q: 'Which chains are available today?',
    a: 'Stellar and Solana. Polygon appears in the SDK’s chain types and is planned, not shipped. If you need a specific chain, write to us.',
  },
  {
    q: 'Does the user need to understand crypto before paying?',
    a: 'No. Wallet creation, activation, per-chain setup and fee sponsorship are all abstracted, so the experience matches a conventional app.',
  },
  {
    q: 'Do I write different code for each chain?',
    a: 'No. You integrate once and choose the chain per app. The SDK and relay resolve each chain’s lifecycle internally.',
  },
  {
    q: 'Can I test on testnet first?',
    a: 'Yes. Set the network to testnet in your client config. Every example in this repository defaults to testnet.',
  },
  {
    q: 'What funding modes are supported?',
    a: 'Immediate, Deferred and Manual. They control when the wallet is activated and when the chain’s activation cost — rent on Solana, reserves on Stellar — is actually spent.',
  },
  {
    q: 'How are sessions secured?',
    a: 'Access and refresh tokens are DPoP-bound per RFC 9449, so a stolen token is useless without the session keypair. On web that keypair is non-extractable; on React Native it lives in the Keychain or EncryptedSharedPreferences.',
  },
  {
    q: 'What happens if ChettaPay goes away?',
    a: 'Wallets are real accounts and contracts on their own chain. You keep control of the product and of your lifecycle strategy — there is no lock-in.',
  },
];

export const finalCta = {
  title: 'Ready to take payments on mainnet?',
  lede: 'The payments orchestrator for the builders enterprise infrastructure left out.',
  primary: { label: 'Read the quickstart', href: `${DOCS}/docs/getting-started/quickstart` },
  secondary: { label: 'Browse the source', href: GITHUB },
};

export const footer = {
  pronunciation: 'ChettaPay: chetta, as in the cat that does not wait around.',
  tagline: 'Payments and ramp orchestration for builders. You stay in control.',
  groups: [
    {
      title: 'Product',
      links: [
        { label: 'Documentation', href: DOCS },
        { label: 'Quickstart', href: `${DOCS}/docs/getting-started/quickstart` },
        { label: 'SDK reference', href: `${DOCS}/docs/sdk-reference/chettapay-react` },
        { label: 'Dashboard', href: DASHBOARD },
      ],
    },
    {
      title: 'Open source',
      links: [
        { label: 'GitHub', href: GITHUB },
        { label: 'Changelog', href: `${GITHUB}/blob/main/CHANGELOG.md` },
        { label: 'Upgrade guide', href: `${GITHUB}/blob/main/UPGRADE.md` },
        { label: 'Brand assets', href: `${GITHUB}/tree/main/assets` },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: CONTACT, href: `mailto:${CONTACT}` },
        { label: 'Report an issue', href: `${GITHUB}/issues` },
      ],
    },
  ],
};
