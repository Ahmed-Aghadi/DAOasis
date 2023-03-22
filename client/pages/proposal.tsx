import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Anchor, Avatar, Breadcrumbs, Center, Group, Paper, Tabs, Text, Title} from "@mantine/core";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getMultiSigProposal} from "@/lib/polybase";
import {StyledTabs} from "@/components/StyledTabs";
import ViewReply from "@/components/ViewReply";

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

    console.log("proposalData", proposalData)

    const items = [
        {title: `${router.query?.name}`, href: `/safe?address=${proposalData?.multiSigId}`},
        {title: proposalData?.title, href: `/proposal?id=${proposalData?.id}&name=${router.query.name}`},
    ].map((item, index) => (
        <Anchor href={item.href} key={index}>
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
            <Title>{proposalData?.title}</Title>
            <Text>{proposalData?.description}</Text>
            <StyledTabs defaultValue="discussions">
                <Tabs.List my={"md"}>
                    <Tabs.Tab value="discussions">Discussions</Tabs.Tab>
                    <Tabs.Tab value="proposals">Contract Proposal</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value={"discussions"}>
                    {
                        proposalData?.replies.map(reply => (
                            <ViewReply collectionId={reply.collectionId} id={reply.id} />
                        ))
                    }
                </Tabs.Panel>
            </StyledTabs>
        </Layout>
    )
}