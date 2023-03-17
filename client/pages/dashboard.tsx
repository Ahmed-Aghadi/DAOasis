import { Layout } from "@/components/Layout";
import { useContext, useState } from "react";
import Head from "next/head";
import { Button, Group, Modal } from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";

export default function Dashboard() {
    const [modalOpened, setModalOpened] = useState(false);
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
            <CreateSafeForm />
        </Modal>
    );

    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <h1>Dashboard</h1>
            <button
                onClick={() =>
                    console.log({
                        safeContext,
                        userContext,
                    })
                }
            >
                ConsoleLog
            </button>
            <Group position="center">
                <Button onClick={open}>Create Safe </Button>
            </Group>
            {modal}
        </Layout>
    );
}
