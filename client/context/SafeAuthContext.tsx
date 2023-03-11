import { SafeAuthKit, SafeAuthSignInData } from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import React, { useState } from "react";

const SafeAuthContext = React.createContext({
    safeAuth: undefined as SafeAuthKit | undefined,
    setSafeAuth: (safeAuth: SafeAuthKit | undefined) => {},
    provider: null as SafeEventEmitterProvider | null,
    setProvider: (provider: SafeEventEmitterProvider | null) => {},
    safeAuthSignInResponse: null as SafeAuthSignInData | null,
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
    return (
        <SafeAuthContext.Provider
            value={{
                safeAuth,
                setSafeAuth,
                provider,
                setProvider,
                safeAuthSignInResponse,
                setSafeAuthSignInResponse,
            }}
        >
            {props.children}
        </SafeAuthContext.Provider>
    );
};

export default SafeAuthContext;
