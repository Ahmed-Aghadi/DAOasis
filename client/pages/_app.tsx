import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useContext, useEffect, useState } from "react";
import { SafeEventEmitterProvider } from "@web3auth/base";
import {
    SafeAuthKit,
    SafeAuthProviderType,
    SafeAuthSignInData,
} from "@safe-global/auth-kit";
import SafeAuthContext, {
    SafeAuthContextProvider,
} from "@/context/SafeAuthContext";

export default function App({ Component, pageProps }: AppProps) {
    const ctx = useContext(SafeAuthContext);

    useEffect(() => {
        (async () => {
            console.log("INITIALIZING SAFE AUTH KIT");
            const data = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
                chainId: "0x13881",
                txServiceUrl: "https://safe-transaction-goerli.safe.global", // Optional. Only if want to retrieve related safes
                authProviderConfig: {
                    rpcTarget: `https://polygon-mumbai.g.alchemy.com/v2/FhukjFEzDF-wIU2JxA11kGHQhevBg3AB`,
                    clientId:
                        "BPw_nSO-LJembIhBHn-ga0hDG0LBSC0TBIuY7jNXdcKrp_QnKkx35bjcxSFLo5U-DkdkoRn08QNnGx9zY94m9Gg",
                    network: "testnet",
                    theme: "dark",
                },
            });
            console.log("INITIALIZED SAFE AUTH KIT", data);
            ctx.setSafeAuth(data);
        })();
    }, []);

    return (
        <SafeAuthContextProvider>
            <Component {...pageProps} />
        </SafeAuthContextProvider>
    );
}
