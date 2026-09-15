import { ChettaPayApplicationConfigContent, ChettaPayClientConfig, ChettaPayLoginOptions, chettaPayPaths } from '@chettapay/core';

type ConfigResponse = chettaPayPaths['/applications/config']['get']['responses'][200]['content']['application/json'];
export type ChettaPayConfig = ConfigResponse['content'];

export type ChettaPayStyles = ChettaPayConfig['styles'];

export interface AuthProviderProps {
    config: ChettaPayClientConfig;
    children: React.ReactNode;
}

export interface AuthContextValue {
    session: ChettaPayApplicationConfigContent | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (options: ChettaPayLoginOptions) => void;
    logout: () => Promise<void>;
}

export interface LoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    style?: any; // Replaces className for React Native
    children?: React.ReactNode;
}

export interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
