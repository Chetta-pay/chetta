import type { EscrowAdapter } from '@chettapay/core';
// Force TS refresh
import { useChettaPay } from './context';

type WrappedAdapter<T extends EscrowAdapter> = {
    [K in keyof T]: (params: Parameters<T[K]>[0]) => Promise<void>;
};

export function createChettaPayAdapterHook<T extends EscrowAdapter>(key: string) {
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
                    await signAndSubmitTx(unsignedTransaction);
                },
            ]),
        ) as WrappedAdapter<T>;
    };
}
