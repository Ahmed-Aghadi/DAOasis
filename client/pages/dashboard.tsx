import {Layout} from "@/components/Layout";
import {useState} from "react";
import Head from "next/head";
import {Button, Group, Modal} from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";

export default function Dashboard() {
    const [modalOpened, setModalOpened] = useState(false)

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
                <Button onClick={open}>Create Safe </Button>
            </Group>
            {modal}
        </Layout>
    )
}