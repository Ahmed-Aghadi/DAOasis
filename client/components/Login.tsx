import SafeAuthContext from "@/contexts/SafeAuthContext";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { useContext, useEffect, useState } from "react";
import { loginStyles } from "@/styles/login.styles";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { getAllSafe, getProfile } from "@/lib/polybase";
import PolybaseContext, { MultiSig, User } from "@/contexts/PolybaseContext";

export default function Login() {
    const safeContext = useContext(SafeAuthContext);
    const polybaseContext = useContext(PolybaseContext);
    const router = useRouter();
    const { classes } = loginStyles();
    const [loginCalled, setLoginCalled] = useState(false);
    useEffect(() => {
        console.log(loginCalled, polybaseContext.loading, polybaseContext.isProfileExists)
        if (!loginCalled) return;
        if (polybaseContext.loading) return;
        if (polybaseContext.isProfileExists) {
            notifications.update({
                id: "login",
                title: "Logged in",
                message: "You are now logged in",
                autoClose: true,
                color: "green",
            });
            setLoginCalled(false);
            router.push("/dashboard");
        }
        else {
            setLoginCalled(false);
            console.log("PROFILE NOT FOUND");
            // Logout
            (async () => {
                if (!safeContext.safeAuth) return;
                await safeContext.safeAuth.signOut();
                sessionStorage.removeItem("safeAuthSignInResponse");
                sessionStorage.removeItem("provider");
                safeContext.setProvider(null);
                safeContext.setSafeAuthSignInResponse(null);
            })();

            notifications.update({
                id: "login",
                title: "Profile not found",
                message: "Please register first",
                autoClose: true,
                color: "red",
            });
        }
    }, [loginCalled, polybaseContext.loading, polybaseContext.isProfileExists]);
    const login = async () => {
        if (!safeContext.safeAuth) return;
        notifications.show({
            id: "login",
            title: "Logging in...",
            message: "Please wait...",
            autoClose: false,
            loading: true,
        });
        try {
            const response = await safeContext.safeAuth.signIn();
            sessionStorage.setItem(
                "safeAuthSignInResponse",
                JSON.stringify(response)
            );
            console.log("SIGN IN RESPONSE: ", response);
            safeContext.setSafeAuthSignInResponse(response);
            safeContext.setProvider(
                safeContext.safeAuth.getProvider() as SafeEventEmitterProvider
            );
            setLoginCalled(true);
        } catch (e) {
            console.log("SIGN IN ERROR: ", e);
            notifications.update({
                id: "login",
                title: "Error logging in",
                message: "Please try again",
                autoClose: true,
                color: "red",
            });
        }
    };
    return (
        <button className={classes.loginBtn} onClick={() => login()}>
            Login
        </button>
    );
}
