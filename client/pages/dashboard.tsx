import {Layout} from "@/components/Layout";
import {useContext, useEffect, useState} from "react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {useRouter} from "next/router";
import Head from "next/head";
import {Button, Group, Modal} from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";

export default function Dashboard() {
    const ctx = useContext(SafeAuthContext)
    const router = useRouter()
    const [modalOpened, setModalOpened] = useState(false)

    useEffect(() => {
        if (ctx.safeAuthSignInResponse?.eoa === undefined) router.push("/login")
    }, [ctx])

    const open = () => {
        setModalOpened(true)
    }

    const modal = <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
        <CreateSafeForm/>
    </Modal>

    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <h1>Dashboard</h1>
            <Group position="center">
                <Button onClick={open}>Open modal</Button>
            </Group>
            {modal}
        </Layout>
    )
}