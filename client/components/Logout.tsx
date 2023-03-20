import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";
import { Button } from "@mantine/core";

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
