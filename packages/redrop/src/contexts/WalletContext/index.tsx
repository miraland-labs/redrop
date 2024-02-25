import { WalletError } from '@solarti/wallet-adapter-base';
import {
  useWallet,
  WalletProvider as BaseWalletProvider,
  WalletContextState,
} from '@solarti/wallet-adapter-react';
// import {
//   getLedgerWallet,
//   getMathWallet,
//   getQtwareWallet,
//   getSolflareWallet,
//   getSolletWallet,
//   getSolongWallet,
// } from '@solarti/wallet-adapter-wallets';
import { QtwareWalletAdapter } from '@solarti/wallet-adapter-qtware';
import { Button } from 'antd';
import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { notify } from '../../utils/common';
import { MetaplexModal } from '../../components/MetaplexModal';
import { CollapsePanel } from '../../components/CollapsePanel';

export interface WalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

export const WalletModalContext = createContext<WalletModalContextState>(
  {} as WalletModalContextState,
);

export function useWalletModal(): WalletModalContextState {
  return useContext(WalletModalContext);
}

export const WalletModal: FC = () => {
  const { wallets, select } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const close = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  // const qtwareWallet = useMemo(() => getQtwareWallet(), []);
  const qtwareWallet = useMemo(() => new QtwareWalletAdapter(), []);

  return (
    <MetaplexModal title="Connect Wallet" open={visible} onCancel={close}>
      <span
        style={{
          color: 'rgba(255, 255, 255, 0.75)',
          fontSize: '14px',
          lineHeight: '14px',
          fontFamily: 'GraphikWeb',
          letterSpacing: '0.02em',
          marginBottom: 14,
        }}
      >
        RECOMMENDED
      </span>

      <Button
        className="qtware-button metaplex-button"
        onClick={() => {
          console.log(qtwareWallet.name);
          select(qtwareWallet.name);
          close();
        }}
      >
        <img src={qtwareWallet?.icon} style={{ width: '1.2rem' }} />
        &nbsp;Connect to Qtware
      </Button>
      <CollapsePanel id="other-wallets" panelName="Other Wallets">
        {wallets.map((wallet, idx) => {
          if (wallet.adapter.name === 'Qtware') return null;

          return (
            <Button
              key={idx}
              className="metaplex-button w100"
              style={{
                marginBottom: 5,
              }}
              onClick={() => {
                select(wallet.adapter.name);
                close();
              }}
            >
              Connect to {wallet.adapter.name}
            </Button>
          );
        })}
      </CollapsePanel>
    </MetaplexModal>
  );
};

export const WalletModalProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { publicKey } = useWallet();
  const [connected, setConnected] = useState(!!publicKey);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      const keyToDisplay =
        base58.length > 20
          ? `${base58.substring(0, 7)}.....${base58.substring(
              base58.length - 7,
              base58.length,
            )}`
          : base58;

      notify({
        message: 'Wallet update',
        description: 'Connected to wallet ' + keyToDisplay,
      });
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey && connected) {
      notify({
        message: 'Wallet update',
        description: 'Disconnected from wallet',
      });
    }
    setConnected(!!publicKey);
  }, [publicKey, connected, setConnected]);

  return (
    <WalletModalContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
      <WalletModal />
    </WalletModalContext.Provider>
  );
};

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new QtwareWalletAdapter(),
      // getQtwareWallet(),
      // getSolflareWallet(),
      // getLedgerWallet(),
      // getSolongWallet(),
      // getMathWallet(),
      // getSolletWallet(),
    ],
    [],
  );

  const onError = useCallback((error: WalletError) => {
    console.error(error);
    notify({
      message: 'Wallet error',
      description: error.message,
    });
  }, []);

  return (
    <BaseWalletProvider wallets={wallets} onError={onError} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </BaseWalletProvider>
  );
};

export type WalletSigner = Pick<
  WalletContextState,
  'publicKey' | 'signTransaction' | 'signAllTransactions' | 'signMessage'
>;
