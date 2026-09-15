'use client';

import type { ChettaPayAdapter, SubmitOutcome } from '@chettapay/core';
import { useChettaPay } from './context';

type WrappedAdapter<T extends ChettaPayAdapter> = {
  [K in keyof T]: (params: Parameters<T[K]>[0]) => Promise<SubmitOutcome>;
};

export function createChettaPayAdapterHook<T extends ChettaPayAdapter>(key: string) {
  return function useChettaPayAdapter(): WrappedAdapter<T> {
    const { adapters, signAndSubmitTx } = useChettaPay();
    const adapter = adapters?.[key] as T | undefined;

    if (!adapter) {
      throw new Error(`No adapter "${key}" provided to ChettaPayProvider`);
    }

    return Object.fromEntries(
      Object.entries(adapter).map(([name, fn]) => [
        name,
        async (params: Parameters<typeof fn>[0]) => {
          const { unsignedTransaction } = await fn(params);
          return signAndSubmitTx(unsignedTransaction);
        },
      ]),
    ) as WrappedAdapter<T>;
  };
}
