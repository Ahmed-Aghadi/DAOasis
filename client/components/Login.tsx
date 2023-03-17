import SafeAuthContext from "@/contexts/SafeAuthContext";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { useContext } from "react";
import { loginStyles } from "@/styles/login.styles";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { getProfile } from "@/lib/polybase";
import PolybaseContext, { User } from "@/contexts/PolybaseContext";

export default function Login() {
    const safeContext = useContext(SafeAuthContext);
    const polybaseContext = useContext(PolybaseContext);
    const router = useRouter();
    const { classes } = loginStyles();
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
            // sessionStorage.setItem(
            //     "provider",
            //     JSON.stringify(ctx.safeAuth.getProvider())
            // );
            console.log("SIGN IN RESPONSE: ", response);
            const { eoa } = response as { eoa: `0x${string}` };
            const profile = await getProfile(eoa);
            console.log("PROFILE: ", profile);
            polybaseContext.setUser(profile.response.data as User);

            safeContext.setSafeAuthSignInResponse(response);
            safeContext.setProvider(
                safeContext.safeAuth.getProvider() as SafeEventEmitterProvider
            );
            notifications.update({
                id: "login",
                title: "Logged in",
                message: "You are now logged in",
                autoClose: true,
                color: "green",
            });
            router.push("/dashboard");
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
