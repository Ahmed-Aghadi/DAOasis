import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {MantineProvider} from '@mantine/core';
import {useContext, useEffect, useState} from "react";
import {SafeEventEmitterProvider} from "@web3auth/base";
import {
    SafeAuthKit,
    SafeAuthProviderType,
    SafeAuthSignInData,
} from "@safe-global/auth-kit";
import SafeAuthContext, {
    SafeAuthContextProvider,
} from "@/contexts/SafeAuthContext";


export default function App({Component, pageProps}: AppProps) {
    const ctx = useContext(SafeAuthContext);


    return (
        <SafeAuthContextProvider>
            <MantineProvider theme={{
                colors: {
                    blueTheme: ["#3304ba", "#fff", "#e1dbf5", "#c4b7eb", "#a793e1"]
                }
            }}>
                <Component {...pageProps} />
            </MantineProvider>
        </SafeAuthContextProvider>
    );
}
