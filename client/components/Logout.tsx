import SafeAuthContext from "@/context/SafeAuthContext";
import { SafeAuthKit, SafeAuthProviderType } from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { useContext } from "react";

export default function Logout() {
    const ctx = useContext(SafeAuthContext);

    const logout = async () => {
        if (!ctx.safeAuth) return;

        await ctx.safeAuth.signOut();

        ctx.setProvider(null);
        ctx.setSafeAuthSignInResponse(null);
    };
    return <button onClick={() => logout()}>Logout</button>;
}
