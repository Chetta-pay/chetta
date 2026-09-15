import {
    NetworkState,
    ChettaPayAdapters,
    ChettaPayApplicationConfigContent,
    ChettaPayClient,
    ChettaPayClientConfig,
    ChettaPayLoginOptions,
    StellarNetwork,
    TransactionState,
    TxBuildBody,
    TxHistoryState,
    WalletBalanceState,
    WalletType,
} from '@chettapay/core';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ModalErrorBoundary } from './components/commons';
import { KycModal } from './components/kyc-modal/KycModal';
import { LoginModal } from './components/login-modal/LoginModal';
import { RampWidget } from './components/ramp-widget/RampWidget';
import { TransactionModal } from './components/transaction-modal/TransactionModal';
import { TxHistoryModal } from './components/tx-history-modal/TxHistoryModal';
import { WalletBalanceModal } from './components/wallet-balance-modal/WalletBalanceModal';
import type { ChettaPayConfig, ChettaPayStyles } from './types';

const emptyResponse = {
    application: {
        name: '',
    },
    styles: {},
};

async function fetchRemoteConfig(client: ChettaPayClient): Promise<ChettaPayConfig> {
    const content = await client.getAppConfig();
    return (content as ChettaPayConfig | null) ?? emptyResponse;
}

interface ChettaPayContextValue {
    walletAddress: string;
    getClient: () => ChettaPayClient;
    openLoginModal: () => void;

    isAuthenticated: boolean;
    login: (options: ChettaPayLoginOptions) => void;
    logout: () => void;
    config: ChettaPayConfig;
    styles: ChettaPayStyles;
    // transactions
    openTransactionModal: () => void;
    transaction: TransactionState;
    buildTx: (
        operation: TxBuildBody['operation'],
        params: TxBuildBody['params'],
        options?: TxBuildBody['options'],
    ) => Promise<void>;
    signAndSubmitTx: (unsignedXdr: string) => Promise<void>;
    walletType: WalletType | null;
    // network
    network: StellarNetwork;
    setNetwork: (network: StellarNetwork) => void;
    // wallet balance
    walletBalance: WalletBalanceState;
    refreshBalance: (publicKey?: string) => Promise<void>;
    // kyc
    openKycModal: (options?: {
        country?: string;
        level?: 'basic' | 'intermediate' | 'enhanced';
        onApproved?: () => void;
    }) => void;
    // ramps
    openRampWidget: () => void;
    // tx history
    txHistory: TxHistoryState;
    openTxHistoryModal: () => void;
    // wallet balance
    openWalletBalanceModal: () => void;
    // adapters
    adapters?: ChettaPayAdapters;
}

const ChettaPayContext = createContext<ChettaPayContextValue | null>(null);

interface ChettaPayProviderProps {
    config: ChettaPayClientConfig;
    styles?: ChettaPayStyles;
    adapters?: ChettaPayAdapters;
    children: ReactNode;
}

