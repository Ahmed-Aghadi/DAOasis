import {
    SafeAuthKit,
    SafeAuthProviderType,
    SafeAuthSignInData,
} from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import React, { useEffect, useState } from "react";
import { getRpc } from "@/lib/getRpc";
import {getProfile} from "@/lib/polybase";

const SafeAuthContext = React.createContext({
    loading: true,
    setLoading: (loading: boolean) => {},
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
    const [loading, setLoading] = useState(true);
    const [safeAuth, setSafeAuth] = useState<SafeAuthKit>();
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
        null
    );
    const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
        useState<SafeAuthSignInData | null>(null);
    const [chainId, setChainId] = useState("0x13881");

    useEffect(() => {
        if (!sessionStorage.getItem("safeAuthSignInResponse")) {
            setLoading(false);
            return;
        }
        const data = JSON.parse(sessionStorage.getItem("safeAuthSignInResponse")!)
        setChainId(data.chainId);
        setSafeAuthSignInResponse(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if(loading) return;
        (async () => {
            console.log("CHAIN ID", chainId);
            const rpc = getRpc(chainId);
            console.log("INITIALIZING SAFE AUTH KIT");
            const data = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
                chainId: chainId,
                txServiceUrl: "https://safe-transaction-goerli.safe.global",
                authProviderConfig: {
                    rpcTarget: rpc,
                    clientId:
                        "BPw_nSO-LJembIhBHn-ga0hDG0LBSC0TBIuY7jNXdcKrp_QnKkx35bjcxSFLo5U-DkdkoRn08QNnGx9zY94m9Gg",
                    network: "testnet",
                    theme: "light",
                },
            });
            console.log("INITIALIZED SAFE AUTH KIT", data);
            if(safeAuthSignInResponse?.eoa){
                console.log(safeAuthSignInResponse, "ahmed ki shanti ke liye")
                const response = await data!.signIn()
                sessionStorage.setItem(
                    "safeAuthSignInResponse",
                    JSON.stringify(response)
                );
                console.log("SIGN IN RESPONSE: ", response);
                const { eoa } = response as { eoa: `0x${string}` };
                const profile = await getProfile(eoa);
                console.log("PROFILE: ", profile);

                setSafeAuthSignInResponse(response);
                setProvider(
                    data!.getProvider() as SafeEventEmitterProvider
                );
            }
            setSafeAuth(data);
        })();
    }, [chainId,loading]);


    return (
        <SafeAuthContext.Provider
            value={{
                loading,
                setLoading,
                safeAuth,
                setSafeAuth: (data) => {
                    console.log("SETTING SAFE AUTH", data);
                    setSafeAuth(data);
                },
                provider,
                setProvider,
                safeAuthSignInResponse,
                setSafeAuthSignInResponse,
                setChainId,
                // login,
                // logout,
            }}
        >
            {props.children}
        </SafeAuthContext.Provider>
    );
};

export default SafeAuthContext;
