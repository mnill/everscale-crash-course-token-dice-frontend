import {Address, hasEverscaleProvider, ProviderRpcClient} from 'everscale-inpage-provider';
import React, {createContext, useCallback, useEffect, useState} from 'react';

export const ever = new ProviderRpcClient();
window.ever = ever;
window.Address = Address;
export const targetNetworkId = 2;

export const TokenDiceContractAddress = new Address("0:bcb9c806c30813c1ab1faf4ae6cae2f3b64c2cee75ff32c8760a534bae0da903");
export const TokenRootContractAddress = new Address("0:e56ffdc692d7fa68534bab03e62e13fc2fb7b2be8aff1da94fdbf580290eb952");

const InitialState = {
    isInitializing: true,
    hasProvider: false,
    selectedNetworkId: 1,
    account: undefined,
    login: () => null,
    logout: () => null
}

export const EverWalletContext = createContext(InitialState);
export function EverWalletProvider({children}) {
    const [account, setAccount] = useState(undefined);
    const [hasProvider, setHasProvider] = useState(false);
    const [selectedNetworkId, setSelectedNetworkId] = useState(1);
    const [isInitializing, setIsInitializing] = useState(true);

    const [isConnectingInProgress, setIsConnectingInProgress] = useState(false);

    // Initializing
    useEffect(() => {
        const initPipeline = async () => {
            // Check is we have provider
            const hasProvider = await hasEverscaleProvider();
            if (!hasProvider) {
                setIsInitializing(false);
                return;
            }

            await ever.ensureInitialized();

            // Subscribe for account connected
            const permissionsSubscriber = await ever.subscribe('permissionsChanged');
            permissionsSubscriber.on('data', (event) => {
                setAccount(event.permissions.accountInteraction);
            });

            // Subscribe for network change
            const networkSubscriber = await ever.subscribe('networkChanged');
            networkSubscriber.on('data', (event) => {
                setSelectedNetworkId(event.networkId);
            });

            // Get current state
            const currentProviderState = await ever.getProviderState();
            // Current networkId
            setSelectedNetworkId(currentProviderState.networkId);
            // Current account, can be undefined.
            setAccount(currentProviderState.permissions.accountInteraction);
            // Yes we have provider
            setHasProvider(true);
            // Initialized;
            setIsInitializing(false);
        };

        initPipeline().catch((err) => {
            console.log(`Ever wallet init error`, err);
        });
    }, []);

    const login = useCallback(async () => {
        if (hasProvider && !isConnectingInProgress) {
            setIsConnectingInProgress(true);
            try {
                await ever.ensureInitialized();
                await ever.requestPermissions({
                    permissions: ['basic', 'accountInteraction'],
                });
            } catch (e) {
                console.log('Connecting error', e);
            }
            setIsConnectingInProgress(false);
        }
    }, [hasProvider, isConnectingInProgress]);

    const logout = useCallback(async () => {
        await ever.disconnect();
    }, []);

    return <EverWalletContext.Provider value={{
        isInitializing,
        isConnected: !isInitializing && !!account && selectedNetworkId === targetNetworkId,
        hasProvider,
        selectedNetworkId,
        account,
        login,
        logout
    }}>
        {children}
    </EverWalletContext.Provider>
}