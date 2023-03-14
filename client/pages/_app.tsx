import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {MantineProvider, MantineThemeOverride} from '@mantine/core';
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

const myTheme: MantineThemeOverride = {
    colorScheme: "light",
    colors: {
        blueTheme: [
            "#3304ba",
            "#fff",
            "#e1dbf5",
            "#c4b7eb",
            "#a793e1"
        ]
    }
};


export default function App({Component, pageProps}: AppProps) {
    const ctx = useContext(SafeAuthContext);


    return (
        <SafeAuthContextProvider>
            <MantineProvider theme={myTheme}>
                <Component {...pageProps} />
            </MantineProvider>
        </SafeAuthContextProvider>
    );
}
