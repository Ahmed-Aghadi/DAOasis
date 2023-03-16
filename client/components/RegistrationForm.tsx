import {useForm} from "@mantine/form";
import {Paper, rem, TextInput} from "@mantine/core";
import React, {useContext} from "react";
import {loginStyles} from "@/styles/login.styles";
import {notifications} from "@mantine/notifications";
import {SafeEventEmitterProvider} from "@web3auth/base";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {createProfile, updateProfile} from "@/lib/polybase";
import {useRouter} from "next/router";

export default function RegistrationForm() {
    const {classes} = loginStyles();
    const router = useRouter();
    const ctx = useContext(SafeAuthContext);
    const form = useForm({
        initialValues: {
            name: "",
        }
    })

    const register = async () => {
        if (!ctx.safeAuth) return;
        notifications.show({
            id: "login",
            title: "Registering...",
            message: "Please wait...",
            autoClose: false,
            loading: true,
        })
        try {
            const response = await ctx.safeAuth.signIn();
            console.log("SIGN IN RESPONSE: ", response);
            const {eoa} = response;
            let createRes
            createRes = await createProfile({id: eoa as `0x${string}`})
            console.log("CREATE PROFILE RESPONSE: ", createRes);
            createRes = await updateProfile({id: eoa as `0x${string}`, name: form.values.name})
            console.log("UPDATE PROFILE RESPONSE: ", createRes);

            ctx.setSafeAuthSignInResponse(response);
            ctx.setProvider(ctx.safeAuth.getProvider() as SafeEventEmitterProvider);
            notifications.update({
                id: "login",
                title: "Register",
                message: "You are now registered",
                autoClose: true,
                color: "green",
            })
            router.push("/dashboard")
        } catch (e) {
            console.log("SIGN IN ERROR: ", e);
            notifications.update({
                id: "login",
                title: "Error registering",
                message: "Please try again",
                autoClose: true,
                color: "red",
            })
        }
    };

    return (
        <Paper sx={{width: rem(350)}}>
            <form className={classes.registrationForm} onSubmit={form.onSubmit(() => register())}>
                <TextInput
                    withAsterisk
                    label="Name"
                    placeholder="John Doe"
                    required
                    size="md"
                    mb="md"
                    sx={{width: "100%"}}
                    {...form.getInputProps('name')}
                />
                <button className={classes.loginBtn} type="submit">Register</button>
            </form>
        </Paper>
    )
}