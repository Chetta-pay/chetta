import { chettaPayPaths } from '@chettapay/core';

type ConfigResponse = chettaPayPaths['/applications/config']['get']['responses'][200]['content']['application/json'];
export type ChettaPayConfig = ConfigResponse['content'];

export type ChettaPayStyles = ChettaPayConfig['styles'];

export interface LoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
