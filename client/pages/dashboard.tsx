import {Layout} from "@/components/Layout";
import {useContext, useState} from "react";
import Head from "next/head";
import {Button, Container, Grid, Group, Modal, Paper, SimpleGrid, Skeleton, Title} from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import {ethers} from "ethers";
import {EtherscanProvider} from "@ethersproject/providers";
import {intNumberFromHexString} from "@coinbase/wallet-sdk/dist/util";
import Overview from "@/components/Overview";

export default function Dashboard() {
    const [modalOpened, setModalOpened] = useState(false);
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
            <CreateSafeForm/>
        </Modal>
    );

    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <SimpleGrid cols={2}>
                <Overview/>
                <Paper>
                    Hello
                </Paper>
            </SimpleGrid>
        </Layout>
    );
}
// <Title>Dashboard</Title>
// <Group position="center">
//     <Button onClick={open}>Create Safe </Button>
// </Group>
// {modal}
