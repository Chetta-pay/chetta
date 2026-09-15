import type { InteractiveAuthAdapter } from '@chettapay/core';
import type { ChettaPayPrivyConfig } from './config';
import { buildPrivyAdapter, type PrivyAdapterHandle } from './runtime';

/**
 * Maps the public adapter back to its internal handle (with `_attachRuntime` and
 * `config`), so a platform bridge/provider can wire Privy's runtime into it
 * without exposing those internals on the adapter's public type.
 */
const handlesByAdapter = new WeakMap<InteractiveAuthAdapter, PrivyAdapterHandle>();

/**
 * Create a Privy-backed wallet adapter for `@chettapay/core`. Platform-agnostic; the
 * returned adapter is inert until a platform provider (web `PrivyAdapterProvider`
 * or the Expo one) mounts and attaches Privy's runtime. See each entry point.
 */
export function createPrivyAdapter(config: ChettaPayPrivyConfig): InteractiveAuthAdapter {
  const handle = buildPrivyAdapter(config);
  handlesByAdapter.set(handle, handle);
  return handle;
}

/** Recover the internal handle for an adapter created by {@link createPrivyAdapter}. */
export function getPrivyHandle(adapter: InteractiveAuthAdapter): PrivyAdapterHandle | undefined {
  return handlesByAdapter.get(adapter);
}