export function ChettaPayProvider({ config, styles: propStyles, adapters, children }: ChettaPayProviderProps) {
    const [chettaPayClient] = useState<ChettaPayClient>(() => new ChettaPayClient(config));
    const [networkState, setNetworkState] = useState<NetworkState>(() => chettaPayClient.getNetworkState());
    const [sessionState, setSessionState] = useState<ChettaPayApplicationConfigContent | null>(null);
    const [transaction, setTransaction] = useState<TransactionState>({ step: 'idle' });
    const [txHistory, setTxHistory] = useState<TxHistoryState>({ step: 'idle' });
    const [walletBalance, setWalletBalance] = useState<WalletBalanceState>({ step: 'idle' });
    const [remoteConfig, setRemoteConfig] = useState<ChettaPayConfig>(emptyResponse);
    const [styles, setStyles] = useState<ChettaPayStyles>(propStyles ?? {});

    useEffect(() => {
        return chettaPayClient.onTransactionStateChange(setTransaction);
    }, [chettaPayClient]);

    useEffect(() => {
        return chettaPayClient.onTxHistoryStateChange(setTxHistory);
    }, [chettaPayClient]);

    useEffect(() => {
        return chettaPayClient.onWalletBalanceStateChange(setWalletBalance);
    }, [chettaPayClient]);

    useEffect(() => {
        return chettaPayClient.onNetworkStateChange((state) => {
            setNetworkState(state);
        });
    }, [chettaPayClient]);

    useEffect(() => {
        return chettaPayClient.onAuthStateChange((authState) => {
            if (authState.step === 'authenticated') {
                setSessionState((prev) => (JSON.stringify(prev) !== JSON.stringify(authState.session) ? authState.session : prev));
            } else if (authState.step === 'idle') {
                setSessionState(null);
            }
        });
    }, [chettaPayClient]);

    useEffect(() => {
        fetchRemoteConfig(chettaPayClient)
            .then((fetched) => {
                setRemoteConfig(fetched);
                setStyles({
                    ...fetched.styles,
                    ...propStyles,
                    providers: { ...fetched.styles?.providers, ...propStyles?.providers },
                });
            })
            .catch(() => {
                setStyles(propStyles ?? {});
            });
    }, [chettaPayClient]);

    useEffect(() => {
        if (transaction.step !== 'idle') {
            setTransactionModalOpen(true);
        }
    }, [transaction.step]);

    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [kycModalOpen, setKycModalOpen] = useState(false);
    const [kycModalOptions, setKycModalOptions] = useState<{
        country?: string;
        level?: 'basic' | 'intermediate' | 'enhanced';
        onApproved?: () => void;
    }>({});
    const [rampWidgetOpen, setRampWidgetOpen] = useState(false);
    const [txHistoryModalOpen, setTxHistoryModalOpen] = useState(false);
    const [walletBalanceModalOpen, setWalletBalanceModalOpen] = useState(false);

    const contextValue: ChettaPayContextValue = useMemo(
        () =>
            ({
                walletAddress: sessionState?.data?.providers?.wallet?.address || sessionState?.wallet?.publicKey || '',
                getClient: () => chettaPayClient,
                transaction,
                login: (options: ChettaPayLoginOptions) => chettaPayClient.login(options),
                logout: () => chettaPayClient.logout(),
                isAuthenticated: !!sessionState?.wallet?.publicKey,
                buildTx: (operation, params, options) => chettaPayClient.buildTx(operation, params, options),
                signAndSubmitTx: (unsignedXdr: string) => chettaPayClient.signAndSubmitTx(unsignedXdr),
                walletType: chettaPayClient.getWalletType(),
                openTransactionModal: () => setTransactionModalOpen(true),
                openLoginModal: () => setLoginModalOpen(true),
                openKycModal: (options = {}) => {
                    setKycModalOptions(options);
                    setKycModalOpen(true);
                },
                openRampWidget: () => setRampWidgetOpen(true),
                txHistory,
                openTxHistoryModal: () => setTxHistoryModalOpen(true),
                openWalletBalanceModal: () => setWalletBalanceModalOpen(true),
                walletBalance,
                refreshBalance: (publicKey?: string) => chettaPayClient.refreshBalance(publicKey),
                network: networkState.step === 'connected' ? networkState.network : 'testnet',
                setNetwork: (network: StellarNetwork) => chettaPayClient.setNetwork(network),
                config: remoteConfig,
                styles,
                adapters,
            }) as ChettaPayContextValue,
        [sessionState, remoteConfig, styles, chettaPayClient, transaction, txHistory, networkState, walletBalance],
    );

    return (
        <ChettaPayContext.Provider value={contextValue}>
            {children}
            {loginModalOpen && (
                <ModalErrorBoundary onClose={() => setLoginModalOpen(false)}>
                    <LoginModal onClose={() => setLoginModalOpen(false)} />
                </ModalErrorBoundary>
            )}
            {transactionModalOpen && (
                <ModalErrorBoundary onClose={() => setTransactionModalOpen(false)}>
                    <TransactionModal onClose={() => setTransactionModalOpen(false)} />
                </ModalErrorBoundary>
            )}
            {kycModalOpen && (
                <ModalErrorBoundary onClose={() => setKycModalOpen(false)}>
                    <KycModal
                        onClose={() => setKycModalOpen(false)}
                        {...(kycModalOptions.country !== undefined && { country: kycModalOptions.country })}
                        {...(kycModalOptions.level !== undefined && { level: kycModalOptions.level })}
                        {...(kycModalOptions.onApproved !== undefined && { onApproved: kycModalOptions.onApproved })}
                    />
                </ModalErrorBoundary>
            )}
            {rampWidgetOpen && (
                <ModalErrorBoundary onClose={() => setRampWidgetOpen(false)}>
                    <RampWidget onClose={() => setRampWidgetOpen(false)} />
                </ModalErrorBoundary>
            )}
            {txHistoryModalOpen && (
                <ModalErrorBoundary onClose={() => setTxHistoryModalOpen(false)}>
                    <TxHistoryModal onClose={() => setTxHistoryModalOpen(false)} />
                </ModalErrorBoundary>
            )}
            {walletBalanceModalOpen && (
                <ModalErrorBoundary onClose={() => setWalletBalanceModalOpen(false)}>
                    <WalletBalanceModal onClose={() => setWalletBalanceModalOpen(false)} />
                </ModalErrorBoundary>
            )}
        </ChettaPayContext.Provider>
    );
}

export function useChettaPay() {
    const ctx = useContext(ChettaPayContext);
    if (!ctx) {
        throw new Error('useChettaPay must be used inside <ChettaPayProvider>');
    }
    return ctx;
}
