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
} from "@/contexts/SafeAuthContext";

export default function App({ Component, pageProps }: AppProps) {
    const ctx = useContext(SafeAuthContext);


    return (
        <SafeAuthContextProvider>
            <Component {...pageProps} />
        </SafeAuthContextProvider>
    );
}
