import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Anchor, Avatar, Breadcrumbs, Center, Group, Paper, Tabs, Text, Title} from "@mantine/core";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {getMultiSigProposal} from "@/lib/polybase";
import {StyledTabs} from "@/components/StyledTabs";
import ViewReply from "@/components/ViewReply";
import CreateProposalTxn from "@/components/CreateProposalTxn";

export type ProposalData = {
    createdAt: string;
    creator: string;
    description: string;
    id: string;
    title: string;
    multiSigId: string;
    replies: {
        collectionId: string;
        id: string;
    }[],
    transactionHash: string;
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

    console.log("proposalData", proposalData)

    const items = [
        {title: `${router.query?.name}`, href: `/safe?address=${proposalData?.multiSigId}`},
        {title: proposalData?.title, href: `/proposal?id=${proposalData?.id}&name=${router.query.name}`},
    ].map((item, index) => (
        <Anchor color="#E599F7" href={item.href} key={index}>
            {item.title}
        </Anchor>
    ))

    return (
        <Layout>
            <Head>
                <title>Create Proposal</title>
            </Head>
            <Breadcrumbs>
                {items}
            </Breadcrumbs>
            <Title color="#AE3EC9">{proposalData?.title}</Title>
            <Text color="#CC5DE8">{proposalData?.description}</Text>
            <StyledTabs defaultValue="discussions">
                <Tabs.List my={"md"}>
                    <Tabs.Tab value="discussions">Discussions</Tabs.Tab>
                    <Tabs.Tab value="proposals">Contract Proposal</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value={"discussions"}>
                    {
                        proposalData?.replies.map((reply, index) => (
                            <ViewReply key={index} collectionId={reply.collectionId} id={reply.id} />
                        ))
                    }
                    {
                        proposalData?.replies.length === 0 && (
                            <Paper my="md" p='md' bg="#e1dbf5" radius="lg">
                                <Text color="#CC5DE8" size="lg">No conversations here yet. Be the first to chat!</Text>
                            </Paper>
                        )
                    }
                </Tabs.Panel>
                <Tabs.Panel value={"proposals"}>
                    <Paper my="md" p='md' bg="#eeebf7" radius="lg">
                        {!proposalData?.transactionHash && <CreateProposalTxn/>}
                        {proposalData?.transactionHash && (
                            <Group spacing="md">
                                <Text color="#CC5DE8" size="lg">Transaction Hash: {proposalData.transactionHash}</Text>
                            </Group>
                        )}
                    </Paper>
                </Tabs.Panel>
            </StyledTabs>
        </Layout>
    )
}