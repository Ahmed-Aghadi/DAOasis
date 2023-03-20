import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";
import {Button, Text} from "@mantine/core";

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
    return <Text onClick={() => logout()}>Logout</Text>;
}
