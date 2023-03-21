import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Center, Paper} from "@mantine/core";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getMultiSigProposal} from "@/lib/polybase";

interface ProposalData {
    createdAt: string;
    description: string;
    id: string;
    title: string;
    multiSigId: string;
    replies: {
        collectionId: string;
        id: string;
    }[]
}

export default function Home() {
    const router = useRouter();
    const [proposalData, setProposalData] = useState<ProposalData>()

    useEffect(() => {
        if (!router.query.id) return;
        getMultiSigProposal(router.query.id as string).then((data) => {
            setProposalData(data.response.data)
        })
    }, [router.query])


    return (
        <Layout>
            <Head>
                <title>Create Proposal</title>
            </Head>
            <Center>
                <Paper>
                    Hola
                </Paper>
            </Center>
        </Layout>
    )
}