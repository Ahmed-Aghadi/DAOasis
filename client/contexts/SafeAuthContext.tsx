import {
    SafeAuthKit,
    SafeAuthProviderType,
    SafeAuthSignInData,
} from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import React, { useEffect, useState } from "react";
import {getRpc} from "@/lib/getRpc";

const SafeAuthContext = React.createContext({
    safeAuth: undefined as SafeAuthKit | undefined,
    setSafeAuth: (safeAuth: SafeAuthKit | undefined) => {},
    provider: null as SafeEventEmitterProvider | null,
    setProvider: (provider: SafeEventEmitterProvider | null) => {},
    safeAuthSignInResponse: null as SafeAuthSignInData | null,
    setChainId: (chainId: string) => {},
    setSafeAuthSignInResponse: (
        safeAuthSignInResponse: SafeAuthSignInData | null
    ) => {},
});

export const SafeAuthContextProvider = (props: any) => {
    const [safeAuth, setSafeAuth] = useState<SafeAuthKit>();
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
        null
    );
    const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
        useState<SafeAuthSignInData | null>(null);
    const [chainId, setChainId] = useState("0x13881");

    useEffect(() => {
        (async () => {
            console.log("CHAIN ID", chainId)
            const rpc = getRpc(chainId);
            console.log("INITIALIZING SAFE AUTH KIT");
            const data = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
                chainId: chainId,
                txServiceUrl: "https://safe-transaction-goerli.safe.global", // Optional. Only if want to retrieve related safes
                authProviderConfig: {
                    rpcTarget: rpc,
                    clientId:
                        "BPw_nSO-LJembIhBHn-ga0hDG0LBSC0TBIuY7jNXdcKrp_QnKkx35bjcxSFLo5U-DkdkoRn08QNnGx9zY94m9Gg",
                    network: "testnet",
                    theme: "light",
                },
            });
            console.log("INITIALIZED SAFE AUTH KIT", data);
            setSafeAuth(data);
        })();
    }, [chainId]);
    return (
        <SafeAuthContext.Provider
            value={{
                safeAuth,
                setSafeAuth: (data) => {
                    console.log("SETTING SAFE AUTH", data);
                    setSafeAuth(data);
                },
                provider,
                setProvider,
                safeAuthSignInResponse,
                setSafeAuthSignInResponse,
                setChainId
            }}
        >
            {props.children}
        </SafeAuthContext.Provider>
    );
};

export default SafeAuthContext;
