import SafeAuthContext from "@/contexts/SafeAuthContext";
import { SafeAuthKit, SafeAuthProviderType } from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { useContext } from "react";
import {Button} from "@mantine/core";

export default function Logout() {
    const ctx = useContext(SafeAuthContext);

    const logout = async () => {
        if (!ctx.safeAuth) return;
        await ctx.safeAuth.signOut();
        sessionStorage.removeItem("safeAuthSignInResponse");
        sessionStorage.removeItem("provider");
        ctx.setProvider(null);
        ctx.setSafeAuthSignInResponse(null);
    };
    return <Button onClick={() => logout()}>Logout</Button>;
}
