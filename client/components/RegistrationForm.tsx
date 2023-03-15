import {useForm} from "@mantine/form";
import {Paper, rem, TextInput} from "@mantine/core";
import React from "react";
import {loginStyles} from "@/styles/login.styles";

export default function RegistrationForm(){
    const {classes} = loginStyles();
    const form = useForm({
        initialValues: {
            name: "",
        }
    })

    return (
        <Paper sx={{width: rem(350)}}>
            <form className={classes.registrationForm} onSubmit={form.onSubmit((values) => console.log(values))}>
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