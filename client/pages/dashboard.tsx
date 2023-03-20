import {Layout} from "@/components/Layout";
import {useContext, useState} from "react";
import Head from "next/head";
import {Button, Center, Container, Grid, Group, Modal, Paper, SimpleGrid, Skeleton, Title} from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import {ethers} from "ethers";
import {EtherscanProvider} from "@ethersproject/providers";
import {intNumberFromHexString} from "@coinbase/wallet-sdk/dist/util";
import Overview from "@/components/Overview";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import SafesOverview from "@/components/SafesOverview";

export default function Dashboard() {

    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <Center>
                <SimpleGrid cols={2} sx={{width: "85%"}}
                            breakpoints={[
                                {maxWidth: 600, cols: 1},
                                {maxWidth: 900, cols: 2},
                            ]}
                >
                    <Overview />
                    <SafesOverview />
                </SimpleGrid>
            </Center>
        </Layout>
    );
}
// <Title>Dashboard</Title>
// <Group position="center">
//     <Button onClick={open}>Create Safe </Button>
// </Group>
// {modal}
