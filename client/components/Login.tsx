import SafeAuthContext from "@/contexts/SafeAuthContext";
import { SafeAuthKit, SafeAuthProviderType } from "@safe-global/auth-kit";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { useContext } from "react";

export default function Login() {
    const ctx = useContext(SafeAuthContext);
    const login = async () => {
        if (!ctx.safeAuth) return;

        const response = await ctx.safeAuth.signIn();
        console.log("SIGN IN RESPONSE: ", response);

        ctx.setSafeAuthSignInResponse(response);
        ctx.setProvider(ctx.safeAuth.getProvider() as SafeEventEmitterProvider);
    };
    return <button onClick={() => login()}>Login</button>;
}
