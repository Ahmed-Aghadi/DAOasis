import Login from "@/components/Login";
import styles from "@/styles/Login.module.css";
import Head from "next/head";
import RegistrationForm from "@/components/RegistrationForm";
import {Divider, Text} from "@mantine/core";
import ChainSelect from "@/components/ChainSelect";

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>DAOasis - Login</title>
            </Head>
            <div className={styles.bg}>
                <div className={styles.holder}>
                    <Text size={35} my={"md"}>
                        Welcome to DAOasis
                    </Text>
                    <ChainSelect/>
                    <div style={{width: "50%"}}>
                        <Divider my="xs" variant={"solid"} labelPosition="center"/>
                    </div>
                    <RegistrationForm/>
                    <div style={{width: "50%"}}>
                        <Divider my="xs" label="OR" variant={"solid"} labelPosition="center"/>
                    </div>
                    <Login/>
                </div>
            </div>
        </>
    )
}